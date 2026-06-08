"use client";

import clsx from "clsx";
import type { ReaderContentsEntry } from "../../../types";

export function EntryPagesGrid({
	currentBlockId,
	entry,
	onNavigate,
}: {
	currentBlockId: string | null;
	entry: ReaderContentsEntry;
	onNavigate: (blockId: string) => void;
}): React.JSX.Element | null {
	if (entry.pages.length <= 1) return null;

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))] gap-1.5 px-2 pb-2 pl-10">
			{entry.pages.map((page) => (
				<button
					key={page.id}
					type="button"
					title={`${page.label}: ${page.title}`}
					aria-label={`Go to ${page.label}: ${page.title}`}
					className={clsx(
						"min-h-9 rounded border px-2 font-bold text-[10px] transition",
						page.blockIds.includes(currentBlockId ?? "")
							? "border-[#d9b56f] bg-[#d9b56f] text-black"
							: "border-white/12 text-white/62 hover:bg-white/10 hover:text-white",
					)}
					onClick={() => onNavigate(page.firstBlockId)}
				>
					{page.number ?? page.label}
				</button>
			))}
		</div>
	);
}
