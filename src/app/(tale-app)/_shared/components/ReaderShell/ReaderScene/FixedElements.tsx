"use client";

import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import { resolveIds } from "../../../services/taleLookups";
import type { Anchor, ResolvedTaleElement } from "../../../types";
import { TaleElement } from "../TaleElement/TaleElement";
import { positionedStyle } from "./positionedStyle";

/**
 * Renders fixed elements inside scene-owned viewport layers.
 *
 * @param props - Anchor and choice callback used by fixed elements.
 * @returns Clipped and overflowing fixed-element layers.
 *
 * @example
 * <FixedElements anchor={anchor} onChoosePath={choosePath} />
 */
export function FixedElements({
	anchor,
}: {
	anchor: Anchor;
}): React.JSX.Element | null {
	const tale = useTaleAppStore((state) => state.document.tale);
	const scene = tale.indexMap.scenesById[anchor.sceneId];
	if (!scene) return null;
	const fixedFragments = resolveIds(
		scene.fixedElementIds,
		tale.indexMap.elementsById,
	);
	if (fixedFragments.length === 0) return null;
	const clipped = fixedFragments.filter(
		(element) => element.placement.overflow !== "visible",
	);
	const overflowing = fixedFragments.filter(
		(element) => element.placement.overflow === "visible",
	);

	return (
		<>
			{clipped.length > 0 ? (
				<FixedFragmentLayer
					anchor={anchor}
					elements={clipped}
					overflow="hidden"
				/>
			) : null}
			{overflowing.length > 0 ? (
				<FixedFragmentLayer
					anchor={anchor}
					elements={overflowing}
					overflow="visible"
				/>
			) : null}
		</>
	);
}

/**
 * Renders one scene-local viewport layer with a shared clipping policy.
 *
 * @param props - Layer anchor, elements, overflow, and path callback.
 * @returns One engine-positioned fixed layer.
 *
 * @example
 * <FixedFragmentLayer anchor={anchor} elements={elements} overflow="hidden" onChoosePath={choosePath} />
 */
function FixedFragmentLayer({
	anchor,
	elements,
	overflow,
}: {
	anchor: Anchor;
	elements: ResolvedTaleElement[];
	overflow: "hidden" | "visible";
}): React.JSX.Element {
	return (
		<div
			data-reader-component="FixedElements"
			data-reader-fixed-scene-id={anchor.sceneId}
			data-reader-role={
				overflow === "hidden"
					? "clipped-fixed-element-layer"
					: "overflowing-fixed-element-layer"
			}
			className="pointer-events-none invisible absolute top-0 left-0"
			style={{ overflow }}
		>
			{elements.map((element, index) => (
				<div
					key={element.id}
					data-reader-component="FixedElements"
					data-reader-role="fixed-element-frame"
					className="pointer-events-auto absolute flex items-center justify-center"
					style={{
						fontSize: element.style?.fontSize,
						fontWeight: element.style?.fontWeight,
						height: element.style?.height,
						lineHeight: element.style?.lineHeight,
						maxHeight: element.style?.maxHeight,
						maxWidth: element.style?.maxWidth,
						minHeight: element.style?.minHeight,
						minWidth: element.style?.minWidth,
						textAlign: element.style?.textAlign,
						...positionedStyle(element.placement),
					}}
				>
					<div
						data-reader-component="FixedElements"
						data-reader-role="fixed-element-content"
						className="w-full"
					>
						<TaleElement element={element} index={index} />
					</div>
				</div>
			))}
		</div>
	);
}
