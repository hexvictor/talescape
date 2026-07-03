import { countReaderDiagnostic } from "../../services/readerDiagnostics";
import { clamp } from "../../services/readerMath";
import { shouldLetElementHandleInput } from "./inputTarget";
import type { ReaderInputControllerOptions } from "./inputTypes";

/**
 * Attaches middle-button drag input to the virtual reader scroll driver.
 *
 * @param options - Shared input controller dependencies.
 * @returns Listener cleanup.
 *
 * @example
 * const cleanup = attachMiddleDragInput(options);
 */
export function attachMiddleDragInput({
	driver,
	getInputSettings,
	scheduleSnap,
	setDirection,
	target: inputTarget,
	totalScroll,
}: ReaderInputControllerOptions): () => void {
	let active = false;
	let lastY = 0;
	let lastAt = 0;
	let targetScroll = 0;

	/**
	 * Clears the active middle-drag state and schedules snapping when needed.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * finishDrag();
	 */
	const finishDrag = (): void => {
		if (!active) return;
		active = false;
		lastAt = 0;
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", onPointerUp);
		window.removeEventListener("pointercancel", onPointerUp);
		document.documentElement.classList.remove("cursor-grabbing");
		scheduleSnap();
	};

	const onPointerMove = (event: PointerEvent): void => {
		if (!active) return;
		event.preventDefault();
		const delta = lastY - event.clientY;
		const now = performance.now();
		const settings = getInputSettings();
		const elapsed = Math.max(now - lastAt, 1);
		const velocity = Math.abs(delta) / elapsed;
		const multiplier = Math.min(
			settings.middleDragAccelerationLimit,
			1 + velocity / settings.middleDragVelocityRatio,
		);
		setDirection(delta >= 0 ? 1 : -1);
		targetScroll = clamp(
			targetScroll + delta * settings.middleDragDeltaRatio * multiplier,
			0,
			totalScroll,
		);
		driver.scrollTo(targetScroll, "smooth", {
			duration: settings.middleDragDuration,
		});
		lastY = event.clientY;
		lastAt = now;
	};

	const onPointerUp = (): void => {
		finishDrag();
	};

	const onPointerDown = (event: PointerEvent): void => {
		if (event.button !== 1) return;
		if (shouldLetElementHandleInput(event.target)) return;
		event.preventDefault();
		countReaderDiagnostic("middle drag input");
		active = true;
		lastY = event.clientY;
		lastAt = performance.now();
		driver.cancelMotion();
		targetScroll = driver.getScroll();
		document.documentElement.classList.add("cursor-grabbing");
		window.addEventListener("pointermove", onPointerMove, { passive: false });
		window.addEventListener("pointerup", onPointerUp, { passive: true });
		window.addEventListener("pointercancel", onPointerUp, { passive: true });
	};

	inputTarget.addEventListener("pointerdown", onPointerDown as EventListener, {
		passive: false,
	});

	return () => {
		inputTarget.removeEventListener(
			"pointerdown",
			onPointerDown as EventListener,
		);
		finishDrag();
	};
}
