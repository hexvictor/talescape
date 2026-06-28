import type { Tale } from "~/app/(tale-app)/_shared/types";
import type { TaleBreakpoint } from "~/app/(tale-app)/_shared/types";

/**
 * Database tale query shape accepted by the tale reader formatter.
 *
 * @example
 * const record: DbTaleRecord = await getTaleRecord();
 */
export type DbTaleRecord = {
	blocks?: unknown[];
	book?: Tale["book"];
	branches?: unknown[];
	creatorById?: Tale["creator"];
	description?: string;
	entries?: unknown[];
	fragments?: unknown[];
	id: number;
	nodes?: unknown[];
	pages?: unknown[];
	parts?: unknown[];
	paths?: unknown[];
	breakpointConfig?: TaleBreakpoint[];
	slug: string;
	title: string;
	firstBlockTransitionMode?: Tale["firstBlockTransitionMode"];
	transitionFirstBlock?: boolean;
};

/**
 * Official preset query shape accepted by the tale reader formatter.
 *
 * @example
 * const presets: OfficialPresetRows = await getOfficialPresets();
 */
export type OfficialPresetRows = {
	animationPresets?: unknown[];
	blockStylePresets?: unknown[];
	transitionPresets?: unknown[];
	visibilityPresets?: unknown[];
};
