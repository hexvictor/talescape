import { countReaderDiagnostic } from "../../services/readerDiagnostics";
import { clamp } from "../../services/readerMath";
import { NEW_READER_INPUT_SETTINGS } from "../readerInputSettings";
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
	scheduleSnap,
	setDirection,
	totalScroll,
}: ReaderInputControllerOptions): () => void {
	let burstCount = 0;
	let direction: ScrollDirection | null = null;
	let resetTimer: number | null = null;
	let target: number | null = null;

	const onWheel = (event: WheelEvent) => {
		if (shouldLetElementHandleInput(event.target)) return;
		if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) < 1) return;
		event.preventDefault();
		countReaderDiagnostic("wheel input");
		const nextDirection: ScrollDirection = event.deltaY >= 0 ? 1 : -1;
		if (direction !== nextDirection) {
			direction = nextDirection;
			burstCount = 0;
			target = null;
		}
		setDirection(nextDirection);
		burstCount += 1;
		const settings = NEW_READER_INPUT_SETTINGS;
		const physicalDelta = Math.min(
			settings.wheelAccelerationPx,
			Math.abs(event.deltaY) * settings.wheelDeltaRatio,
		);
		const burstStep =
			settings.wheelBaseStepPx +
			physicalDelta +
			Math.max(0, burstCount - 1) * settings.wheelAccelerationPx;
		const amount = Math.min(
			settings.wheelMaxStepPx,
			burstStep * settings.wheelRepeatMultiplier ** Math.max(0, burstCount - 1),
		);
		const from = target ?? driver.getScroll();
		target = clamp(from + nextDirection * amount, 0, totalScroll);
		driver.scrollTo(target, "smooth", { duration: settings.wheelDuration });
		window.clearTimeout(resetTimer ?? undefined);
		resetTimer = window.setTimeout(() => {
			burstCount = 0;
			direction = null;
			target = null;
		}, settings.wheelResetDelayMs);
		scheduleSnap();
	};

	window.addEventListener("wheel", onWheel, { passive: false });
	return () => {
		window.removeEventListener("wheel", onWheel);
		window.clearTimeout(resetTimer ?? undefined);
	};
}
