import type { SectionSchema } from "~/server/db/schema";

export type Section = EmbeddedSection & {
	blockIds: number[];
	firstBlockId: number | null;
	lastBlockId: number | null;
	blockCount: number;
	pageCount: number;
	isFirstSection: boolean;
	isLastSection: boolean;
};

export type SectionEmbed = {
	index: number;
	isSnap: boolean;
};

export type EmbeddedSection = SectionSchema & SectionEmbed;
