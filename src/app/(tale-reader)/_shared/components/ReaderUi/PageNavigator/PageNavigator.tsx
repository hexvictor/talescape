"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight, Grid3X3, Pin, PinOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePageNavigatorState } from "../../../hooks/store/useReaderNavigationSelectors";
import { usePinnedHoverPanel } from "../../../hooks/usePinnedHoverPanel";
import type { ReaderContentsPage } from "../../../types";
import { EntryTypeIcon } from "../EntryNavigator/EntryTypeIcon";

/**
 * Renders route-visible page navigation and a grouped page grid.
 *
 * @returns The page navigator.
 *
 * @example
 * <PageNavigator />
 */
export function PageNavigator(): React.JSX.Element | null {
	const { compiled, location, scrollApi } = usePageNavigatorState();
	const [open, setOpen] = useState(false);
	const panel = usePinnedHoverPanel(true);
	if (!compiled || !location) return null;

	const pageIndex = compiled.pageIndexById[location.pageId] ?? -1;
	const currentPage = compiled.pages[pageIndex];
	const currentEntry = compiled.entries.find(
		(entry) => entry.id === location.entryId,
	);
	const previous = compiled.pages[pageIndex - 1];
	const next = compiled.pages[pageIndex + 1];
	if (!currentPage || !currentEntry) return null;

	/**
	 * Navigates to a compiled page.
	 *
	 * @param page - Destination page.
	 * @returns Nothing.
	 */
	const jump = (page: ReaderContentsPage): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(page.firstBlockId);
		setOpen(false);
	};

	const paginatedCount = compiled.pages.filter(
		(page) => page.isPaginated,
	).length;
	const currentLabel =
		currentPage.isPaginated && currentPage.number !== null
			? `Page ${currentPage.number} of ${paginatedCount}`
			: currentPage.label;

	return (
		<nav
			data-reader-ui="true"
			aria-label="Reader page navigation"
			className="-translate-x-1/2 pointer-events-auto absolute bottom-4 left-1/2 z-40 max-w-[calc(100vw-2rem)]"
			onMouseEnter={() => panel.setHovered(true)}
			onMouseLeave={() => {
				panel.setHovered(false);
				if (!panel.pinned) setOpen(false);
			}}
		>
			<AnimatePresence>
				{open && panel.expanded ? (
					<motion.div
						className="absolute right-0 bottom-[calc(100%+0.5rem)] left-0 max-h-[min(34rem,70vh)] min-w-[min(32rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-white/12 bg-black/90 p-3 shadow-2xl backdrop-blur-md [scrollbar-width:none]"
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 6 }}
						transition={{ duration: 0.16 }}
					>
						{compiled.contents.map((part) => (
							<section key={part.id} className="mb-4 last:mb-0">
								<h2 className="mb-2 font-bold text-[10px] text-white/40 uppercase">
									{part.title}
								</h2>
								{part.entries.map((entry) => (
									<div
										key={entry.id}
										className="mb-3 border-white/8 border-b pb-3 last:mb-0 last:border-0 last:pb-0"
									>
										<p className="mb-2 flex items-center gap-2 text-white/65 text-xs">
											<span className="grid h-5 w-5 place-items-center rounded bg-white/8 text-[9px]">
												{entry.type === "chapter" ? (
													entry.chapterNumber
												) : (
													<EntryTypeIcon type={entry.type} size={11} />
												)}
											</span>
											{entry.title}
										</p>
										<div className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-1.5">
											{entry.pages.map((page) => (
												<button
													key={page.id}
													type="button"
													title={`${entry.title} · ${page.label} · ${page.title}`}
													aria-label={`Go to ${page.label}`}
													className={clsx(
														"grid min-h-11 place-items-center rounded border px-1 font-semibold text-[10px]",
														page.id === currentPage.id
															? "border-[#d9b56f] bg-[#d9b56f] text-black"
															: "border-white/12 text-white/62 hover:bg-white/8 hover:text-white",
													)}
													onClick={() => jump(page)}
												>
													{page.number ?? (
														<EntryTypeIcon type={entry.type} size={14} />
													)}
												</button>
											))}
										</div>
									</div>
								))}
							</section>
						))}
					</motion.div>
				) : null}
			</AnimatePresence>
			{!panel.expanded ? (
				<button
					type="button"
					aria-label="Show page navigation"
					className="grid h-5 w-16 place-items-center rounded-t-md border border-white/10 border-b-0 bg-black/46 text-white/24 transition hover:bg-black/72 hover:text-white/72"
					onClick={panel.togglePinned}
				>
					<Grid3X3 size={11} />
				</button>
			) : (
				<div className="relative flex items-center gap-1.5 rounded-lg border border-white/12 bg-black/76 p-1.5 shadow-2xl backdrop-blur-md">
					<button
						type="button"
						aria-label={
							panel.pinned ? "Unpin page navigation" : "Pin page navigation"
						}
						title={
							panel.pinned
								? "Hide when the pointer leaves"
								: "Keep page navigation visible"
						}
						className="-top-5 absolute right-2 grid h-5 w-8 place-items-center rounded-t border border-white/10 border-b-0 bg-black/62 text-white/28 hover:text-white"
						onClick={() => {
							panel.togglePinned();
							if (panel.pinned) setOpen(false);
						}}
					>
						{panel.pinned ? <Pin size={10} /> : <PinOff size={10} />}
					</button>
					<button
						type="button"
						aria-label="Previous page"
						className="grid h-9 w-9 place-items-center rounded border border-white/10 text-white/70 disabled:opacity-25"
						disabled={!previous}
						onClick={() => previous && jump(previous)}
					>
						<ArrowLeft size={16} />
					</button>
					<button
						type="button"
						aria-expanded={open}
						className="min-w-36 px-3 text-center"
						onClick={() => setOpen((current) => !current)}
					>
						<p className="truncate font-semibold text-white/86 text-xs">
							{currentLabel}
						</p>
						<p className="truncate text-[10px] text-white/42">
							{currentEntry.title}
						</p>
					</button>
					<button
						type="button"
						aria-label="Next page"
						className="grid h-9 w-9 place-items-center rounded border border-white/10 text-white/70 disabled:opacity-25"
						disabled={!next}
						onClick={() => next && jump(next)}
					>
						<ArrowRight size={16} />
					</button>
				</div>
			)}
		</nav>
	);
}
