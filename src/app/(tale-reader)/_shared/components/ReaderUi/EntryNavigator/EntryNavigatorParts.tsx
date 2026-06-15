"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useHorizontalDragNavigation } from "../../../hooks/useHorizontalDragNavigation";
import { getBoundedNavigationIndices } from "../../../services/getBoundedNavigationIndices";
import type { ReaderContentsEntry, ReaderContentsPart } from "../../../types";
import { ReaderTypeIcon } from "./ReaderTypeIcon";

type PartSelectorProps = {
	currentPart: ReaderContentsPart | undefined;
	onOpenChange: (open: boolean) => void;
	onSelect: (part: ReaderContentsPart) => void;
	open: boolean;
	parts: ReaderContentsPart[];
};

/**
 * Renders the active part control and part selection popover.
 *
 * @param props - Part selection state and callbacks.
 * @returns The part selector.
 */
export function PartSelector({
	currentPart,
	onOpenChange,
	onSelect,
	open,
	parts,
}: PartSelectorProps): React.JSX.Element {
	const currentIndex = Math.max(
		parts.findIndex((part) => part.id === currentPart?.id),
		0,
	);
	return (
		<div
			data-reader-component="PartSelector"
			data-reader-role="part-selection"
			className="relative mb-3 flex items-center gap-0.5"
		>
			<button
				type="button"
				aria-label="Previous part"
				disabled={currentIndex === 0}
				className="grid h-6 w-4 place-items-center rounded-full text-white/45 transition hover:bg-white/8 hover:text-white disabled:opacity-20"
				onClick={() => {
					const previous = parts[currentIndex - 1];
					if (previous) onSelect(previous);
				}}
			>
				<ChevronLeft size={10} />
			</button>
			<button
				type="button"
				aria-label="Select story part"
				aria-expanded={open}
				className="grid h-8 w-8 rotate-45 place-items-center rounded-[3px] border border-white/15 bg-white/8 font-black text-white transition hover:border-[#d9b56f]/65 hover:bg-[#d9b56f]/12"
				onClick={() => onOpenChange(!open)}
			>
				<span className="-rotate-45 text-[11px]">{currentIndex + 1}</span>
			</button>
			<button
				type="button"
				aria-label="Next part"
				disabled={currentIndex >= parts.length - 1}
				className="grid h-6 w-4 place-items-center rounded-full text-white/45 transition hover:bg-white/8 hover:text-white disabled:opacity-20"
				onClick={() => {
					const next = parts[currentIndex + 1];
					if (next) onSelect(next);
				}}
			>
				<ChevronRight size={11} />
			</button>
			{open ? (
				<div className="absolute top-0 right-[calc(100%+0.5rem)] w-64 rounded-lg border border-white/12 bg-black/92 p-2 shadow-2xl backdrop-blur-md">
					<p className="px-2 py-1 font-semibold text-[10px] text-white/45 uppercase">
						Select part
					</p>
					{parts.map((part, index) => (
						<button
							key={part.id}
							type="button"
							className={clsx(
								"flex w-full items-center gap-3 rounded px-2 py-2 text-left",
								part.id === currentPart?.id
									? "bg-[#d9b56f]/18 text-[#f1d296]"
									: "text-white/68 hover:bg-white/8",
							)}
							onClick={() => onSelect(part)}
						>
							<span className="grid h-8 w-8 place-items-center rounded bg-white/8 font-bold text-xs">
								{index + 1}
							</span>
							<span className="min-w-0">
								<span className="block truncate font-semibold text-xs">
									{part.title}
								</span>
								<span className="block text-[10px] text-white/42">
									{part.entries.length} entries · {part.pageCount} pages
								</span>
							</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

type EntryPageFlyoutProps = {
	currentPageId: string | null;
	entry: ReaderContentsEntry;
	onNavigate: (blockId: string) => void;
};

/**
 * Renders entry pages in a horizontal flyout beside the entry rail.
 *
 * @param props - Entry pages and active page navigation state.
 * @returns Horizontal page flyout.
 *
 * @example
 * <EntryPageFlyout entry={entry} currentPageId={pageId} onNavigate={jump} />
 */
export function EntryPageFlyout({
	currentPageId,
	entry,
	onNavigate,
}: EntryPageFlyoutProps): React.JSX.Element {
	const currentIndex = Math.max(
		entry.pages.findIndex((page) => page.id === currentPageId),
		0,
	);
	const [manualBrowseIndex, setManualBrowseIndex] = useState<number | null>(
		null,
	);
	const navigationIndices = getBoundedNavigationIndices({
		activeIndex: currentIndex,
		browseIndex: manualBrowseIndex ?? currentIndex,
		itemCount: entry.pages.length,
		visibleItemCount: 5,
	});
	const moveBrowseIndex = (direction: -1 | 1): void => {
		setManualBrowseIndex((index) =>
			Math.max(
				0,
				Math.min(entry.pages.length - 1, (index ?? currentIndex) + direction),
			),
		);
	};
	const dragNavigation = useHorizontalDragNavigation({
		onStep: moveBrowseIndex,
	});

	return (
		<div
			data-reader-component="EntryPageFlyout"
			data-reader-role="entry-page-window"
			className="pointer-events-auto flex items-center justify-center gap-1 overflow-hidden rounded-lg border border-white/12 bg-black/92 p-2 shadow-2xl backdrop-blur-md"
			{...dragNavigation}
			style={{ touchAction: "pan-y" }}
			onWheel={(event) => {
				event.preventDefault();
				event.stopPropagation();
				if (entry.pages.length <= 6) return;
				moveBrowseIndex(event.deltaY > 0 ? 1 : -1);
			}}
		>
			{navigationIndices.map((navigationIndex) => {
				if (navigationIndex.type === "ellipsis") {
					return (
						<button
							key={navigationIndex.id}
							type="button"
							aria-label="Browse more pages"
							className="grid h-7 w-5 shrink-0 place-items-center text-[9px] text-white/35 hover:text-white/70"
							onClick={() => setManualBrowseIndex(navigationIndex.targetIndex)}
						>
							•••
						</button>
					);
				}
				const page = entry.pages[navigationIndex.index];
				if (!page) return null;
				return (
					<button
						key={page.id}
						data-reader-component="EntryPageFlyout"
						data-reader-page-id={page.id}
						data-reader-role="page-control"
						type="button"
						title={page.title}
						className={clsx(
							"flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border px-2 font-semibold text-[9px]",
							page.id === currentPageId
								? "border-[#d9b56f] bg-[#d9b56f] text-black"
								: page.hasChoiceBlock
									? "border-[#8bcf90]/50 bg-[#8bcf90]/12 text-[#d8f5da] hover:border-[#8bcf90]/75 hover:bg-[#8bcf90]/18 hover:text-white"
									: "border-white/12 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
						)}
						onClick={() => onNavigate(page.firstBlockId)}
					>
						{page.number ?? <ReaderTypeIcon type={page.type} size={13} />}
					</button>
				);
			})}
		</div>
	);
}
