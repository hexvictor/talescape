import type { BookEntry } from "~/lib/data";
import { ScrollIndicator } from "../../ScrollIndicator";
import { TalePage } from "../../TalePage";
import React from "react";

type CoverEntryProps = {
	entry: BookEntry;
};

export function CoverEntryComponent({ entry }: CoverEntryProps) {
	return (
		<div
			id={`entry-${entry.id}`}
			className="relative min-h-screen space-y-12 bg-purple-900 text-white"
		>
			<div className="mt-20 mb-16 text-center">
				<h1 className="font-bold text-5xl">{entry.title}</h1>
			</div>
			<ScrollIndicator />
			{entry.pages.map((page) => (
				<div
					id={`page-${page.id}`}
					key={page.id}
					className="scroll-target border-t pt-6"
				>
					<TalePage page={page} />
				</div>
			))}
		</div>
	);
}

export default React.memo(CoverEntryComponent);
