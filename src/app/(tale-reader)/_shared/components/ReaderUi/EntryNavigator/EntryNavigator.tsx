"use client";

import clsx from "clsx";
import { PanelRightOpen, Pin, PinOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useEntryNavigatorState } from "../../../hooks/store/useReaderNavigationSelectors";
import { usePinnedHoverPanel } from "../../../hooks/usePinnedHoverPanel";
import { useRecentReaderActivity } from "../../../hooks/useRecentReaderActivity";
import { getBoundedNavigationIndices } from "../../../services/getBoundedNavigationIndices";
import { EntryPageFlyout, PartSelector } from "./EntryNavigatorParts";
import { EntryTypeIcon, getEntryTypeLabel } from "./EntryTypeIcon";

/**
 * Renders the route-aware entry rail with stable browsing and page flyouts.
 *
 * @returns Entry navigator or nothing when navigation is unnecessary.
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
	const navigatorVisibility = usePinnedHoverPanel(true);
	const [browseIndex, setBrowseIndex] = useState(0);
	const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
	const [partsOpen, setPartsOpen] = useState(false);
	const entries = compiled?.entries ?? [];
	const currentIndex = compiled?.entryIndexById[currentEntryId ?? ""] ?? -1;
	const recentlyActive = useRecentReaderActivity(currentEntryId);

	useEffect(() => {
		if (currentIndex >= 0) setBrowseIndex(currentIndex);
	}, [currentIndex]);

	if (!compiled || entries.length <= 1 || currentIndex < 0) return null;

	const travelToBlock = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId, { motion: "travel" });
	};
	const currentPart =
		contents.find((part) => part.id === currentPartId) ?? contents[0];
	const navigationIndices = getBoundedNavigationIndices({
		activeIndex: currentIndex,
		browseIndex,
		itemCount: entries.length,
	});

	return (
		<nav
			data-reader-ui="true"
			data-reader-component="EntryNavigator"
			data-reader-role="entry-navigation"
			aria-label="Entry navigation"
			className={clsx(
				"group/entry-nav -translate-y-1/2 pointer-events-auto absolute top-1/2 right-0 z-40 hidden items-center transition-opacity duration-300 md:flex",
				recentlyActive ||
					navigatorVisibility.hovered ||
					partsOpen ||
					hoveredEntryId !== null
					? "opacity-100"
					: "opacity-25 hover:opacity-100",
			)}
			onMouseEnter={() => navigatorVisibility.setHovered(true)}
			onMouseLeave={() => {
				navigatorVisibility.setHovered(false);
				setHoveredEntryId(null);
				setPartsOpen(false);
			}}
			onWheel={(event) => {
				event.preventDefault();
				setBrowseIndex((current) =>
					Math.max(
						0,
						Math.min(entries.length - 1, current + (event.deltaY > 0 ? 1 : -1)),
					),
				);
			}}
		>
			<AnimatePresence>
				{navigatorVisibility.expanded ? null : (
					<motion.button
						data-reader-component="EntryNavigator"
						data-reader-role="collapsed-handle"
						type="button"
						aria-label="Show entry navigation"
						className="absolute right-0 grid h-12 w-7 place-items-center rounded-l-md border border-white/12 border-r-0 bg-black/78 text-white/45 backdrop-blur-md hover:text-white"
						initial={{ opacity: 0, x: 24 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 24 }}
						transition={{ duration: 0.18 }}
						onClick={navigatorVisibility.togglePinned}
					>
						<PanelRightOpen size={15} />
					</motion.button>
				)}
			</AnimatePresence>
			<AnimatePresence initial={false}>
				{navigatorVisibility.expanded ? (
					<motion.div
						className="relative"
						initial={{ opacity: 0, x: 24 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 24 }}
						transition={{ duration: 0.2 }}
					>
						<button
							data-reader-component="EntryNavigator"
							data-reader-role="pin-control"
							type="button"
							aria-label={
								navigatorVisibility.pinned
									? "Unpin entry navigation"
									: "Pin entry navigation"
							}
							className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 z-10 grid h-6 w-8 place-items-center rounded border border-white/12 bg-black/90 text-white/45 opacity-0 transition-opacity hover:text-white group-hover/entry-nav:opacity-100"
							onClick={navigatorVisibility.togglePinned}
						>
							{navigatorVisibility.pinned ? (
								<Pin size={11} />
							) : (
								<PinOff size={11} />
							)}
						</button>
						<div
							data-reader-component="EntryNavigator"
							data-reader-role="entry-panel"
							className="flex max-h-[82vh] w-[4.75rem] flex-col items-center gap-2 rounded-l-lg border border-white/12 border-r-0 bg-black/82 px-1.5 py-4 shadow-2xl backdrop-blur-md"
						>
							<PartSelector
								currentPart={currentPart}
								open={partsOpen}
								parts={contents}
								onOpenChange={setPartsOpen}
								onSelect={(part) => {
									travelToBlock(part.firstBlockId);
									setPartsOpen(false);
								}}
							/>
							<div className="flex flex-col items-center justify-center gap-1.5 px-2 py-1">
								{navigationIndices.map((navigationIndex) => {
									if (navigationIndex.type === "ellipsis") {
										return (
											<button
												data-reader-component="EntryNavigator"
												data-reader-role="ellipsis-control"
												key={navigationIndex.id}
												type="button"
												aria-label="Browse more entries"
												className="grid h-5 w-10 place-items-center rounded-full text-[11px] text-white/32 transition hover:bg-white/8 hover:text-white/70"
												onClick={() =>
													setBrowseIndex(navigationIndex.targetIndex)
												}
											>
												•••
											</button>
										);
									}

									const entry = entries[navigationIndex.index];
									if (!entry) return null;

									return (
										<div
											key={entry.id}
											data-reader-component="EntryNavigator"
											data-reader-role="entry-item"
											data-reader-entry-id={entry.id}
											className="relative flex flex-col items-center"
											onMouseEnter={() => setHoveredEntryId(entry.id)}
											onMouseLeave={() => setHoveredEntryId(null)}
										>
											<button
												data-reader-component="EntryNavigator"
												data-reader-entry-id={entry.id}
												data-reader-role="entry-control"
												type="button"
												title={`${getEntryTypeLabel(entry.type)}: ${entry.title}`}
												aria-label={`Go to ${entry.title}`}
												className={clsx(
													"grid h-10 w-10 place-items-center rounded-full border font-bold text-xs shadow-lg transition",
													entry.id === currentEntryId
														? "border-[#d9b56f] bg-[#d9b56f] text-black"
														: navigationIndex.index === browseIndex
															? "border-white/35 bg-white/12 text-white"
															: "border-white/12 bg-white/6 text-white/65 hover:bg-white/12 hover:text-white",
												)}
												onClick={() => travelToBlock(entry.firstBlockId)}
											>
												{entry.type === "chapter" ? (
													entry.chapterNumber
												) : (
													<EntryTypeIcon type={entry.type} size={16} />
												)}
											</button>
											{entry.id === currentEntryId && entry.pages.length > 1 ? (
												<span className="-bottom-1 -left-1 absolute rounded-full border border-[#d9b56f]/45 bg-black/90 px-1.5 py-0.5 font-semibold text-[#e2c98f] text-[8px]">
													{entry.pages.find((page) => page.id === currentPageId)
														?.number ?? "Current"}
												</span>
											) : null}
											<AnimatePresence>
												{hoveredEntryId === entry.id &&
												entry.pages.length > 1 ? (
													<motion.div
														className="-translate-y-1/2 absolute top-1/2 right-[calc(100%-1px)] z-50 pr-3"
														initial={{ opacity: 0, x: 8 }}
														animate={{ opacity: 1, x: 0 }}
														exit={{ opacity: 0, x: 8 }}
														transition={{ duration: 0.15 }}
													>
														<EntryPageFlyout
															currentPageId={currentPageId}
															entry={entry}
															onNavigate={travelToBlock}
														/>
													</motion.div>
												) : null}
											</AnimatePresence>
										</div>
									);
								})}
							</div>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</nav>
	);
}
