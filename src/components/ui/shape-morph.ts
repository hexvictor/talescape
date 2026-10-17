import { interpolate } from "flubber";

/** Normalize differing vertex counts before interpolating the shared surface/border outline. */
export function createShapeMorph(from: string, to: string) {
	return interpolate(from, to, { maxSegmentLength: 6 });
}
