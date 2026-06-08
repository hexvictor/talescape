"use client";

import type { ResolvedTaleFragment, TalePath } from "../../../types";
import { InspectorButton } from "../InspectorButton/InspectorButton";
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
}) {
	return (
		<div
			data-reader-fragment-id={fragment.id}
			className="group/fragment relative"
		>
			<InspectorButton
				label={`Edit fragment ${fragment.id}`}
				revealOnHover
				target={{
					blockId: fragment.blockId,
					id: fragment.id,
					type: "fragment",
				}}
			/>
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
