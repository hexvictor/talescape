import type { Anchor } from "../types";

export type ReaderBlockPaintBounds = {
	height: number;
	left: number;
	top: number;
	width: number;
};

/** Snaps block edges outward and overlaps half a pixel to prevent GPU seams. */
export function resolveReaderBlockPaintBounds(
	anchor: Pick<Anchor, "height" | "point" | "width">,
): ReaderBlockPaintBounds {
	const left = Math.floor(anchor.point.x - anchor.width / 2);
	const right = Math.ceil(anchor.point.x + anchor.width / 2);
	const top = Math.floor(anchor.point.y - anchor.height / 2);
	const bottom = Math.ceil(anchor.point.y + anchor.height / 2);
	const bleed = 0.5;
	return {
		height: bottom - top + bleed * 2,
		left: left - bleed,
		top: top - bleed,
		width: right - left + bleed * 2,
	};
}
