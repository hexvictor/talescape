import type { TalePlaybackConfig } from "../../types";
import type { ReaderInputSettings } from "../readerInputSettings";
import type { ReaderScrollDriver } from "../scrollDriver";
import type { ReaderSnapTarget, ScrollDirection } from "../scrollSnapModel";

export type ReaderInputKind = "dragging" | "keyboard" | "scrolling";

export type ReaderInputControllerOptions = {
	driver: ReaderScrollDriver;
	getInputPermissions: () => TalePlaybackConfig["interactions"];
	getInputSettings: () => ReaderInputSettings;
	getSnapDuration: (durationSeconds: number) => number | null;
	registerSnapInput: (intensity?: number) => void;
	onUserInput: (kind: ReaderInputKind) => void;
	resolveImmediateSnapTarget: (
		targetScroll: number,
		direction: ScrollDirection,
		fromScroll: number,
	) => ReaderSnapTarget | null;
	scheduleSnap: (delayMs?: number, fromScroll?: number) => void;
	setDirection: (direction: ScrollDirection) => void;
	target: HTMLElement | Window;
	totalScroll: number;
};

export type ReaderKeyboardInputControllerOptions =
	ReaderInputControllerOptions & {
		scrollToTimelineEdge: (edge: "end" | "start") => void;
	};
