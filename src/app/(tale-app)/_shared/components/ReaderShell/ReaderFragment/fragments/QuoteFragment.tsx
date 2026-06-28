"use client";

import type { ResolvedTaleFragment } from "../../../../types";

export function QuoteFragment({
	fragment,
}: {
	fragment: ResolvedTaleFragment;
}): React.JSX.Element {
	const paragraphs = (fragment.text ?? "")
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

	return (
		<blockquote
			data-reader-component="QuoteFragment"
			data-reader-role="quote-content"
			data-reader-fragment-id={fragment.id}
			className="rounded-lg border border-[#d9b56f]/35 bg-[#d9b56f]/14 p-5 font-semibold text-xl leading-8 shadow-xl backdrop-blur-md"
		>
			<div className="space-y-6">
				{(paragraphs.length > 0 ? paragraphs : [fragment.text ?? ""]).map(
					(paragraph, index) => (
						<p key={`${fragment.id}-paragraph-${index}`}>{paragraph}</p>
					),
				)}
			</div>

			{fragment.attribution ? (
				<cite className="mt-6 block font-black text-[#d9b56f] text-xs uppercase not-italic tracking-[0.18em]">
					{fragment.attribution}
				</cite>
			) : null}
		</blockquote>
	);
}
