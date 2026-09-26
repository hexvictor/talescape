"use client";

import { useTaleRenderSlots } from "../../../contexts/TaleRenderContext";
import type { Anchor, ResolvedTaleElement, TaleFrame } from "../../../types";
import { TaleElement } from "../TaleElement/TaleElement";
import { getFrameElementStyle, getFrameStyle } from "./frameStyles";

/**
 * Renders a reader frame and its child frames/elements.
 *
 * @param props - Node render props.
 * @param props.anchor - Current Scene anchor.
 * @param props.frameId - Node id to render.
 * @returns The frame subtree or null when the frame cannot be found.
 *
 * @example
 * <FrameRenderer anchor={anchor} contentSized={false} frameId={rootFrameId} />
 */
export function FrameRenderer({
	anchor,
	contentSized,
	elementsById,
	measurement = false,
	frameId,
	framesById,
	parentFrame,
}: {
	anchor: Anchor;
	contentSized: boolean;
	elementsById: Record<string, ResolvedTaleElement>;
	measurement?: boolean;
	frameId: string;
	framesById: Record<string, TaleFrame>;
	parentFrame?: TaleFrame;
}): React.JSX.Element | null {
	const { FrameOverlay } = useTaleRenderSlots();
	const frame = framesById[frameId];
	if (!frame) return null;
	const defaultState =
		parentFrame?.defaultElementStates?.[frame.id] ?? "active";

	return (
		<div
			data-reader-component="FrameRenderer"
			data-reader-frame-id={frame.id}
			data-reader-role="layout-frame"
			className="group/frame relative"
			style={{
				...getFrameStyle(frame, measurement),
				...(!measurement && defaultState === "inactive" ? { opacity: 0 } : {}),
			}}
		>
			{FrameOverlay ? (
				<FrameOverlay sceneId={anchor.sceneId} frameId={frame.id} />
			) : null}
			{frame.children.map((child, index) => {
				if (child.type === "frame") {
					return (
						<FrameRenderer
							key={child.frameId}
							anchor={anchor}
							contentSized={contentSized}
							elementsById={elementsById}
							measurement={measurement}
							frameId={child.frameId}
							framesById={framesById}
							parentFrame={frame}
						/>
					);
				}
				const element = elementsById[child.elementId];
				if (!element || element.placement.mode !== "normal") return null;
				return (
					<ElementFrame
						key={element.id}
						element={element}
						index={index}
						anchor={anchor}
						contentSized={contentSized}
						measurement={measurement}
						parentFrame={frame}
					/>
				);
			})}
		</div>
	);
}

/**
 * Wraps a element with frame-aware style before rendering its content.
 *
 * @param props - Element frame props.
 * @param props.anchor - Current Scene anchor.
 * @param props.element - Element to render.
 * @param props.index - Element index within the parent frame.
 * @param props.parentFrame - Node that owns the element.
 * @returns The styled element frame.
 *
 * @example
 * <ElementFrame anchor={anchor} element={element} index={0} parentFrame={frame} onChoosePath={choose} />
 */
function ElementFrame({
	anchor,
	contentSized,
	element,
	index,
	measurement,
	parentFrame,
}: {
	anchor: Anchor;
	contentSized: boolean;
	element: ResolvedTaleElement;
	index: number;
	measurement: boolean;
	parentFrame: TaleFrame;
}) {
	const initialState =
		parentFrame.defaultElementStates?.[element.id] ?? "inactive";
	const visibleEarly =
		parentFrame.visibleDuringSceneIntro === true ||
		parentFrame.visibleDuringSceneOutro === true ||
		parentFrame.visibleDuringPreviousBridge === true ||
		parentFrame.visibleDuringNextBridge === true ||
		parentFrame.visibleBeforeIntro === true;
	return (
		<div
			data-reader-component="ElementFrame"
			data-reader-element-id={element.id}
			data-reader-role="frame-element-frame"
			className="relative min-w-0"
			style={{
				...getFrameElementStyle(element.style, parentFrame),
				...(!measurement && visibleEarly
					? initialState === "inactive"
						? { opacity: 0 }
						: {}
					: {}),
			}}
		>
			<TaleElement
				contentSized={contentSized}
				element={element}
				index={index}
			/>
		</div>
	);
}
