import { countReaderDiagnostic } from "../../services/readerDiagnostics";
import type { TaleSnapConfig } from "../../types";
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
 * @param getInputSettings - Reads current input tuning values.
 * @returns Snap scheduling and cleanup methods.
 *
 * @example
 * const snap = createSnapController(driver, model, () => direction);
 */
export function createSnapController(
	driver: ReaderScrollDriver,
	snapModel: ReaderSnapModel,
	getDirection: () => ScrollDirection,
	getSnapConfig: () => TaleSnapConfig,
): ReaderSnapController {
	let timer: number | null = null;

	return {
		cleanup: () => window.clearTimeout(timer ?? undefined),
		schedule: (delayMs) => {
			countReaderDiagnostic("scheduleSnap()");
			window.clearTimeout(timer ?? undefined);
			const settings = getSnapConfig();
			const target = snapModel.getSnapTarget(
				driver.getTargetScroll(),
				getDirection(),
				settings,
			);
			if (target === null) return;
			timer = window.setTimeout(
				() => {
					driver.scrollTo(target.scroll, "smooth", {
						duration: target.durationSeconds,
					});
				},
				(delayMs ?? 0) + target.delayMs,
			);
		},
	};
}
