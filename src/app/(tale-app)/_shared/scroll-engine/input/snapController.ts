import { countReaderDiagnostic } from "../../services/readerDiagnostics";
import type { TaleSnapConfig } from "../../types";
import type { ReaderScrollDriver } from "../scrollDriver";
import type { ReaderSnapModel, ScrollDirection } from "../scrollSnapModel";

export type ReaderSnapController = {
	cleanup: () => void;
	getDuration: (durationSeconds: number) => number | null;
	registerInput: (intensity?: number) => void;
	schedule: (delayMs?: number) => void;
};

const pressureDecayMs = 650;
const pressureIgnoreThreshold = 5;
const pressureMaximum = 8;

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
	let pressure = 0;
	let lastPressureAt = 0;
	let snapActiveUntil = 0;
	let timer: number | null = null;

	const getPressure = (): number => {
		if (lastPressureAt === 0) return 0;
		const elapsed = performance.now() - lastPressureAt;
		if (elapsed >= pressureDecayMs) {
			pressure = 0;
			lastPressureAt = 0;
			return 0;
		}
		return pressure * (1 - elapsed / pressureDecayMs);
	};

	const registerInput = (intensity = 1): void => {
		const now = performance.now();
		if (now > snapActiveUntil && getPressure() <= 0) return;
		pressure = Math.min(
			pressureMaximum,
			getPressure() + Math.max(intensity, 0),
		);
		lastPressureAt = now;
	};

	const getDuration = (durationSeconds: number): number | null => {
		const nextPressure = getPressure();
		if (nextPressure >= pressureIgnoreThreshold) return null;
		const multiplier = 1 + Math.min(nextPressure, pressureMaximum) * 0.45;
		const nextDuration = Math.max(0.04, durationSeconds / multiplier);
		markSnapActive(nextDuration);
		return nextDuration;
	};

	const markSnapActive = (durationSeconds: number): void => {
		snapActiveUntil = Math.max(
			snapActiveUntil,
			performance.now() + Math.max(durationSeconds, 0) * 1000 + 80,
		);
	};

	return {
		cleanup: () => {
			lastPressureAt = 0;
			pressure = 0;
			snapActiveUntil = 0;
			window.clearTimeout(timer ?? undefined);
		},
		getDuration,
		registerInput,
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
					if (getPressure() >= pressureIgnoreThreshold) return;
					const durationSeconds = getDuration(target.durationSeconds);
					if (durationSeconds === null) return;
					driver.scrollTo(target.scroll, "smooth", {
						duration: durationSeconds,
					});
				},
				(delayMs ?? 0) + target.delayMs,
			);
		},
	};
}
