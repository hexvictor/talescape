import type { FragmentSchema } from "~/server/db/schema";

export type Fragment = EmbeddedFragment & {
	isFirstFragment: boolean;
	isLastFragment: boolean;
	sectionId: number;
	globalIndex: number;
};

export type FragmentEmbed = {
	blockId: number;
	index: number;
};

export type EmbeddedFragment = FragmentSchema & FragmentEmbed;
