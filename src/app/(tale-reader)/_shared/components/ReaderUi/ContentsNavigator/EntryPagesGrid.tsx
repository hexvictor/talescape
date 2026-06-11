"use client";

import clsx from "clsx";
import { BookOpen } from "lucide-react";
import type { ReaderContentsEntry } from "../../../types";

/**
 * Renders the route-visible pages belonging to a contents entry.
 *
 * @param props - Entry pages, current block, and navigation callback.
 * @returns A compact page button grid or nothing for single-page entries.
 *
 * @example
 * <EntryPagesGrid entry={entry} currentBlockId={blockId} onNavigate={jump} />
 */
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
		<div
			data-reader-component="EntryPagesGrid"
			data-reader-role="entry-page-list"
			className="mt-2 flex flex-wrap gap-2 px-2 pb-3 pl-10"
		>
			{entry.pages.map((page) => (
				<button
					key={page.id}
					data-reader-component="EntryPagesGrid"
					data-reader-role="page-control"
					data-reader-page-id={page.id}
					type="button"
					title={`${page.label}: ${page.title}`}
					aria-label={`Go to ${page.label}: ${page.title}`}
					className={clsx(
						"group/page grid h-9 w-9 place-items-center rounded-full border font-bold text-[10px] transition",
						page.blockIds.includes(currentBlockId ?? "")
							? "border-[#d9b56f] bg-[#d9b56f] text-black shadow-[0_0_0_3px_rgba(217,181,111,0.12)]"
							: "border-white/12 bg-white/[0.035] text-white/62 hover:border-white/30 hover:bg-white/10 hover:text-white",
					)}
					onClick={() => onNavigate(page.firstBlockId)}
				>
					{page.number ?? <BookOpen size={12} />}
				</button>
			))}
		</div>
	);
}
