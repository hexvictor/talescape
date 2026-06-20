"use client";

import { LoremIpsum } from "lorem-ipsum";
import { useMemo } from "react";
import type { ResolvedTaleFragment } from "../../../../types";

const lorem = new LoremIpsum({
	sentencesPerParagraph: { max: 5, min: 3 },
	wordsPerSentence: { max: 12, min: 8 },
});

export function QuoteFragment({
	fragment,
}: {
	fragment: ResolvedTaleFragment;
}): React.JSX.Element {
	const paragraphs = useMemo(() => lorem.generateParagraphs(3).split("\n"), []);

	return (
		<blockquote
			data-reader-component="QuoteFragment"
			data-reader-role="quote-content"
			data-reader-fragment-id={fragment.id}
			className="rounded-lg border border-[#d9b56f]/35 bg-[#d9b56f]/14 p-5 font-semibold text-xl leading-8 shadow-xl backdrop-blur-md"
		>
			<div className="space-y-6">
				{paragraphs.map((paragraph, index) => (
					<p key={`${fragment.id}-paragraph-${index}`}>{paragraph}</p>
				))}
			</div>

			{fragment.attribution ? (
				<cite className="mt-6 block font-black text-[#d9b56f] text-xs uppercase not-italic tracking-[0.18em]">
					{fragment.attribution}
				</cite>
			) : null}
		</blockquote>
	);
}
