"use client";

import clsx from "clsx";
import {
	ChevronDown,
	ChevronUp,
	PanelRightOpen,
	Pin,
	PinOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useEntryNavigatorState } from "../../../hooks/store/useReaderNavigationSelectors";
import { usePinnedHoverPanel } from "../../../hooks/usePinnedHoverPanel";
import type { ReaderContentsEntry } from "../../../types";
import {
	EntryPageRail,
	PartSelector,
	getVisibleEntries,
} from "./EntryNavigatorParts";
import { EntryTypeIcon, getEntryTypeLabel } from "./EntryTypeIcon";

/**
 * Renders the route-aware entry rail with part and page navigation.
 *
 * @returns The entry navigator.
 *
 * @example
 * <EntryNavigator />
 */
export function EntryNavigator(): React.JSX.Element | null {
	const {
		compiled,
		contents,
		currentEntryId,
		currentPageId,
		currentPartId,
		scrollApi,
	} = useEntryNavigatorState();
	const panel = usePinnedHoverPanel(true);
	const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
	const [suppressedEntryId, setSuppressedEntryId] = useState<string | null>(
		null,
	);
	const [partsOpen, setPartsOpen] = useState(false);
	const entries = compiled?.entries ?? [];
	const currentIndex = compiled?.entryIndexById[currentEntryId ?? ""] ?? -1;

	if (!compiled || entries.length <= 1 || currentIndex < 0) return null;

	/**
	 * Navigates to a compiled block while preserving the current reader position.
	 *
	 * @param blockId - Destination block identifier.
	 * @returns Nothing.
	 */
	const jumpToBlock = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId);
	};

	/**
	 * Opens a multi-page entry or navigates directly to a single-page entry.
	 *
	 * @param entry - Destination entry.
	 * @returns Nothing.
	 */
	const selectEntry = (entry: ReaderContentsEntry): void => {
		if (entry.id === currentEntryId) {
			if (entry.pages.length > 1) {
				setSuppressedEntryId((current) =>
					current === entry.id ? null : entry.id,
				);
			}
			return;
		}
		jumpToBlock(entry.firstBlockId);
	};

	const visibleEntries = getVisibleEntries(entries, currentIndex);
	const currentPart =
		contents.find((part) => part.id === currentPartId) ?? contents[0];

	return (
		<nav
			data-reader-ui="true"
			aria-label="Entry navigation"
			className="-translate-y-1/2 pointer-events-auto absolute top-1/2 right-0 z-30 hidden items-center md:flex"
			onMouseEnter={() => panel.setHovered(true)}
			onMouseLeave={() => {
				panel.setHovered(false);
				setHoveredEntryId(null);
				setSuppressedEntryId(null);
			}}
		>
			<button
				type="button"
				aria-label={
					panel.pinned ? "Unpin entry navigation" : "Pin entry navigation"
				}
				className="grid h-12 w-7 place-items-center rounded-l-md border border-white/12 border-r-0 bg-black/78 text-white/45 backdrop-blur-md hover:text-white"
				onClick={panel.togglePinned}
			>
				{panel.expanded ? (
					panel.pinned ? (
						<Pin size={13} />
					) : (
						<PinOff size={13} />
					)
				) : (
					<PanelRightOpen size={15} />
				)}
			</button>
			<AnimatePresence initial={false}>
				{panel.expanded ? (
					<motion.div
						className="relative flex max-h-[84vh] w-16 flex-col items-center gap-2 rounded-l-lg border border-white/12 border-r-0 bg-black/76 py-3 shadow-2xl backdrop-blur-md"
						initial={{ opacity: 0, width: 0 }}
						animate={{ opacity: 1, width: 64 }}
						exit={{ opacity: 0, width: 0 }}
					>
						<PartSelector
							currentPart={currentPart}
							open={partsOpen}
							parts={contents}
							onOpenChange={setPartsOpen}
							onSelect={(part) => {
								jumpToBlock(part.firstBlockId);
								setPartsOpen(false);
							}}
						/>
						<button
							type="button"
							aria-label="Previous entry"
							disabled={currentIndex === 0}
							className="grid h-7 w-7 place-items-center rounded-full text-white/65 hover:bg-white/8 disabled:opacity-20"
							onClick={() => {
								const entry = entries[currentIndex - 1];
								if (entry) jumpToBlock(entry.firstBlockId);
							}}
						>
							<ChevronUp size={16} />
						</button>
						<div className="flex min-h-0 flex-col items-center gap-2 overflow-y-auto [scrollbar-width:none]">
							{visibleEntries.map(({ entry, index, scale }) => {
								const active = entry.id === currentEntryId;
								const expanded =
									entry.id === hoveredEntryId &&
									entry.id !== suppressedEntryId &&
									entry.pages.length > 1;
								return (
									<div
										key={entry.id}
										className="flex flex-col items-center gap-1"
										onMouseEnter={() => {
											setHoveredEntryId(entry.id);
											if (suppressedEntryId !== entry.id) {
												setSuppressedEntryId(null);
											}
										}}
										onMouseLeave={() => {
											setHoveredEntryId(null);
											setSuppressedEntryId(null);
										}}
									>
										<motion.button
											type="button"
											title={`${getEntryTypeLabel(entry.type)}: ${entry.title}`}
											aria-label={`Go to ${entry.title}`}
											className={clsx(
												"grid h-10 w-10 place-items-center rounded-full border font-bold text-xs shadow-lg",
												active
													? "border-[#d9b56f] bg-[#d9b56f] text-black"
													: "border-white/12 bg-white/6 text-white/70 hover:bg-white/12 hover:text-white",
											)}
											animate={{ opacity: scale, scale }}
											onClick={() => selectEntry(entry)}
										>
											{entry.type === "chapter" ? (
												entry.chapterNumber
											) : (
												<EntryTypeIcon type={entry.type} size={16} />
											)}
										</motion.button>
										{expanded ? (
											<EntryPageRail
												currentPageId={currentPageId}
												entry={entry}
												onNavigate={jumpToBlock}
											/>
										) : active && entry.pages.length > 1 ? (
											<EntryPageRail
												compact
												currentPageId={currentPageId}
												entry={entry}
												onNavigate={jumpToBlock}
											/>
										) : null}
										{index === currentIndex && entry.pages.length > 1 ? (
											<span className="h-1 w-1 rounded-full bg-white/45" />
										) : null}
									</div>
								);
							})}
						</div>
						<button
							type="button"
							aria-label="Next entry"
							disabled={currentIndex === entries.length - 1}
							className="grid h-7 w-7 place-items-center rounded-full text-white/65 hover:bg-white/8 disabled:opacity-20"
							onClick={() => {
								const entry = entries[currentIndex + 1];
								if (entry) jumpToBlock(entry.firstBlockId);
							}}
						>
							<ChevronDown size={16} />
						</button>
					</motion.div>
				) : null}
			</AnimatePresence>
		</nav>
	);
}
