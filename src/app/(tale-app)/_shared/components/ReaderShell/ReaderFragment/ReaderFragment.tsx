"use client";

import type { ResolvedTaleFragment, TalePath } from "../../../types";
import { ChoiceButtonFragment } from "./fragments/ChoiceButtonFragment";
import { DefaultFragment } from "./fragments/DefaultFragment";
import { ImageFragment } from "./fragments/ImageFragment";
import { QuoteFragment } from "./fragments/QuoteFragment";
import { SoundCueFragment } from "./fragments/SoundCueFragment";

export function ReaderFragment({
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
			data-reader-component="ReaderFragment"
			data-reader-fragment-id={fragment.id}
			data-reader-fragment-type={fragment.type}
			data-reader-role="fragment-container"
			className="group/fragment relative h-full w-full"
		>
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
			) : (
				<DefaultFragment fragment={fragment} index={index} />
			)}
		</div>
	);
}
