import type { TaleEntry } from "~/lib/data";
import React from "react";
import { TalePage } from "../../reader";

type ChapterEntryProps = {
	entry: TaleEntry;
};

export function ChapterEntryComponent({ entry }: ChapterEntryProps) {
	return (
		<div
			id={`anchor-${entry.id}`}
			className="mx-auto min-h-screen max-w-3xl space-y-12 px-4 sm:px-6 lg:px-8"
		>
			<div className="mt-8 mb-12 text-center">
				<div className="text-muted-foreground text-xs uppercase tracking-widest">
					{entry.type.replace(/_/g, " ")}
				</div>
				<h1 className="font-bold text-3xl">{entry.title}</h1>
			</div>
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

export default React.memo(ChapterEntryComponent);
