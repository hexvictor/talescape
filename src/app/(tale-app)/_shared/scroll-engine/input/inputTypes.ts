import type { ReaderInputSettings } from "../readerInputSettings";
import type { ReaderScrollDriver } from "../scrollDriver";
import type { ScrollDirection } from "../scrollSnapModel";

export type ReaderInputControllerOptions = {
	driver: ReaderScrollDriver;
	getInputSettings: () => ReaderInputSettings;
	scheduleSnap: (delayMs?: number) => void;
	setDirection: (direction: ScrollDirection) => void;
	target: HTMLElement | Window;
	totalScroll: number;
};

export type ReaderKeyboardInputControllerOptions =
	ReaderInputControllerOptions & {
		scrollToTimelineEdge: (edge: "end" | "start") => void;
	};
