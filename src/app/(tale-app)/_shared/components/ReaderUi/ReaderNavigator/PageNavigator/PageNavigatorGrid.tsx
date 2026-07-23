"use client";

import clsx from "clsx";
import { useState } from "react";
import type {
	ReaderContentsEntry,
	ReaderContentsPage,
} from "~/app/(tale-app)/_shared/types";
import { useHorizontalDragNavigation } from "../../../../hooks/useHorizontalDragNavigation";
import { getBoundedNavigationIndices } from "../../../../services/getBoundedNavigationIndices";
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
							className="grid h-8 w-7 shrink-0 place-items-center rounded-full text-[10px] text-foreground/32 transition hover:bg-foreground/8 hover:text-foreground/70"
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
								? "border-primary bg-primary text-background shadow-[0_0_0_3px_rgba(217,181,111,0.12)]"
								: page.hasChoiceBlock
									? "border-emerald-600/45 bg-emerald-500/12 text-emerald-900 hover:border-emerald-600/75 hover:bg-emerald-500/18 hover:text-foreground dark:border-[#8bcf90]/50 dark:bg-[#8bcf90]/12 dark:text-[#d8f5da] dark:hover:border-[#8bcf90]/75"
									: "border-foreground/12 bg-foreground/[0.035] text-foreground/62 hover:border-foreground/30 hover:bg-foreground/10 hover:text-foreground",
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
									? "border-background/15 bg-background text-foreground"
									: page.hasChoiceBlock
										? "border-emerald-600/35 bg-emerald-500/12 text-emerald-900 dark:border-[#8bcf90]/35 dark:bg-[#112117] dark:text-[#d8f5da]"
										: "border-foreground/12 bg-background text-foreground/55",
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
