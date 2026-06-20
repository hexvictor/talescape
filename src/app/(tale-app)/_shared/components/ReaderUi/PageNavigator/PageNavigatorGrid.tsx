"use client";

import clsx from "clsx";
import { useState } from "react";
import { useHorizontalDragNavigation } from "../../../hooks/useHorizontalDragNavigation";
import { getBoundedNavigationIndices } from "../../../services/getBoundedNavigationIndices";
import type { ReaderContentsEntry, ReaderContentsPage } from "../../../types";
import { EntryTypeIcon } from "../EntryNavigator/EntryTypeIcon";
import { ReaderTypeIcon } from "../EntryNavigator/ReaderTypeIcon";

type PageNavigatorGridProps = {
	currentPageId: string;
	entries: ReaderContentsEntry[];
	onNavigate: (page: ReaderContentsPage) => void;
	pages: ReaderContentsPage[];
};

/**
 * Renders a bounded, wheel-browsable sequence of route-visible pages.
 *
 * @param props - Compiled pages, entries, active page, and navigation callback.
 * @returns A compact page rail with route edges and omitted-range controls.
 *
 * @example
 * <PageNavigatorGrid pages={pages} entries={entries} currentPageId={id} onNavigate={jump} />
 */
export function PageNavigatorGrid({
	currentPageId,
	entries,
	onNavigate,
	pages,
}: PageNavigatorGridProps): React.JSX.Element {
	const currentIndex = Math.max(
		pages.findIndex((page) => page.id === currentPageId),
		0,
	);
	const [browseIndex, setBrowseIndex] = useState(currentIndex);
	const entryById = new Map(entries.map((entry) => [entry.id, entry]));
	const navigationIndices = getBoundedNavigationIndices({
		activeIndex: currentIndex,
		browseIndex,
		itemCount: pages.length,
	});
	const moveBrowseIndex = (direction: -1 | 1): void => {
		setBrowseIndex((index) =>
			Math.max(0, Math.min(pages.length - 1, index + direction)),
		);
	};
	const dragNavigation = useHorizontalDragNavigation({
		onStep: moveBrowseIndex,
	});

	return (
		<div
			data-reader-component="PageNavigatorGrid"
			data-reader-role="page-window"
			className="flex items-center justify-center gap-1.5 p-3"
			{...dragNavigation}
			style={{ touchAction: "pan-y" }}
			onWheel={(event) => {
				event.preventDefault();
				event.stopPropagation();
				moveBrowseIndex(event.deltaY > 0 ? 1 : -1);
			}}
		>
			{navigationIndices.map((navigationIndex) => {
				if (navigationIndex.type === "ellipsis") {
					return (
						<button
							data-reader-component="PageNavigatorGrid"
							data-reader-role="ellipsis-control"
							key={navigationIndex.id}
							type="button"
							aria-label="Browse more pages"
							className="grid h-8 w-7 shrink-0 place-items-center rounded-full text-[10px] text-white/32 transition hover:bg-white/8 hover:text-white/70"
							onClick={() => setBrowseIndex(navigationIndex.targetIndex)}
						>
							•••
						</button>
					);
				}
				const page = pages[navigationIndex.index];
				if (!page) return null;
				const entry = entryById.get(page.entryId);
				const active = page.id === currentPageId;
				return (
					<button
						data-reader-component="PageNavigatorGrid"
						data-reader-page-id={page.id}
						data-reader-role="page-control"
						key={page.id}
						type="button"
						title={`${entry?.title ?? "Entry"} · ${page.label}: ${page.title}`}
						aria-label={`Go to ${page.label}`}
						className={clsx(
							"relative grid h-8 w-8 shrink-0 place-items-center rounded-full border font-bold text-[9px] transition",
							active
								? "border-[#d9b56f] bg-[#d9b56f] text-black shadow-[0_0_0_3px_rgba(217,181,111,0.12)]"
								: page.hasChoiceBlock
									? "border-[#8bcf90]/50 bg-[#8bcf90]/12 text-[#d8f5da] hover:border-[#8bcf90]/75 hover:bg-[#8bcf90]/18 hover:text-white"
									: "border-white/12 bg-white/[0.035] text-white/62 hover:border-white/30 hover:bg-white/10 hover:text-white",
						)}
						onClick={() => {
							onNavigate(page);
						}}
					>
						{page.number ?? <ReaderTypeIcon type={page.type} size={12} />}
						<span
							className={clsx(
								"-top-1 -right-1 absolute grid h-4 w-4 place-items-center rounded-full border text-[7px]",
								active
									? "border-black/15 bg-black text-white"
									: page.hasChoiceBlock
										? "border-[#8bcf90]/35 bg-[#112117] text-[#d8f5da]"
										: "border-white/12 bg-black text-white/55",
							)}
						>
							{entry?.type === "chapter" ? (
								entry.chapterNumber
							) : entry ? (
								<EntryTypeIcon type={entry.type} size={8} />
							) : null}
						</span>
					</button>
				);
			})}
		</div>
	);
}
