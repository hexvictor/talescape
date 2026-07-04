import { countReaderDiagnostic } from "../../services/readerDiagnostics";
import { clamp } from "../../services/readerMath";
import type { ScrollDirection } from "../scrollSnapModel";
import { shouldLetElementHandleInput } from "./inputTarget";
import type { ReaderKeyboardInputControllerOptions } from "./inputTypes";

/**
 * Attaches reading input plus accelerated Home and End travel.
 *
 * @param options - Shared input controller dependencies.
 * @returns Listener and timer cleanup.
 *
 * @example
 * const cleanup = attachKeyboardInput(options);
 */
export function attachKeyboardInput({
	driver,
	getInputSettings,
	getSnapDuration,
	registerSnapInput,
	resolveImmediateSnapTarget,
	scheduleSnap,
	setDirection,
	scrollToTimelineEdge,
	target: inputTarget,
	totalScroll,
}: ReaderKeyboardInputControllerOptions): () => void {
	let heldDirection: ScrollDirection | null = null;
	let target: number | null = null;
	let multiplier = 1;
	let decayTimer: number | null = null;
	let tapDirection: ScrollDirection | null = null;
	let tapCount = 0;
	let tapLastAt = 0;
	let tapResetTimer: number | null = null;

	const animateBy = (amount: number) => {
		const settings = getInputSettings();
		const direction: ScrollDirection = amount >= 0 ? 1 : -1;
		const nextTarget = clamp(driver.getTargetScroll() + amount, 0, totalScroll);
		const snapTarget = resolveImmediateSnapTarget(nextTarget, direction);
		setDirection(direction);
		const durationSeconds = snapTarget
			? getSnapDuration(snapTarget.durationSeconds)
			: null;
		driver.scrollTo(
			durationSeconds !== null && snapTarget ? snapTarget.scroll : nextTarget,
			"smooth",
			{
				duration: durationSeconds ?? settings.keyboardDuration,
			},
		);
		if (!snapTarget || durationSeconds === null) {
			scheduleSnap(settings.keyboardDuration * 1000);
		}
	};

	const startDecay = () => {
		const settings = getInputSettings();
		window.clearTimeout(decayTimer ?? undefined);
		decayTimer = window.setTimeout(() => {
			const decay = () => {
				multiplier = Math.max(
					1,
					multiplier - getInputSettings().keyboardDecayStep,
				);
				if (multiplier > 1) {
					decayTimer = window.setTimeout(
						decay,
						getInputSettings().keyboardDecayIntervalMs,
					);
					return;
				}
				heldDirection = null;
				if (tapCount === 0) target = null;
			};
			decay();
		}, settings.keyboardDecayDelayMs);
	};

	const resetTapBurst = (resetTarget = true) => {
		window.clearTimeout(tapResetTimer ?? undefined);
		tapDirection = null;
		tapCount = 0;
		tapLastAt = 0;
		if (resetTarget) target = null;
	};

	const getTapStep = (direction: ScrollDirection, now: number) => {
		const settings = getInputSettings();
		const continuesBurst =
			tapDirection === direction &&
			now - tapLastAt <= settings.keyboardTapBurstWindowMs;
		if (!continuesBurst) {
			tapCount = 0;
			target = null;
		}
		tapDirection = direction;
		tapCount += 1;
		tapLastAt = now;
		const accelerationCount = Math.max(0, tapCount - 1);
		const baseStep =
			settings.keyboardBaseStepPx +
			accelerationCount * settings.keyboardTapAccelerationPx;
		const repeatMultiplier =
			settings.keyboardTapRepeatMultiplier ** Math.max(0, tapCount - 2);
		window.clearTimeout(tapResetTimer ?? undefined);
		tapResetTimer = window.setTimeout(
			() => resetTapBurst(),
			settings.keyboardTapBurstWindowMs,
		);
		return Math.min(settings.keyboardTapMaxStepPx, baseStep * repeatMultiplier);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (shouldLetElementHandleInput(event.target)) return;
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		registerSnapInput(event.repeat ? 1.2 : 0.8);

		const pageStep = Math.max(
			120,
			window.innerHeight * getInputSettings().pageStepRatio,
		);
		const direction =
			event.key === "ArrowDown" || event.key === "ArrowRight"
				? 1
				: event.key === "ArrowUp" || event.key === "ArrowLeft"
					? -1
					: null;

		if (event.key === "Home" || event.key === "End") {
			event.preventDefault();
			scrollToTimelineEdge(event.key === "Home" ? "start" : "end");
			return;
		}
		if (
			event.key === "PageDown" ||
			event.key === "PageUp" ||
			event.key === " "
		) {
			event.preventDefault();
			animateBy((event.key === "PageUp" || event.shiftKey ? -1 : 1) * pageStep);
			return;
		}
		if (direction === null) return;

		countReaderDiagnostic("keyboard navigation input", { key: event.key });
		event.preventDefault();
		if (heldDirection !== direction) {
			heldDirection = direction;
			multiplier = 1;
			target = null;
			resetTapBurst(false);
		}
		const step = event.repeat
			? getHeldStep()
			: getTapStep(direction, performance.now());
		setDirection(direction);
		const from = target ?? driver.getTargetScroll();
		target = clamp(from + direction * step, 0, totalScroll);
		const settings = getInputSettings();
		const snapTarget = resolveImmediateSnapTarget(target, direction);
		if (snapTarget) {
			const durationSeconds = getSnapDuration(snapTarget.durationSeconds);
			if (durationSeconds !== null) {
				target = snapTarget.scroll;
				driver.scrollTo(target, "smooth", {
					duration: durationSeconds,
				});
			} else {
				driver.scrollTo(target, "smooth", {
					duration: settings.keyboardDuration,
				});
				scheduleSnap(
					event.repeat
						? settings.keyboardDuration * 1000
						: settings.keyboardTapBurstWindowMs,
				);
			}
		} else {
			driver.scrollTo(target, "smooth", {
				duration: settings.keyboardDuration,
			});
			scheduleSnap(
				event.repeat
					? settings.keyboardDuration * 1000
					: settings.keyboardTapBurstWindowMs,
			);
		}
	};

	const getHeldStep = () => {
		const settings = getInputSettings();
		resetTapBurst(false);
		multiplier = Math.min(
			settings.keyboardMaxMultiplier,
			multiplier + settings.keyboardHoldBoost,
		);
		startDecay();
		return settings.keyboardBaseStepPx * multiplier;
	};

	inputTarget.addEventListener("keydown", onKeyDown as EventListener);
	return () => {
		inputTarget.removeEventListener("keydown", onKeyDown as EventListener);
		window.clearTimeout(decayTimer ?? undefined);
		window.clearTimeout(tapResetTimer ?? undefined);
	};
}
