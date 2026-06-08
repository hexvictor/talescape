import type { ReaderScrollDriver } from "../scrollDriver";
import type { ScrollDirection } from "../scrollSnapModel";

export type ReaderInputControllerOptions = {
	driver: ReaderScrollDriver;
	scheduleSnap: (delayMs?: number) => void;
	setDirection: (direction: ScrollDirection) => void;
	totalScroll: number;
};
