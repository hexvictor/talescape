"use client";

import type { ReactNode } from "react";
import { useTaleRenderSlots } from "../../../contexts/TaleRenderContext";
import type { ResolvedTaleFragment } from "../../../types";
import { ChoiceButtonFragment } from "./fragments/ChoiceButtonFragment";
import { CodexEntryFragment } from "./fragments/CodexEntryFragment";
import { DefaultFragment } from "./fragments/DefaultFragment";
import { ImageFragment } from "./fragments/ImageFragment";
import { QuoteFragment } from "./fragments/QuoteFragment";
import { SoundCueFragment } from "./fragments/SoundCueFragment";

type ReaderFragmentProps = {
	children?: ReactNode;
	contentSized?: boolean;
	fragment: ResolvedTaleFragment;
	index: number;
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
 * <ReaderFragment fragment={fragment} index={0} />
 */
export function ReaderFragment({
	children,
	contentSized = false,
	fragment,
	index,
}: ReaderFragmentProps): React.JSX.Element {
	const { TextFragmentContent } = useTaleRenderSlots();
	const TextContent =
		TextFragmentContent && fragment.type === "text"
			? TextFragmentContent
			: DefaultFragment;

	return (
		<div
			data-reader-component="ReaderFragment"
			data-reader-fragment-id={fragment.id}
			data-reader-fragment-type={fragment.type}
			data-reader-role="fragment-container"
			className="group/fragment relative h-full w-full"
		>
			{children}
			{fragment.type === "choiceButton" ? (
				<ChoiceButtonFragment fragment={fragment} />
			) : fragment.type === "codexEntry" ? (
				<CodexEntryFragment fragment={fragment} />
			) : fragment.type === "image" ? (
				<ImageFragment contentSized={contentSized} fragment={fragment} />
			) : fragment.type === "quote" ? (
				<QuoteFragment fragment={fragment} />
			) : fragment.type === "soundCue" ? (
				<SoundCueFragment fragment={fragment} />
			) : (
				<TextContent fragment={fragment} index={index} />
			)}
		</div>
	);
}
