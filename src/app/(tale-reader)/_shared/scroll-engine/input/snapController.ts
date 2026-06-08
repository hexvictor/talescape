import { countReaderDiagnostic } from "../../services/readerDiagnostics";
import { NEW_READER_INPUT_SETTINGS } from "../readerInputSettings";
import type { ReaderScrollDriver } from "../scrollDriver";
import type { ReaderSnapModel, ScrollDirection } from "../scrollSnapModel";

export type ReaderSnapController = {
	cleanup: () => void;
	schedule: (delayMs?: number) => void;
};

/**
 * Creates the delayed snap scheduler shared by all input adapters.
 *
 * @param driver - Reader scroll driver.
 * @param snapModel - Compiled snap-point resolver.
 * @param getDirection - Reads the latest input direction.
 * @returns Snap scheduling and cleanup methods.
 *
 * @example
 * const snap = createSnapController(driver, model, () => direction);
 */
export function createSnapController(
	driver: ReaderScrollDriver,
	snapModel: ReaderSnapModel,
	getDirection: () => ScrollDirection,
): ReaderSnapController {
	let timer: number | null = null;

	return {
		cleanup: () => window.clearTimeout(timer ?? undefined),
		schedule: (delayMs = NEW_READER_INPUT_SETTINGS.snapDelayMs) => {
			countReaderDiagnostic("scheduleSnap()");
			window.clearTimeout(timer ?? undefined);
			timer = window.setTimeout(() => {
				const target = snapModel.getNearbyTarget(
					driver.getScroll(),
					getDirection(),
				);
				if (target === null) return;
				driver.scrollTo(target, "smooth", {
					duration: NEW_READER_INPUT_SETTINGS.snapDuration,
				});
			}, delayMs);
		},
	};
}
