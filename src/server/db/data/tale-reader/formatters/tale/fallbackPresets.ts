import type { RawTaleRecord } from "~/app/(tale-reader)/_shared/types";

/**
 * Adds minimum official presets when the database has no preset rows yet.
 *
 * @param raw - Raw tale record formatted from database rows.
 * @returns The same raw tale with fallback preset collections populated.
 *
 * @example
 * const tale = formatTale(withFallbackPresets(raw));
 */
export function withFallbackPresets(raw: RawTaleRecord): RawTaleRecord {
	return {
		...raw,
		animationPresets: raw.animationPresets.length
			? raw.animationPresets
			: [
					{
						id: "official:animation-fade-in",
						name: "Fade In",
						source: "official",
						target: "both",
						tracks: [{ end: 1, from: 0, property: "opacity", start: 0, to: 1 }],
					},
				],
		blockStylePresets: raw.blockStylePresets.length
			? raw.blockStylePresets
			: [
					{
						id: "official:style-default",
						name: "Default",
						source: "official",
						style: { backgroundCss: "#14100c" },
						target: "both",
					},
				],
		transitionPresets: raw.transitionPresets.length
			? raw.transitionPresets
			: [
					{
						enteringAnimationPresetIds: [],
						flow: { direction: "down", type: "linear" },
						id: "official:transition-scroll-down",
						leavingAnimationPresetIds: [],
						name: "Scroll Down",
						source: "official",
					},
				],
		visibilityPresets: raw.visibilityPresets.length
			? raw.visibilityPresets
			: [
					{
						id: "official:visibility-entire-block",
						name: "Entire Block",
						range: { end: 1, start: 0 },
						source: "official",
					},
				],
	};
}
