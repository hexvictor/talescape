"use client";

import clsx from "clsx";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import type { ReaderContentsEntry, ReaderContentsPart } from "../../../types";

const VISIBLE_ENTRY_COUNT = 7;
const VISIBLE_PAGE_COUNT = 6;

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
		<div className="relative">
			<button
				type="button"
				aria-label="Select story part"
				aria-expanded={open}
				className="grid h-10 w-10 place-items-center rounded-md border border-white/12 bg-white/7 font-black text-white"
				onClick={() => onOpenChange(!open)}
			>
				{currentIndex + 1}
			</button>
			{open ? (
				<div className="absolute top-0 right-[calc(100%+0.75rem)] w-64 rounded-lg border border-white/12 bg-black/92 p-2 shadow-2xl backdrop-blur-md">
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

type EntryPageRailProps = {
	compact?: boolean;
	currentPageId: string | null;
	entry: ReaderContentsEntry;
	onNavigate: (blockId: string) => void;
};

/**
 * Renders the compact page list expanded below an entry.
 *
 * @param props - Active page, entry, and navigation callback.
 * @returns A compact page rail.
 */
export function EntryPageRail({
	compact = false,
	currentPageId,
	entry,
	onNavigate,
}: EntryPageRailProps): React.JSX.Element {
	const activeIndex = Math.max(
		entry.pages.findIndex((page) => page.id === currentPageId),
		0,
	);
	const start = Math.min(
		Math.max(activeIndex - Math.floor(VISIBLE_PAGE_COUNT / 2), 0),
		Math.max(entry.pages.length - VISIBLE_PAGE_COUNT, 0),
	);
	const pages = entry.pages.slice(start, start + VISIBLE_PAGE_COUNT);
	const activePage = entry.pages.find((page) => page.id === currentPageId);

	if (compact && activePage) {
		return (
			<button
				type="button"
				title={activePage.label}
				className="grid h-7 w-7 place-items-center rounded-full border border-white bg-white text-[9px] text-black"
				onClick={() => onNavigate(activePage.firstBlockId)}
			>
				{activePage.number ?? <BookOpen size={11} />}
			</button>
		);
	}

	return (
		<div className="flex max-h-44 flex-col items-center gap-1 overflow-y-auto py-1 [scrollbar-width:none]">
			{start > 0 ? <ChevronUp size={11} className="text-white/40" /> : null}
			{pages.map((page) => (
				<button
					key={page.id}
					type="button"
					title={page.label}
					className={clsx(
						"grid h-7 w-7 place-items-center rounded-full border text-[9px]",
						page.id === currentPageId
							? "border-white bg-white text-black"
							: "border-white/12 text-white/58 hover:text-white",
					)}
					onClick={() => onNavigate(page.firstBlockId)}
				>
					{page.number ?? <BookOpen size={11} />}
				</button>
			))}
			{start + pages.length < entry.pages.length ? (
				<ChevronDown size={11} className="text-white/40" />
			) : null}
		</div>
	);
}

/**
 * Selects a bounded group of entries centered around the active entry.
 *
 * @param entries - All route-visible entries.
 * @param currentIndex - Active entry index.
 * @returns Visible entries with edge scale metadata.
 */
export function getVisibleEntries(
	entries: ReaderContentsEntry[],
	currentIndex: number,
): Array<{ entry: ReaderContentsEntry; index: number; scale: number }> {
	const start = Math.min(
		Math.max(currentIndex - Math.floor(VISIBLE_ENTRY_COUNT / 2), 0),
		Math.max(entries.length - VISIBLE_ENTRY_COUNT, 0),
	);
	return entries
		.slice(start, start + VISIBLE_ENTRY_COUNT)
		.map((entry, localIndex, visible) => ({
			entry,
			index: start + localIndex,
			scale:
				visible.length < VISIBLE_ENTRY_COUNT ||
				(localIndex > 0 && localIndex < visible.length - 1)
					? 1
					: 0.78,
		}));
}
