import type { ReaderInputSettings } from "../readerInputSettings";
import type { ReaderScrollDriver } from "../scrollDriver";
import type { ReaderSnapTarget, ScrollDirection } from "../scrollSnapModel";

export type ReaderInputControllerOptions = {
	driver: ReaderScrollDriver;
	getInputSettings: () => ReaderInputSettings;
	getSnapDuration: (durationSeconds: number) => number | null;
	registerSnapInput: (intensity?: number) => void;
	resolveImmediateSnapTarget: (
		targetScroll: number,
		direction: ScrollDirection,
	) => ReaderSnapTarget | null;
	scheduleSnap: (delayMs?: number) => void;
	setDirection: (direction: ScrollDirection) => void;
	target: HTMLElement | Window;
	totalScroll: number;
};

export type ReaderKeyboardInputControllerOptions =
	ReaderInputControllerOptions & {
		scrollToTimelineEdge: (edge: "end" | "start") => void;
	};
