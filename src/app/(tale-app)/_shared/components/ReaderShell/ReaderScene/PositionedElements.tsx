"use client";

import type { Anchor, ResolvedTaleElement, TaleFrame } from "../../../types";
import { TaleElement } from "../TaleElement/TaleElement";
import { ElementParallaxLayer } from "./ElementParallaxLayer";
import { positionedStyle } from "./positionedStyle";

/**
 * Renders absolute elements in either the clipped or overflowing scene layer.
 *
 * @param props - Positioned element properties.
 * @param props.anchor - Owning scene anchor.
 * @param props.elements - Positioned elements to render.
 * @param props.onChoosePath - Choice path callback.
 * @returns Positioned element elements.
 */
export function PositionedElements({
	anchor,
	contentSized,
	elements,
	framesById,
	parentRelative = false,
}: {
	anchor: Anchor;
	contentSized: boolean;
	elements: ResolvedTaleElement[];
	framesById: Record<string, TaleFrame>;
	parentRelative?: boolean;
}): React.JSX.Element[] {
	return elements.map((element, index) => {
		const frame =
			framesById[element.placement.frameId ?? element.frameId ?? ""];
		const defaultState =
			frame?.defaultElementStates?.[element.id] ?? "inactive";
		const defaultStateStyle =
			frame?.visibleDuringSceneIntro === true ||
			frame?.visibleBeforeIntro === true
				? defaultState === "inactive"
					? { opacity: 0 }
					: {}
				: {};
		return (
			<div
				key={element.id}
				data-reader-component="PositionedElements"
				data-reader-element-id={element.id}
				data-reader-role="positioned-element-frame"
				className="absolute flex items-center justify-center"
				style={{
					fontSize: element.style?.fontSize,
					fontWeight: element.style?.fontWeight,
					height: element.style?.height,
					lineHeight: element.style?.lineHeight,
					maxHeight: element.style?.maxHeight,
					maxWidth: element.style?.maxWidth,
					width: element.style?.width,
					minHeight: element.style?.minHeight,
					minWidth: element.style?.minWidth,
					textAlign: element.style?.textAlign,
					...positionedStyle(element.placement, parentRelative),
					...defaultStateStyle,
				}}
			>
				<div
					data-reader-component="PositionedElements"
					data-reader-role="positioned-element-content"
					className="h-full w-full"
				>
					<ElementParallaxLayer config={element.placement.parallax}>
						<TaleElement
							contentSized={contentSized}
							element={element}
							index={index}
						/>
					</ElementParallaxLayer>
				</div>
			</div>
		);
	});
}
