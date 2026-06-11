"use client";

import clsx from "clsx";
import { BookOpen } from "lucide-react";
import { useRef } from "react";
import type { ReaderContentsEntry, ReaderContentsPart } from "../../../types";

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
			className="relative mb-2"
		>
			<button
				type="button"
				aria-label="Select story part"
				aria-expanded={open}
				className="grid h-9 w-9 rotate-45 place-items-center rounded-[3px] border border-white/15 bg-white/8 font-black text-white transition hover:border-[#d9b56f]/65 hover:bg-[#d9b56f]/12"
				onClick={() => onOpenChange(!open)}
			>
				<span className="-rotate-45 text-[11px]">{currentIndex + 1}</span>
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
	const containerRef = useRef<HTMLDivElement>(null);

	/**
	 * Centers the current page inside the flyout without scrolling outer UI.
	 *
	 * @param element - Current page button element.
	 * @returns Nothing.
	 */
	const centerCurrentPage = (element: HTMLButtonElement | null): void => {
		const container = containerRef.current;
		if (!container || !element) return;
		const targetLeft =
			element.offsetLeft - (container.clientWidth - element.offsetWidth) / 2;
		container.scrollTo({ behavior: "smooth", left: targetLeft });
	};

	return (
		<div
			ref={containerRef}
			data-reader-component="EntryPageFlyout"
			data-reader-role="entry-page-window"
			className="pointer-events-auto flex w-[7.75rem] snap-x snap-mandatory items-center gap-1.5 overflow-x-auto overscroll-contain rounded-lg border border-white/12 bg-black/92 p-2 shadow-2xl backdrop-blur-md [scrollbar-width:none]"
			onWheel={(event) => {
				event.preventDefault();
				event.stopPropagation();
				event.currentTarget.scrollLeft += event.deltaY + event.deltaX;
			}}
		>
			{entry.pages.map((page) => (
				<button
					key={page.id}
					ref={page.id === currentPageId ? centerCurrentPage : undefined}
					data-reader-component="EntryPageFlyout"
					data-reader-page-id={page.id}
					data-reader-role="page-control"
					type="button"
					title={page.title}
					className={clsx(
						"flex h-8 min-w-8 shrink-0 snap-center items-center justify-center rounded-full border px-2 font-semibold text-[9px]",
						page.id === currentPageId
							? "border-[#d9b56f] bg-[#d9b56f] text-black"
							: "border-white/12 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
					)}
					onClick={() => onNavigate(page.firstBlockId)}
				>
					{page.number ?? <BookOpen size={13} />}
				</button>
			))}
		</div>
	);
}
