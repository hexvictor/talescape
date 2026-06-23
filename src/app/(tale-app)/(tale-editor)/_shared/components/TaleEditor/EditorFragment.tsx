"use client";

import { ChoiceButtonFragment } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderFragment/fragments/ChoiceButtonFragment";
import { DefaultFragment } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderFragment/fragments/DefaultFragment";
import { ImageFragment } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderFragment/fragments/ImageFragment";
import { QuoteFragment } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderFragment/fragments/QuoteFragment";
import { SoundCueFragment } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderFragment/fragments/SoundCueFragment";
import type {
	ResolvedTaleFragment,
	TalePath,
} from "~/app/(tale-app)/_shared/types";
import { EditorFragmentOverlay } from "./EditorFragmentOverlay";
import { EditorTextFragmentContent } from "./EditorTextFragmentContent";

/**
 * Renders a fragment with editor-only overlays and inline text editing.
 *
 * @param props - Editor fragment properties.
 * @param props.contentSized - Whether the owning block uses content-derived sizing.
 * @param props.fragment - Fragment to render.
 * @param props.index - Fragment index inside its owning node or layer.
 * @param props.onChoosePath - Optional choice-path callback.
 * @returns Fragment content with editor controls layered inside it.
 *
 * @example
 * <EditorFragment fragment={fragment} index={0} />
 */
export function EditorFragment({
	contentSized = false,
	fragment,
	index,
	onChoosePath,
}: {
	contentSized?: boolean;
	fragment: ResolvedTaleFragment;
	index: number;
	onChoosePath?: (path: TalePath) => void;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="EditorFragment"
			data-reader-fragment-id={fragment.id}
			data-reader-fragment-type={fragment.type}
			data-reader-role="fragment-container"
			className="group/fragment relative h-full w-full"
		>
			<EditorFragmentOverlay fragment={fragment} />
			{fragment.type === "choiceButton" ? (
				<ChoiceButtonFragment
					fragment={fragment}
					onChoosePath={onChoosePath ?? (() => undefined)}
				/>
			) : fragment.type === "image" ? (
				<ImageFragment contentSized={contentSized} fragment={fragment} />
			) : fragment.type === "quote" ? (
				<QuoteFragment fragment={fragment} />
			) : fragment.type === "soundCue" ? (
				<SoundCueFragment fragment={fragment} />
			) : fragment.type === "text" ? (
				<EditorTextFragmentContent fragment={fragment} index={index} />
			) : (
				<DefaultFragment fragment={fragment} index={index} />
			)}
		</div>
	);
}
