import { logReaderDiagnostic } from "../services/readerDiagnostics";
import type { TaleSnapConfig } from "../types";
import { attachKeyboardInput } from "./input/keyboardInput";
import { attachMiddleDragInput } from "./input/middleDragInput";
import { createSnapController } from "./input/snapController";
import { attachTouchInput } from "./input/touchInput";
import { attachWheelInput } from "./input/wheelInput";
import type { ReaderInputSettings } from "./readerInputSettings";
import type { ReaderScrollDriver } from "./scrollDriver";
import type { ReaderSnapModel, ScrollDirection } from "./scrollSnapModel";

export type ReaderInputBindings = {
	cancelPendingSnap: () => void;
	cleanup: () => void;
};

/**
 * Attaches all input adapters used by the reader scroll driver.
 *
 * @param totalScroll - Maximum engine scroll position.
 * @param driver - Scroll driver receiving normalized input.
 * @param snapModel - Model used to resolve nearby snap points.
 * @param scrollToTimelineEdge - Accelerated Home and End navigation.
 * @param getInputSettings - Reads current input behavior settings.
 * @param getSnapConfig - Reads compiled tale-level snap defaults.
 * @returns Input cleanup and pending-snap cancellation controls.
 *
 * @example
 * const cleanup = attachReaderInputBindings(totalScroll, driver, snapModel);
 */
export function attachReaderInputBindings(
	totalScroll: number,
	driver: ReaderScrollDriver,
	snapModel: ReaderSnapModel,
	scrollToTimelineEdge: (edge: "end" | "start") => void,
	getInputSettings: () => ReaderInputSettings,
	getSnapConfig: () => TaleSnapConfig,
	target: HTMLElement | Window = window,
): ReaderInputBindings {
	logReaderDiagnostic("input bindings attached", { totalScroll });
	let direction: ScrollDirection = 1;
	const setDirection = (nextDirection: ScrollDirection) => {
		direction = nextDirection;
	};
	const snapController = createSnapController(
		driver,
		snapModel,
		() => direction,
		getSnapConfig,
	);
	const resolveImmediateSnapTarget = (
		targetScroll: number,
		nextDirection: ScrollDirection,
	) => {
		const target = snapModel.getSnapTarget(
			targetScroll,
			nextDirection,
			getSnapConfig(),
		);
		return target?.forced ? target : null;
	};
	const cleanups = [
		attachWheelInput({
			driver,
			getInputSettings,
			getSnapDuration: snapController.getDuration,
			registerSnapInput: snapController.registerInput,
			resolveImmediateSnapTarget,
			scheduleSnap: snapController.schedule,
			setDirection,
			target,
			totalScroll,
		}),
		attachKeyboardInput({
			driver,
			getInputSettings,
			getSnapDuration: snapController.getDuration,
			registerSnapInput: snapController.registerInput,
			resolveImmediateSnapTarget,
			scheduleSnap: snapController.schedule,
			setDirection,
			scrollToTimelineEdge,
			target: window,
			totalScroll,
		}),
		attachMiddleDragInput({
			driver,
			getInputSettings,
			getSnapDuration: snapController.getDuration,
			registerSnapInput: snapController.registerInput,
			resolveImmediateSnapTarget,
			scheduleSnap: snapController.schedule,
			setDirection,
			target,
			totalScroll,
		}),
		attachTouchInput({
			driver,
			getInputSettings,
			getSnapDuration: snapController.getDuration,
			registerSnapInput: snapController.registerInput,
			resolveImmediateSnapTarget,
			scheduleSnap: snapController.schedule,
			setDirection,
			target,
			totalScroll,
		}),
	];

	return {
		cancelPendingSnap: snapController.cleanup,
		cleanup: () => {
			logReaderDiagnostic("input bindings removed");
			for (const cleanup of cleanups) cleanup();
			snapController.cleanup();
		},
	};
}
