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
	scheduleSnap,
	setDirection,
	totalScroll,
}: ReaderInputControllerOptions): () => void {
	let lastTouchY: number | null = null;
	let active = false;

	const onTouchStart = (event: TouchEvent) => {
		active = !shouldLetElementHandleInput(event.target);
		if (!active) return;
		driver.cancelMotion();
		lastTouchY = event.touches[0]?.clientY ?? null;
	};
	const onTouchMove = (event: TouchEvent) => {
		if (!active || lastTouchY === null) return;
		const touchY = event.touches[0]?.clientY;
		if (touchY === undefined) return;
		event.preventDefault();
		const delta = lastTouchY - touchY;
		setDirection(delta >= 0 ? 1 : -1);
		driver.scrollTo(
			clamp(driver.getScroll() + delta * 1.35, 0, totalScroll),
			"smooth",
			{ duration: 0.08 },
		);
		lastTouchY = touchY;
	};
	const onTouchEnd = () => {
		lastTouchY = null;
		if (!active) return;
		active = false;
		scheduleSnap();
	};

	window.addEventListener("touchstart", onTouchStart, { passive: true });
	window.addEventListener("touchmove", onTouchMove, { passive: false });
	window.addEventListener("touchend", onTouchEnd, { passive: true });
	return () => {
		window.removeEventListener("touchstart", onTouchStart);
		window.removeEventListener("touchmove", onTouchMove);
		window.removeEventListener("touchend", onTouchEnd);
	};
}
