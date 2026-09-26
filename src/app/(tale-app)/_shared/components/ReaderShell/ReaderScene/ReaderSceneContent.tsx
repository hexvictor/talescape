"use client";

import cn from "~/lib/utils/cn";
import { useTaleAppStoreShallow } from "../../../contexts/TaleAppStoreContext";
import { resolveIds } from "../../../services/taleLookups";
import type {
	Anchor,
	ResolvedTaleElement,
	ResolvedTaleScene,
	SceneContainer,
	TaleFrame,
} from "../../../types";
import { TaleElement } from "../TaleElement/TaleElement";
import { FrameRenderer } from "./FrameRenderer";
import { positionedStyle } from "./positionedStyle";
import { getSharedReaderStyle } from "./readerStyleProperties";

/**
 * Renders the shared scene content structure for the live reader or the
 * offscreen intrinsic-size measurement pass.
 *
 * @param props - Scene content properties.
 * @param props.anchor - Scene anchor and resolved content.
 * @param props.mode - Live rendering or intrinsic measurement mode.
 * @param props.onChoosePath - Choice path callback.
 * @returns Scene content layers.
 */
export function ReaderSceneContent({
	anchor,
	mode = "render",
}: {
	anchor: Anchor;
	mode?: "measure" | "render";
}): React.JSX.Element | null {
	const { scene, elementsById, framesById } = useTaleAppStoreShallow(
		(state) => ({
			scene: state.document.tale.indexMap.scenesById[anchor.sceneId],
			elementsById: state.document.tale.indexMap.elementsById,
			framesById: state.document.tale.indexMap.framesById,
		}),
	);
	if (!scene) return null;
	const clippedElements = resolveIds(scene.clippedElementIds, elementsById);
	const overflowingElements = resolveIds(
		scene.overflowingElementIds,
		elementsById,
	);
	if (mode === "measure") {
		return (
			<div
				data-reader-component="ReaderSceneContent"
				data-reader-role="measurement-content-layer"
				className="relative inline-block overflow-visible"
			>
				<SceneFrames
					scene={scene}
					measurement
					anchor={anchor}
					contentSized
					elementsById={elementsById}
					framesById={framesById}
				/>
			</div>
		);
	}

	return (
		<>
			<div
				data-reader-component="ReaderSceneContent"
				data-reader-role="clipped-content-layer"
				className="absolute inset-0 overflow-hidden"
			>
				<div
					data-reader-component="ReaderSceneContent"
					data-reader-role="frame-content-layer"
					className="relative h-full w-full overflow-hidden"
				>
					<SceneFrames
						scene={scene}
						anchor={anchor}
						contentSized={scene.size.mode === "content"}
						elementsById={elementsById}
						framesById={framesById}
					/>
				</div>
				{clippedElements.length > 0 ? (
					<PositionedElements
						anchor={anchor}
						contentSized={scene.size.mode === "content"}
						elements={clippedElements}
						framesById={framesById}
					/>
				) : null}
			</div>
			{overflowingElements.length > 0 ? (
				<PositionedElements
					anchor={anchor}
					contentSized={scene.size.mode === "content"}
					elements={overflowingElements}
					framesById={framesById}
				/>
			) : null}
		</>
	);
}

function SceneFrames({
	scene,
	framesById,
	...props
}: {
	scene: ResolvedTaleScene;
	framesById: Record<string, TaleFrame>;
	anchor: Anchor;
	contentSized: boolean;
	measurement?: boolean;
	elementsById: Record<string, ResolvedTaleElement>;
}) {
	const container = scene.container ?? { mode: "stack" as const };
	return (
		<div
			data-reader-role="scene-container"
			className={cn(
				"relative",
				props.measurement ? "inline-block min-h-0 min-w-0" : "h-full w-full",
			)}
			style={getSceneContainerStyle(
				container,
				scene.style,
				props.measurement === true,
			)}
		>
			{scene.container ? (
				scene.frameIds
					.filter((id) => !framesById[id]?.parentFrameId)
					.map((id) => (
						<FrameRenderer
							key={id}
							{...props}
							framesById={framesById}
							frameId={id}
						/>
					))
			) : (
				<FrameRenderer
					{...props}
					frameId={scene.rootFrameId}
					framesById={framesById}
				/>
			)}
		</div>
	);
}

function getSceneContainerStyle(
	container: SceneContainer,
	sceneStyle: ResolvedTaleScene["style"],
	contentSized: boolean,
): React.CSSProperties {
	const style: React.CSSProperties = {
		...getSharedReaderStyle(container.style),
		...getSharedReaderStyle(sceneStyle),
		display: container.mode === "stack" ? "block" : container.mode,
		gap: container.gap ?? container.style?.gap,
		overflow: container.overflow === "visible" ? "visible" : "hidden",
		position: "relative",
	};
	if (!contentSized) {
		style.height ??= "100%";
		style.width ??= "100%";
	}
	if (container.mode === "flex") {
		style.alignContent = container.style?.alignContent;
		style.alignItems = container.style?.alignItems;
		style.columnGap = container.style?.columnGap;
		style.flexDirection =
			container.style?.flexDirection ?? container.direction ?? "column";
		style.flexWrap = container.style?.flexWrap;
		style.justifyContent = container.style?.justifyContent;
		style.rowGap = container.style?.rowGap;
	}
	if (container.mode === "grid") {
		style.alignContent = container.style?.alignContent;
		style.alignItems = container.style?.alignItems;
		style.columnGap = container.style?.columnGap;
		style.gridAutoColumns = container.style?.gridAutoColumns;
		style.gridAutoFlow = container.style?.gridAutoFlow;
		style.gridAutoRows = container.style?.gridAutoRows;
		style.gridTemplateAreas = container.style?.gridTemplateAreas;
		style.gridTemplateColumns =
			container.style?.gridTemplateColumns ??
			(container.columns
				? `repeat(${container.columns}, minmax(0, 1fr))`
				: undefined);
		style.gridTemplateRows =
			container.style?.gridTemplateRows ??
			(container.rows
				? `repeat(${container.rows}, minmax(0, 1fr))`
				: undefined);
		style.justifyContent = container.style?.justifyContent;
		style.justifyItems = container.style?.justifyItems;
		style.rowGap = container.style?.rowGap;
	}
	return style;
}

/**
 * Renders absolute elements in either the clipped or overflowing scene layer.
 *
 * @param props - Positioned element properties.
 * @param props.anchor - Owning scene anchor.
 * @param props.elements - Positioned elements to render.
 * @param props.onChoosePath - Choice path callback.
 * @returns Positioned element elements.
 */
function PositionedElements({
	anchor,
	contentSized,
	elements,
	framesById,
}: {
	anchor: Anchor;
	contentSized: boolean;
	elements: ResolvedTaleElement[];
	framesById: Record<string, TaleFrame>;
}): React.JSX.Element[] {
	return elements.map((element, index) => {
		const frame = element.frameId ? framesById[element.frameId] : undefined;
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
					minHeight: element.style?.minHeight,
					minWidth: element.style?.minWidth,
					textAlign: element.style?.textAlign,
					...positionedStyle(element.placement),
					// zIndex:
					// 	element.placement.zIndex ??
					// 	{
					// 		"scene-underlay": -20,
					// 		"frame-underlay": -10,
					// 		content: 0,
					// 		"frame-overlay": 10,
					// 		"scene-overlay": 20,
					// 	}[element.layer ?? "content"],
					...defaultStateStyle,
				}}
			>
				<div
					data-reader-component="PositionedElements"
					data-reader-role="positioned-element-content"
					className="w-full"
				>
					<TaleElement
						contentSized={contentSized}
						element={element}
						index={index}
					/>
				</div>
			</div>
		);
	});
}
