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
import { useEffect, useRef, useState } from "react";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "../../../../contexts/TaleReaderStoreContext";
import { usePinnedHoverPanel } from "../../../../hooks/usePinnedHoverPanel";
import { useRecentReaderActivity } from "../../../../hooks/useRecentReaderActivity";
import { getBoundedNavigationIndices } from "../../../../services/getBoundedNavigationIndices";
import type { ReaderContentsPart } from "../../../../types";
import { EntryPageFlyout, PartSelector } from "./EntryNavigatorParts";
import { EntryTypeIcon, getEntryTypeLabel } from "./EntryTypeIcon";

const emptyContents: ReaderContentsPart[] = [];

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
		activityFadeDelaySeconds,
		compiled,
		contents,
		currentEntryId,
		currentPageId,
		currentPartId,
		navigationPinsVisible,
		navigationUsesSelectedPart,
		reduceInactiveUiOpacity,
		viewportLayout,
		scrollApi,
	} = useTaleReaderStoreShallow((state) => ({
		activityFadeDelaySeconds: state.ui.activityFadeDelaySeconds,
		compiled: state.reader.compiled,
		contents: state.reader.compiled?.contents ?? emptyContents,
		currentEntryId: state.navigation.current?.entryId ?? null,
		currentPageId: state.navigation.current?.pageId ?? null,
		currentPartId: state.navigation.current?.partId ?? null,
		navigationPinsVisible: state.ui.navigationPinsVisible,
		navigationUsesSelectedPart: state.ui.navigationUsesSelectedPart,
		reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
		viewportLayout: state.derived.viewportLayout,
		scrollApi: state.scroll.api,
	}));
	const isPreviewing = useTaleAppStore((state) => state.derived.isPreviewing);
	const navigatorVisibility = usePinnedHoverPanel(!isPreviewing);
	const [manualBrowseIndex, setManualBrowseIndex] = useState<number | null>(
		null,
	);
	const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
	const [partsOpen, setPartsOpen] = useState(false);
	const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
	const touchPreviewEntryIdRef = useRef<string | null>(null);
	const touchPreviewTriggeredRef = useRef(false);
	const touchPreviewTimerRef = useRef<number | null>(null);
	const touchBrowseYRef = useRef<number | null>(null);
	const mobile = viewportLayout !== "desktop";
	const allEntries = compiled?.entries ?? [];
	const selectedPart =
		contents.find((part) => part.id === selectedPartId) ?? null;
	const entries =
		navigationUsesSelectedPart && selectedPart
			? selectedPart.entries
			: allEntries;
	const currentIndex = compiled?.entryIndexById[currentEntryId ?? ""] ?? -1;
	const visibleCurrentIndex = entries.findIndex(
		(entry) => entry.id === currentEntryId,
	);
	const recentlyActive = useRecentReaderActivity(
		currentEntryId,
		activityFadeDelaySeconds * 1000,
	);

	useEffect(
		() => () => window.clearTimeout(touchPreviewTimerRef.current ?? undefined),
		[],
	);
	useEffect(() => {
		if (!navigationUsesSelectedPart || !currentPartId) return;
		setSelectedPartId(currentPartId);
		setManualBrowseIndex(null);
	}, [currentPartId, navigationUsesSelectedPart]);

	if (!compiled || allEntries.length <= 1 || currentIndex < 0) return null;
	const activeIndex = visibleCurrentIndex >= 0 ? visibleCurrentIndex : 0;
	const browseIndex = manualBrowseIndex ?? activeIndex;

	const travelToBlock = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId, { motion: "travel" });
	};
	const clearTouchPreview = (): void => {
		window.clearTimeout(touchPreviewTimerRef.current ?? undefined);
		touchPreviewTimerRef.current = null;
	};
	const currentPart =
		contents.find((part) => part.id === currentPartId) ?? contents[0];
	const navigationIndices = getBoundedNavigationIndices({
		activeIndex,
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
				"group/entry-nav -translate-y-1/2 pointer-events-auto absolute top-1/2 right-0 z-40 flex items-center transition-opacity duration-300 ",
				!reduceInactiveUiOpacity ||
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
				setManualBrowseIndex((current) =>
					Math.max(
						0,
						Math.min(
							entries.length - 1,
							(current ?? activeIndex) + (event.deltaY > 0 ? 1 : -1),
						),
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
						className="absolute right-0 grid h-12 w-7 place-items-center rounded-l-md border border-foreground/12 border-r-0 bg-background/78 text-foreground/45 backdrop-blur-md hover:text-foreground"
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
						data-reader-component="EntryNavigator"
						data-reader-role="expanded-entry-panel"
						className="relative"
						initial={{ opacity: 0, x: 24 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 24 }}
						transition={{ duration: 0.2 }}
					>
						{navigationPinsVisible ? (
							<button
								data-reader-component="EntryNavigator"
								data-reader-role="pin-control"
								type="button"
								aria-label={
									navigatorVisibility.pinned
										? "Unpin entry navigation"
										: "Pin entry navigation"
								}
								className="-translate-y-1/2 absolute top-1/2 right-[calc(100%+0.5rem)] z-10 grid h-8 w-8 place-items-center rounded border border-foreground/12 bg-background/90 text-foreground/45 opacity-100 transition-opacity hover:text-foreground md:h-7 md:w-7 md:opacity-0 md:group-hover/entry-nav:opacity-100"
								onClick={navigatorVisibility.togglePinned}
							>
								{navigatorVisibility.pinned ? (
									<Pin size={11} />
								) : (
									<PinOff size={11} />
								)}
							</button>
						) : null}
						<div
							className="relative"
							data-reader-component="EntryNavigator"
							data-reader-role="entry-panel-shell"
						>
							<PartSelector
								className="-translate-x-1/2 absolute bottom-[calc(100%+3rem)] left-1/2 z-20"
								currentPart={currentPart}
								open={partsOpen}
								parts={contents}
								showStepButtons={!mobile}
								onOpenChange={setPartsOpen}
								onSelect={(part) => {
									setSelectedPartId(part.id);
									travelToBlock(part.firstBlockId);
									setPartsOpen(false);
								}}
							/>
							<button
								data-reader-component="EntryNavigator"
								data-reader-role="previous-entry-control"
								type="button"
								aria-label="Previous entry"
								disabled={currentIndex <= 0}
								className="-translate-x-1/2 -top-10 absolute left-1/2 grid h-8 w-8 place-items-center rounded-full border border-foreground/12 bg-background/86 text-foreground/55 shadow-xl backdrop-blur-md hover:bg-foreground/8 hover:text-foreground disabled:opacity-20"
								onClick={() => {
									const previousEntry = allEntries[currentIndex - 1];
									if (previousEntry) travelToBlock(previousEntry.firstBlockId);
								}}
							>
								<ChevronUp size={14} />
							</button>
							<button
								data-reader-component="EntryNavigator"
								data-reader-role="next-entry-control"
								type="button"
								aria-label="Next entry"
								disabled={currentIndex >= allEntries.length - 1}
								className="-translate-x-1/2 -bottom-10 absolute left-1/2 grid h-8 w-8 place-items-center rounded-full border border-foreground/12 bg-background/86 text-foreground/55 shadow-xl backdrop-blur-md hover:bg-foreground/8 hover:text-foreground disabled:opacity-20"
								onClick={() => {
									const nextEntry = allEntries[currentIndex + 1];
									if (nextEntry) travelToBlock(nextEntry.firstBlockId);
								}}
							>
								<ChevronDown size={14} />
							</button>
							<div
								data-reader-component="EntryNavigator"
								data-reader-role="entry-panel"
								className="flex max-h-[min(82vh,30rem)] w-[4.75rem] flex-col items-center gap-2 rounded-l-lg border border-foreground/12 border-r-0 bg-background/82 px-1.5 py-3 shadow-2xl backdrop-blur-md"
							>
								<div
									data-reader-component="EntryNavigator"
									data-reader-role="entry-list"
									className="flex max-h-[23rem] flex-col items-center justify-center gap-1.5 overflow-hidden px-2 py-1"
									style={{ touchAction: "pan-y" }}
									onTouchStart={(event) => {
										touchBrowseYRef.current = event.touches[0]?.clientY ?? null;
									}}
									onTouchMove={(event) => {
										const startY = touchBrowseYRef.current;
										const currentY = event.touches[0]?.clientY ?? null;
										if (startY === null || currentY === null) return;
										const distance = currentY - startY;
										if (Math.abs(distance) < 28) return;
										setManualBrowseIndex((current) =>
											Math.max(
												0,
												Math.min(
													entries.length - 1,
													(current ?? activeIndex) + (distance < 0 ? 1 : -1),
												),
											),
										);
										touchBrowseYRef.current = currentY;
									}}
									onTouchEnd={() => {
										touchBrowseYRef.current = null;
									}}
								>
									{navigationIndices.map((navigationIndex) => {
										if (navigationIndex.type === "ellipsis") {
											return (
												<button
													data-reader-component="EntryNavigator"
													data-reader-role="ellipsis-control"
													key={navigationIndex.id}
													type="button"
													aria-label="Browse more entries"
													className="grid h-5 w-10 place-items-center rounded-full text-[11px] text-foreground/32 transition hover:bg-foreground/8 hover:text-foreground/70"
													onClick={() =>
														setManualBrowseIndex(navigationIndex.targetIndex)
													}
												>
													•••
												</button>
											);
										}

										const entry = entries[navigationIndex.index];
										if (!entry) return null;
										const showFlyout =
											hoveredEntryId === entry.id && entry.pages.length > 1;
										const currentEntryPage = entry.pages.find(
											(page) => page.id === currentPageId,
										);

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
															? "border-primary bg-primary text-background"
															: entry.hasChoiceBlock
																? "border-emerald-600/45 bg-emerald-500/12 text-emerald-900 hover:border-emerald-600/75 hover:bg-emerald-500/18 hover:text-foreground dark:border-[#8bcf90]/45 dark:bg-[#8bcf90]/10 dark:text-[#d8f5da] dark:hover:border-[#8bcf90]/75"
																: navigationIndex.index === browseIndex
																	? "border-foreground/35 bg-foreground/12 text-foreground"
																	: "border-foreground/12 bg-foreground/6 text-foreground/65 hover:bg-foreground/12 hover:text-foreground",
													)}
													onPointerDown={(event) => {
														if (
															event.pointerType !== "touch" ||
															entry.pages.length <= 1
														) {
															return;
														}
														touchPreviewEntryIdRef.current = entry.id;
														touchPreviewTriggeredRef.current = false;
														clearTouchPreview();
														touchPreviewTimerRef.current = window.setTimeout(
															() => {
																touchPreviewTriggeredRef.current = true;
																setHoveredEntryId(entry.id);
															},
															380,
														);
													}}
													onPointerUp={clearTouchPreview}
													onPointerCancel={clearTouchPreview}
													onClick={(event) => {
														if (
															touchPreviewTriggeredRef.current &&
															touchPreviewEntryIdRef.current === entry.id
														) {
															event.preventDefault();
															event.stopPropagation();
															touchPreviewTriggeredRef.current = false;
															return;
														}
														travelToBlock(entry.firstBlockId);
													}}
												>
													{entry.type === "chapter" ? (
														entry.chapterNumber
													) : (
														<EntryTypeIcon type={entry.type} size={16} />
													)}
												</button>
												{entry.id === currentEntryId &&
												entry.pages.length > 1 ? (
													<span
														data-reader-component="EntryNavigator"
														data-reader-role="current-page-indicator"
														className="-bottom-1 -left-1 absolute rounded-full border border-primary/45 bg-background/90 px-1.5 py-0.5 font-semibold text-[8px] text-primary"
													>
														{currentEntryPage?.number ??
															currentEntryPage?.label ??
															`${currentEntryPage?.type?.charAt(0)?.toUpperCase()}${currentEntryPage?.type?.slice(1)}`}
													</span>
												) : null}
												<AnimatePresence>
													{showFlyout ? (
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
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</nav>
	);
}
