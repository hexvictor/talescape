import type { Expand } from "../../../../types/utils";

export type ElementType = Expand<keyof ElementDataMap>;

export type ElementData = ElementDataMap[keyof ElementDataMap];

export type ElementProgressionData = {
	enabled: boolean;
	introLength: number;
	outroLength: number;
	pauses: { atEnd: number; atStart: number };
	activeLength: number;
	snap: import("./readerConfig").BlockSnapConfig;
};

export type TextElementData = {
	content: string;
};

export type ImageElementData = {
	url: string;
	alt?: string;
	fallbackUrl?: string;
};

export type AudioElementData = {
	url: string;
	duration?: number;
	loop?: boolean;
	maxVolume?: number;
	playbackMode?: "click" | "controls" | "onEnter" | "scrollVolume";
	playbackScope?: "element" | "frame" | "scene";
};

export type VideoElementData = {
	url: string;
	thumbnail?: string;
	duration?: number;
};

export type QuoteElementData = {
	attribution?: string;
	text: string;
};

export type SoundCueElementData = {
	label: string;
	mood?: string;
	url?: string | null;
};

export type ChoiceButtonElementData = {
	label: string;
	pathId: string;
	description?: string;
};

export type CodexEntryElementData = {
	entryId?: string;
	label: string;
	description?: string;
};

export type ElementDataMap = {
	audio: AudioElementData;
	choiceButton: ChoiceButtonElementData;
	codexEntry: CodexEntryElementData;
	video: VideoElementData;
	image: ImageElementData;
	quote: QuoteElementData;
	soundCue: SoundCueElementData;
	text: TextElementData;
};
