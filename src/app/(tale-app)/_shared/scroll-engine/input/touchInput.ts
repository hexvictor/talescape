import { clamp } from "../../services/readerMath";
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
	getInputSettings,
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
	let lastScrollVelocity = 0;
	let target: number | null = null;
	let active = false;

	const onTouchStart = (event: TouchEvent) => {
		active = !shouldLetElementHandleInput(event.target);
		if (!active) return;
		lastTouchY = event.touches[0]?.clientY ?? null;
		lastTouchAt = performance.now();
		const settings = getInputSettings();
		driver.cancelMotion();
		const elapsedSinceGesture = lastTouchAt - lastTouchEndAt;
		if (elapsedSinceGesture >= settings.touchBurstDecayMs) {
			burstEnergy = 0;
			burstStartedAt = lastTouchAt;
		} else if (lastTouchEndAt > 0) {
			burstEnergy *= 1 - elapsedSinceGesture / settings.touchBurstDecayMs;
		}
		if (burstStartedAt === 0) burstStartedAt = lastTouchAt;
		lastScrollVelocity = 0;
		target = driver.getScroll();
	};
	const onTouchMove = (event: TouchEvent) => {
		if (!active || lastTouchY === null) return;
		const touchY = event.touches[0]?.clientY;
		if (touchY === undefined) return;
		event.preventDefault();
		const delta = lastTouchY - touchY;
		const now = performance.now();
		const settings = getInputSettings();
		const elapsed = Math.max(now - lastTouchAt, 1);
		const velocity = Math.abs(delta) / elapsed;
		burstEnergy = Math.min(
			settings.touchBurstEnergyLimit,
			burstEnergy + Math.abs(delta),
		);
		const sustainedMultiplier = Math.min(
			settings.touchAccelerationLimit,
			1 + (now - burstStartedAt) / settings.touchBurstWindowMs,
		);
		const velocityMultiplier = Math.min(
			2,
			1 + velocity / settings.touchVelocityRatio,
		);
		const burstMultiplier =
			1 +
			Math.sqrt(burstEnergy / settings.touchBurstEnergyLimit) *
				(settings.touchAccelerationLimit - 1);
		const acceleration = Math.min(
			settings.touchAccelerationLimit,
			1 +
				(sustainedMultiplier - 1) * 0.35 +
				(velocityMultiplier - 1) * 0.45 +
				(burstMultiplier - 1) * 0.5,
		);
		const scrollDelta = delta * settings.touchDeltaRatio * acceleration;
		setDirection(delta >= 0 ? 1 : -1);
		target = clamp(
			(target ?? driver.getScroll()) + scrollDelta,
			0,
			totalScroll,
		);
		driver.scrollTo(target, "smooth", {
			duration: settings.touchDuration,
		});
		lastScrollVelocity = scrollDelta / elapsed;
		lastTouchY = touchY;
		lastTouchAt = now;
	};
	const onTouchEnd = () => {
		lastTouchY = null;
		lastTouchAt = 0;
		lastTouchEndAt = performance.now();
		if (!active) return;
		active = false;
		const settings = getInputSettings();
		if (Math.abs(lastScrollVelocity) >= settings.touchMomentumMinVelocity) {
			const momentumDistance = clamp(
				lastScrollVelocity * settings.touchMomentumMultiplier,
				-settings.touchMomentumMaxPx,
				settings.touchMomentumMaxPx,
			);
			const momentumTarget = clamp(
				(target ?? driver.getScroll()) + momentumDistance,
				0,
				totalScroll,
			);
			setDirection(momentumDistance >= 0 ? 1 : -1);
			driver.scrollTo(momentumTarget, "smooth", {
				duration: settings.touchMomentumDuration,
			});
			target = momentumTarget;
			scheduleSnap(
				settings.touchMomentumDuration * 1000 + settings.snapDelayMs,
			);
			return;
		}
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
