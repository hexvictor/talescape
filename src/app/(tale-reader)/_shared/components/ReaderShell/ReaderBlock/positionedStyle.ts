import type { CSSProperties } from "react";
import type { FragmentPlacement } from "../../../types";

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
	return {
		[placement.horizontal]: horizontalValue,
		[placement.vertical]: verticalValue,
		width,
		zIndex: placement.zIndex ?? 0,
	};
}
