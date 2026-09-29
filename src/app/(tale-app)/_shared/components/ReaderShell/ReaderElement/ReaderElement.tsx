"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { useTaleRenderSlots } from "../../../contexts/TaleRenderContext";
import type { ResolvedTaleElement } from "../../../types";
import { AudioElement } from "./elements/AudioElement";
import { ChoiceButtonElement } from "./elements/ChoiceButtonElement";
import { CodexEntryElement } from "./elements/CodexEntryElement";
import { DefaultElement } from "./elements/DefaultElement";
import { ImageElement } from "./elements/ImageElement";
import { QuoteElement } from "./elements/QuoteElement";
import { SoundCueElement } from "./elements/SoundCueElement";
import { VideoElement } from "./elements/VideoElement";

type ReaderElementProps = {
	children?: ReactNode;
	contentSized?: boolean;
	element: ResolvedTaleElement;
	index: number;
	onClickCapture?: MouseEventHandler<HTMLDivElement>;
	onDoubleClick?: MouseEventHandler<HTMLDivElement>;
};

/**
 * Renders one semantic fragment using the base reader fragment implementations.
 *
 * @param props - Reader fragment properties.
 * @param props.children - Optional add-on UI layered before the fragment content.
 * @param props.contentSized - Whether the owning block uses content-derived sizing.
 * @param props.fragment - Fragment to render.
 * @param props.index - Fragment index inside its owning node or layer.
 * @returns Fragment container and content.
 *
 * @example
 * <ReaderElement element={fragment} index={0} />
 */
export function ReaderElement({
	children,
	contentSized = false,
	element,
	index,
	onClickCapture,
	onDoubleClick,
}: ReaderElementProps): React.JSX.Element {
	const { TextElementContent } = useTaleRenderSlots();
	const TextContent =
		TextElementContent && element.type === "text"
			? TextElementContent
			: DefaultElement;
	if (element.type === "audio") {
		return (
			<div
				data-reader-component="ReaderElement"
				data-reader-element-id={element.id}
				data-reader-element-type={element.type}
				data-reader-role="audio-element-anchor"
				className="pointer-events-none absolute h-px w-px overflow-hidden"
				onClickCapture={onClickCapture}
				onDoubleClick={onDoubleClick}
			>
				<AudioElement element={element} />
			</div>
		);
	}

	return (
		<div
			data-reader-component="ReaderElement"
			data-reader-element-id={element.id}
			data-reader-element-type={element.type}
			data-reader-role="element-container"
			className="group/element relative h-full w-full"
			onClickCapture={onClickCapture}
			onDoubleClick={onDoubleClick}
		>
			{children}
			{element.type === "video" ? (
				<VideoElement element={element} />
			) : element.type === "choiceButton" ? (
				<ChoiceButtonElement element={element} />
			) : element.type === "codexEntry" ? (
				<CodexEntryElement element={element} />
			) : element.type === "image" ? (
				<ImageElement contentSized={contentSized} element={element} />
			) : element.type === "quote" ? (
				<QuoteElement element={element} />
			) : element.type === "soundCue" ? (
				<SoundCueElement element={element} />
			) : (
				<TextContent element={element} index={index} />
			)}
		</div>
	);
}
