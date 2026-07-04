import { countReaderDiagnostic } from "../../services/readerDiagnostics";
import { clamp } from "../../services/readerMath";
import type { ScrollDirection } from "../scrollSnapModel";
import { shouldLetElementHandleInput } from "./inputTarget";
import type { ReaderInputControllerOptions } from "./inputTypes";

/**
 * Attaches accelerated wheel input to the reader.
 *
 * @param options - Shared input controller dependencies.
 * @returns Listener and timer cleanup.
 *
 * @example
 * const cleanup = attachWheelInput(options);
 */
export function attachWheelInput({
	driver,
	getInputSettings,
	resolveImmediateSnapTarget,
	scheduleSnap,
	setDirection,
	target: inputTarget,
	totalScroll,
}: ReaderInputControllerOptions): () => void {
	let accumulatedDelta = 0;
	let burstScore = 0;
	let burstEnergy = 0;
	let direction: ScrollDirection | null = null;
	let frameId: number | null = null;
	let lastEventAt = 0;
	let resetTimer: number | null = null;
	let target: number | null = null;

	const applyAccumulatedWheelInput = (): void => {
		frameId = null;
		if (Math.abs(accumulatedDelta) < 0.01) return;
		const settings = getInputSettings();
		const now = performance.now();
		const nextDirection: ScrollDirection = accumulatedDelta >= 0 ? 1 : -1;
		if (direction !== nextDirection) {
			direction = nextDirection;
			burstScore = 0;
			burstEnergy = 0;
			target = null;
		}
		const elapsed = lastEventAt === 0 ? 0 : now - lastEventAt;
		const normalizedMagnitude = Math.min(Math.abs(accumulatedDelta), 220);
		const retainedBurstScore =
			elapsed === 0 || elapsed < settings.wheelBurstDecayMs
				? burstScore * (1 - elapsed / settings.wheelBurstDecayMs)
				: 0;
		const weightedBurstStep =
			(normalizedMagnitude / settings.wheelBurstCountStepPx) **
			settings.wheelBurstCountMagnitudeExponent;
		burstScore = Math.min(
			settings.wheelBurstCountLimit,
			retainedBurstScore + weightedBurstStep,
		);
		const retainedEnergy =
			elapsed >= settings.wheelBurstDecayMs
				? 0
				: burstEnergy * (1 - elapsed / settings.wheelBurstDecayMs);
		burstEnergy = Math.min(
			settings.wheelBurstEnergyLimit,
			retainedEnergy + normalizedMagnitude * normalizedMagnitude,
		);
		accumulatedDelta = 0;
		lastEventAt = now;
		setDirection(nextDirection);
		const burstRatio = Math.sqrt(burstEnergy / settings.wheelBurstEnergyLimit);
		const accelerationRatio = clamp(
			(burstScore - 1) / Math.max(1, settings.wheelBurstCountLimit - 1),
			0,
			1,
		);
		const streakBoost =
			settings.wheelBurstCountBoostPx *
			(settings.wheelBurstCountMultiplier ** Math.max(0, burstScore - 1) - 1);
		const amount = Math.min(
			settings.wheelMaxStepPx,
			settings.wheelBaseStepPx +
				normalizedMagnitude * settings.wheelDeltaRatio +
				burstRatio * accelerationRatio * settings.wheelAccelerationPx +
				streakBoost,
		);
		const from = target ?? driver.getTargetScroll();
		target = clamp(from + nextDirection * amount, 0, totalScroll);
		const snapTarget = resolveImmediateSnapTarget(target, nextDirection);
		if (snapTarget) {
			target = snapTarget.scroll;
			driver.scrollTo(target, "smooth", {
				duration: snapTarget.durationSeconds,
			});
		} else {
			driver.scrollTo(target, "smooth", { duration: settings.wheelDuration });
			scheduleSnap(settings.wheelDuration * 1000);
		}
		window.clearTimeout(resetTimer ?? undefined);
		resetTimer = window.setTimeout(() => {
			burstScore = 0;
			burstEnergy = 0;
			direction = null;
			lastEventAt = 0;
			target = null;
		}, settings.wheelResetDelayMs);
	};

	const onWheel = (event: WheelEvent): void => {
		if (shouldLetElementHandleInput(event.target)) return;
		if (event.ctrlKey || event.metaKey) return;
		const delta = normalizeWheelDelta(event);
		if (Math.abs(delta) < 0.1) return;
		event.preventDefault();
		countReaderDiagnostic("wheel input");
		accumulatedDelta += delta;
		if (frameId === null) {
			frameId = window.requestAnimationFrame(applyAccumulatedWheelInput);
		}
	};

	inputTarget.addEventListener("wheel", onWheel as EventListener, {
		passive: false,
	});
	return () => {
		inputTarget.removeEventListener("wheel", onWheel as EventListener);
		window.cancelAnimationFrame(frameId ?? 0);
		window.clearTimeout(resetTimer ?? undefined);
	};
}

/**
 * Converts browser-specific wheel units into approximate CSS pixels.
 *
 * @param event - Native wheel event.
 * @returns Signed wheel distance in CSS pixels.
 *
 * @example
 * const pixels = normalizeWheelDelta(event);
 */
function normalizeWheelDelta(event: WheelEvent): number {
	if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
	if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
		return event.deltaY * window.innerHeight;
	}
	return event.deltaY;
}
