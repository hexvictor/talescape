import type { CSSProperties } from "react";
import type { FragmentPlacement } from "../../../types";

/**
 * Converts authored absolute or fixed placement into positioned CSS.
 *
 * @param placement - Fragment placement and alignment configuration.
 * @returns CSS properties relative to the fragment's rendered parent layer.
 *
 * @example
 * const style = positionedStyle(fragment.placement);
 */
export function positionedStyle(placement: FragmentPlacement): CSSProperties {
	if (placement.mode !== "absolute" && placement.mode !== "fixed") return {};
	const horizontalValue =
		placement.unit === "px" ? `${placement.x}px` : `${placement.x * 100}dvw`;
	const verticalValue =
		placement.unit === "px" ? `${placement.y}px` : `${placement.y * 100}dvh`;
	const width =
		placement.width === undefined
			? undefined
			: placement.unit === "px"
				? `${placement.width}px`
				: `${placement.width * 100}dvw`;
	const horizontalCentered = placement.horizontal === "center";
	const verticalCentered = placement.vertical === "center";
	return {
		...(horizontalCentered
			? { left: "50%" }
			: { [placement.horizontal]: horizontalValue }),
		...(verticalCentered
			? { top: "50%" }
			: { [placement.vertical]: verticalValue }),
		transform:
			horizontalCentered || verticalCentered
				? `translate(${horizontalCentered ? "-50%" : "0"}, ${verticalCentered ? "-50%" : "0"})`
				: undefined,
		width,
		zIndex: placement.zIndex ?? 0,
	};
}
