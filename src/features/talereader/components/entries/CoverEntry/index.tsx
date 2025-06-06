import type { TaleEntry } from "~/lib/data";
import React from "react";
import { ScrollIndicator, TalePage } from "../../reader";

type CoverEntryProps = {
	entry: TaleEntry;
};

export function CoverEntryComponent({ entry }: CoverEntryProps) {
	return (
		<div
			id={`anchor-${entry.id}`}
			className="relative min-h-screen space-y-12 bg-purple-900 text-white"
		>
			<div className="mt-20 mb-16 text-center">
				<h1 className="font-bold text-5xl">{entry.title}</h1>
			</div>
			<ScrollIndicator />
			-Bug in scroll -
			{entry.pages.map((page) => (
				<div
					id={`anchor-${page.id}`}
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
