import type { Tale } from "~/app/(tale-app)/_shared/types";
import type { TaleSchema } from "~/server/db/schema";

/**
 * Database tale query shape accepted by the tale reader formatter.
 *
 * @example
 * const record: DbTaleRecord = await getTaleRecord();
 */
export type DbTaleRecord = TaleSchema & {
	blocks?: unknown[];
	book?: Tale["book"];
	branches?: unknown[];
	creatorById?: Tale["creator"];
	entries?: unknown[];
	fragments?: unknown[];
	nodes?: unknown[];
	pages?: unknown[];
	parts?: unknown[];
	paths?: unknown[];
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
