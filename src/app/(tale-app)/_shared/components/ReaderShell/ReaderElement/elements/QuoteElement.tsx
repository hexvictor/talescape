"use client";

import type { ResolvedTaleElement } from "../../../../types";

export function QuoteElement({
	element,
}: {
	element: ResolvedTaleElement;
}): React.JSX.Element {
	const paragraphs = (element.text ?? "")
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

	return (
		<blockquote
			data-reader-component="QuoteElement"
			data-reader-role="quote-content"
			data-reader-element-id={element.id}
			className="rounded-lg border border-[#d9b56f]/35 bg-[#d9b56f]/14 p-5 font-semibold text-xl leading-8 shadow-xl backdrop-blur-md"
		>
			{(paragraphs.length > 0 ? paragraphs : [element.text ?? ""]).map(
				(paragraph, index, items) => (
					<p
						key={`${element.id}-paragraph-${index}`}
						className={index < items.length - 1 ? "mb-6" : undefined}
					>
						{paragraph}
					</p>
				),
			)}

			{element.attribution ? (
				<cite className="mt-6 block font-black text-[#d9b56f] text-xs uppercase not-italic tracking-[0.18em]">
					{element.attribution}
				</cite>
			) : null}
		</blockquote>
	);
}
