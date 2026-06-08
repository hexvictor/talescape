/**
 * Identifies where a reader preset comes from.
 *
 * @example
 * const source: PresetSource = "official";
 */
export type PresetSource = "creator" | "official";

/**
 * Builds the combined preset id used by the frontend engine.
 *
 * @param source - Whether the preset is official or creator-owned.
 * @param id - The numeric database id or stable fallback id.
 * @returns A stable frontend preset id.
 *
 * @example
 * const id = presetKey("official", 1);
 */
export function presetKey(source: PresetSource, id: number | string): string {
	return `${source}:${id}`;
}
