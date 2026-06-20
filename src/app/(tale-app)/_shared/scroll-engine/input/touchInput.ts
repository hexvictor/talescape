import { clamp } from "../../services/readerMath";
import { NEW_READER_INPUT_SETTINGS } from "../readerInputSettings";
import { shouldLetElementHandleInput } from "./inputTarget";
import type { ReaderInputControllerOptions } from "./inputTypes";

/**
 * Attaches direct touch dragging to the reader.
 *
 * @param options - Shared input controller dependencies.
 * @returns Listener cleanup.
 *
 * @example
 * const cleanup = attachTouchInput(options);
 */
export function attachTouchInput({
	driver,
	scheduleSnap,
	setDirection,
	target: inputTarget,
	totalScroll,
}: ReaderInputControllerOptions): () => void {
	let lastTouchY: number | null = null;
	let lastTouchAt = 0;
	let lastTouchEndAt = 0;
	let burstStartedAt = 0;
	let burstEnergy = 0;
	let target: number | null = null;
	let active = false;

	const onTouchStart = (event: TouchEvent) => {
		active = !shouldLetElementHandleInput(event.target);
		if (!active) return;
		lastTouchY = event.touches[0]?.clientY ?? null;
		lastTouchAt = performance.now();
		const elapsedSinceGesture = lastTouchAt - lastTouchEndAt;
		if (elapsedSinceGesture >= NEW_READER_INPUT_SETTINGS.touchBurstDecayMs) {
			burstEnergy = 0;
			driver.cancelMotion();
		} else if (lastTouchEndAt > 0) {
			burstEnergy *=
				1 - elapsedSinceGesture / NEW_READER_INPUT_SETTINGS.touchBurstDecayMs;
		}
		burstStartedAt = lastTouchAt;
		target = driver.getTargetScroll();
	};
	const onTouchMove = (event: TouchEvent) => {
		if (!active || lastTouchY === null) return;
		const touchY = event.touches[0]?.clientY;
		if (touchY === undefined) return;
		event.preventDefault();
		const delta = lastTouchY - touchY;
		const now = performance.now();
		const elapsed = Math.max(now - lastTouchAt, 1);
		const velocity = Math.abs(delta) / elapsed;
		burstEnergy = Math.min(
			NEW_READER_INPUT_SETTINGS.touchBurstEnergyLimit,
			burstEnergy + Math.abs(delta),
		);
		const sustainedMultiplier = Math.min(
			NEW_READER_INPUT_SETTINGS.touchAccelerationLimit,
			1 + (now - burstStartedAt) / NEW_READER_INPUT_SETTINGS.touchBurstWindowMs,
		);
		const velocityMultiplier = Math.min(
			2,
			1 + velocity / NEW_READER_INPUT_SETTINGS.touchVelocityRatio,
		);
		const burstMultiplier =
			1 +
			Math.sqrt(burstEnergy / NEW_READER_INPUT_SETTINGS.touchBurstEnergyLimit) *
				(NEW_READER_INPUT_SETTINGS.touchAccelerationLimit - 1);
		setDirection(delta >= 0 ? 1 : -1);
		target = clamp(
			(target ?? driver.getTargetScroll()) +
				delta *
					NEW_READER_INPUT_SETTINGS.touchDeltaRatio *
					Math.min(
						NEW_READER_INPUT_SETTINGS.touchAccelerationLimit,
						sustainedMultiplier * velocityMultiplier * burstMultiplier,
					),
			0,
			totalScroll,
		);
		driver.scrollTo(target, "smooth", { duration: 0.08 });
		lastTouchY = touchY;
		lastTouchAt = now;
	};
	const onTouchEnd = () => {
		lastTouchY = null;
		lastTouchAt = 0;
		burstStartedAt = 0;
		lastTouchEndAt = performance.now();
		if (!active) return;
		active = false;
		scheduleSnap();
	};

	inputTarget.addEventListener("touchstart", onTouchStart as EventListener, {
		passive: true,
	});
	inputTarget.addEventListener("touchmove", onTouchMove as EventListener, {
		passive: false,
	});
	inputTarget.addEventListener("touchend", onTouchEnd, { passive: true });
	return () => {
		inputTarget.removeEventListener(
			"touchstart",
			onTouchStart as EventListener,
		);
		inputTarget.removeEventListener("touchmove", onTouchMove as EventListener);
		inputTarget.removeEventListener("touchend", onTouchEnd);
	};
}
