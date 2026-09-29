import type { ResolvedTaleScene, Tale, TaleSceneSnapMode } from "../types";
import { getTaleScenes } from "./taleLookups";

/**
 * Applies one snap setting to every block in a formatted tale.
 *
 * @param tale - Current formatted tale.
 * @param mode - Snap mode applied to every block.
 * @returns Tale with updated block collections and lookup.
 *
 * @example
 * const nextTale = updateAllBlockSnapSettings(tale, "scroll-snap");
 */
export function updateAllBlockSnapSettings(
	tale: Tale,
	mode: TaleSceneSnapMode,
): Tale {
	const scenes = getTaleScenes(tale).map((block) => ({
		...block,
		snap: { mode, settings: block.snap.settings, strategy: "shared" as const },
	}));
	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			scenesById: Object.fromEntries(
				scenes.map((block) => [block.id, block]),
			) as Record<string, ResolvedTaleScene>,
		},
	};
}
