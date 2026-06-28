import type { Expand } from "../../../../types/utils";

export type FragmentType = Expand<keyof FragmentDataMap>;

export type FragmentData = FragmentDataMap[keyof FragmentDataMap];

export type TextFragmentData = {
	content: string;
};

export type ImageFragmentData = {
	url: string;
	alt?: string;
	fallbackUrl?: string;
};

export type AudioFragmentData = {
	url: string;
	duration?: number;
};

export type VideoFragmentData = {
	url: string;
	thumbnail?: string;
	duration?: number;
};

export type QuoteFragmentData = {
	attribution?: string;
	text: string;
};

export type SoundCueFragmentData = {
	label: string;
	mood?: string;
	url?: string | null;
};

export type ChoiceButtonFragmentData = {
	label: string;
	pathId: string;
	description?: string;
};

export type CodexEntryFragmentData = {
	entryId?: string;
	label: string;
	description?: string;
};

export type FragmentDataMap = {
	audio: AudioFragmentData;
	choiceButton: ChoiceButtonFragmentData;
	codexEntry: CodexEntryFragmentData;
	video: VideoFragmentData;
	image: ImageFragmentData;
	quote: QuoteFragmentData;
	soundCue: SoundCueFragmentData;
	text: TextFragmentData;
};
