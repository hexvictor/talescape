import type { ReaderScrollDriver } from "../scrollDriver";
import type { ScrollDirection } from "../scrollSnapModel";

export type ReaderInputControllerOptions = {
	driver: ReaderScrollDriver;
	scheduleSnap: (delayMs?: number) => void;
	setDirection: (direction: ScrollDirection) => void;
	totalScroll: number;
};

export type ReaderKeyboardInputControllerOptions =
	ReaderInputControllerOptions & {
		scrollToTimelineEdge: (edge: "end" | "start") => void;
	};
