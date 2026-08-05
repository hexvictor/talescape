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
import type {
	ReaderContentsEntry,
	ReaderContentsPart,
} from "../../../../types";
import { getReaderPartTheme } from "../readerPartTheme";
import { EntryPageFlyout, PartSelector } from "./EntryNavigatorParts";
import { EntryTypeIcon, getEntryTypeLabel } from "./EntryTypeIcon";

const emptyContents: ReaderContentsPart[] = [];

function EntryPartTrack({
	spans,
}: {
	spans: ReaderContentsPart["entries"][number]["partSpans"];
}): React.JSX.Element {
	return (
		<div
			data-reader-component="EntryNavigator"
			data-reader-role="entry-part-indicators"
			className="flex h-12 w-2 shrink-0 flex-col items-center"
		>
			{spans.map((span) => (
				<span
					data-reader-component="EntryNavigator"
					data-reader-role="entry-part-indicator"
					data-reader-part-id={span.partId}
					key={`${span.partId}-${span.startPageId}-${span.endPageId}`}
					title={`Part ${span.partNumber}: ${span.partTitle}`}
					style={{
						...getReaderPartTheme(span.partNumber),
						backgroundColor: "var(--reader-part-solid)",
						flexGrow: 1,
					}}
					className={clsx(
						"block min-h-1 w-1",
						span.startsPart && "rounded-t-full",
						span.endsPart && "rounded-b-full",
					)}
					aria-label={`Part ${span.partNumber}`}
				/>
			))}
		</div>
	);
}

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
	const [hoveredEntryPreview, setHoveredEntryPreview] = useState<{
		entryId: string;
		top: number;
	} | null>(null);
	const [entryPanelHovered, setEntryPanelHovered] = useState(false);
	const [partsOpen, setPartsOpen] = useState(false);
	const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
	const entryItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const entryPanelShellRef = useRef<HTMLDivElement | null>(null);
	const touchPreviewEntryIdRef = useRef<string | null>(null);
	const touchPreviewTriggeredRef = useRef(false);
	const touchPreviewTimerRef = useRef<number | null>(null);
	const previewCloseTimerRef = useRef<number | null>(null);
	const pinHideTimerRef = useRef<number | null>(null);
	const mobile = viewportLayout !== "desktop";
	const allEntries = compiled?.entries ?? [];
	const selectedPart =
		contents.find((part) => part.id === selectedPartId) ?? null;
	const entries =
		navigationUsesSelectedPart && selectedPart
			? selectedPart.entries
			: allEntries;
	const currentIndex = compiled?.entryIndexById[currentEntryId ?? ""] ?? -1;
	const recentlyActive = useRecentReaderActivity(
		currentEntryId,
		activityFadeDelaySeconds * 1000,
	);

	useEffect(() => {
		return () => {
			window.clearTimeout(touchPreviewTimerRef.current ?? undefined);
			window.clearTimeout(previewCloseTimerRef.current ?? undefined);
			window.clearTimeout(pinHideTimerRef.current ?? undefined);
		};
	}, []);
	useEffect(() => {
		if (!navigationUsesSelectedPart || !currentPartId) return;
		setSelectedPartId(currentPartId);
	}, [currentPartId, navigationUsesSelectedPart]);
	useEffect(() => {
		if (!currentEntryId) return;
		entryItemRefs.current[currentEntryId]?.scrollIntoView({
			block: "nearest",
		});
	}, [currentEntryId]);
	useEffect(() => {
		if (
			hoveredEntryPreview &&
			!entries.some((entry) => entry.id === hoveredEntryPreview.entryId)
		) {
			setHoveredEntryPreview(null);
		}
	}, [entries, hoveredEntryPreview]);

	if (!compiled || allEntries.length <= 1 || currentIndex < 0) return null;

	const travelToBlock = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId, { motion: "travel" });
	};
	const clearTouchPreview = (): void => {
		window.clearTimeout(touchPreviewTimerRef.current ?? undefined);
		touchPreviewTimerRef.current = null;
	};
	const clearPreviewCloseTimer = (): void => {
		window.clearTimeout(previewCloseTimerRef.current ?? undefined);
		previewCloseTimerRef.current = null;
	};
	const showEntryPreview = (entryId: string): void => {
		clearPreviewCloseTimer();
		const shellNode = entryPanelShellRef.current;
		const itemNode = entryItemRefs.current[entryId];
		if (!shellNode || !itemNode) return;
		const shellRect = shellNode.getBoundingClientRect();
		const itemRect = itemNode.getBoundingClientRect();
		setHoveredEntryPreview({
			entryId,
			top: itemRect.top - shellRect.top + itemRect.height / 2,
		});
	};
	const clearEntryPreview = (): void => {
		clearPreviewCloseTimer();
		setHoveredEntryPreview(null);
	};
	const scheduleEntryPreviewClose = (): void => {
		clearPreviewCloseTimer();
		previewCloseTimerRef.current = window.setTimeout(clearEntryPreview, 280);
	};
	const showEntryPanelPin = (): void => {
		window.clearTimeout(pinHideTimerRef.current ?? undefined);
		pinHideTimerRef.current = null;
		setEntryPanelHovered(true);
	};
	const scheduleEntryPanelPinHide = (): void => {
		window.clearTimeout(pinHideTimerRef.current ?? undefined);
		pinHideTimerRef.current = window.setTimeout(
			() => setEntryPanelHovered(false),
			60,
		);
	};
	const currentPart =
		contents.find((part) => part.id === (selectedPartId ?? currentPartId)) ??
		contents[0];
	const hoveredEntry =
		entries.find((entry) => entry.id === hoveredEntryPreview?.entryId) ?? null;
	const firstEntry = entries[0] ?? null;
	const lastEntry = entries.length > 1 ? (entries.at(-1) ?? null) : null;
	const middleEntries = entries.slice(1, -1);
	const renderEntry = (entry: ReaderContentsEntry): React.JSX.Element => {
		const currentEntryPage = entry.pages.find(
			(page) => page.id === currentPageId,
		);

		return (
			<div
				ref={(node) => {
					entryItemRefs.current[entry.id] = node;
				}}
				key={entry.id}
				data-reader-component="EntryNavigator"
				data-reader-role="entry-item"
				data-reader-entry-id={entry.id}
				className="relative flex w-full shrink-0 items-center justify-center gap-1 px-1"
			>
				<div className="relative">
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
									: hoveredEntryPreview?.entryId === entry.id
										? "border-foreground/35 bg-foreground/12 text-foreground"
										: "border-foreground/12 bg-foreground/6 text-foreground/65 hover:bg-foreground/12 hover:text-foreground",
						)}
						onMouseEnter={() => showEntryPreview(entry.id)}
						onMouseLeave={scheduleEntryPreviewClose}
						onPointerDown={(event) => {
							if (event.pointerType !== "touch") return;
							touchPreviewEntryIdRef.current = entry.id;
							touchPreviewTriggeredRef.current = false;
							clearTouchPreview();
							touchPreviewTimerRef.current = window.setTimeout(() => {
								touchPreviewTriggeredRef.current = true;
								showEntryPreview(entry.id);
							}, 380);
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
					{entry.id === currentEntryId && entry.pages.length > 1 ? (
						<span
							data-reader-component="EntryNavigator"
							data-reader-role="current-page-indicator"
							className="-right-1 -bottom-1 absolute rounded-full border border-primary/45 bg-background/90 px-1.5 py-0.5 font-semibold text-[8px] text-primary"
						>
							{currentEntryPage?.number ??
								currentEntryPage?.label ??
								`${currentEntryPage?.type?.charAt(0)?.toUpperCase()}${currentEntryPage?.type?.slice(1)}`}
						</span>
					) : null}
				</div>
				<EntryPartTrack spans={entry.partSpans} />
			</div>
		);
	};

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
					hoveredEntryPreview !== null
					? "opacity-100"
					: "opacity-25 hover:opacity-100",
			)}
			onMouseEnter={() => navigatorVisibility.setHovered(true)}
			onMouseLeave={() => {
				navigatorVisibility.setHovered(false);
				clearEntryPreview();
				setPartsOpen(false);
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
						className="reader-connected-shell relative"
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
								className={clsx(
									"reader-connected-tab reader-connected-tab-left -translate-y-1/2 absolute top-1/2 right-[calc(100%+var(--reader-connected-tab-distance))] z-10 grid h-8 w-8 place-items-center rounded-full border border-r-0 text-foreground/45 opacity-100 transition-opacity duration-100 hover:text-foreground md:h-7 md:w-7",
									entryPanelHovered && hoveredEntryPreview === null
										? "md:pointer-events-auto md:opacity-100"
										: "md:pointer-events-none md:opacity-0",
								)}
								onMouseEnter={showEntryPanelPin}
								onMouseLeave={scheduleEntryPanelPinHide}
								onClick={navigatorVisibility.togglePinned}
							>
								{navigatorVisibility.pinned ? (
									<Pin size={11} className="-rotate-90" />
								) : (
									<PinOff size={11} className="-rotate-90" />
								)}
							</button>
						) : null}
						<div
							ref={entryPanelShellRef}
							className="relative"
							data-reader-component="EntryNavigator"
							data-reader-role="entry-panel-shell"
						>
							<div
								data-reader-component="EntryNavigator"
								data-reader-role="entry-top-controls"
								className="-translate-x-1/2 absolute bottom-[calc(100%+var(--reader-connected-tab-distance))] left-1/2 z-20 flex flex-col items-center gap-2"
							>
								<PartSelector
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
									className="reader-connected-tab reader-connected-tab-top grid h-8 w-8 place-items-center rounded-full border border-b-0 text-foreground/55 shadow-xl backdrop-blur-md hover:text-foreground disabled:cursor-default disabled:text-foreground/20"
									onClick={() => {
										const previousEntry = allEntries[currentIndex - 1];
										if (previousEntry) {
											travelToBlock(previousEntry.firstBlockId);
										}
									}}
								>
									<ChevronUp size={14} />
								</button>
							</div>
							<button
								data-reader-component="EntryNavigator"
								data-reader-role="next-entry-control"
								type="button"
								aria-label="Next entry"
								disabled={currentIndex >= allEntries.length - 1}
								className="reader-connected-tab reader-connected-tab-bottom -translate-x-1/2 absolute top-[calc(100%+var(--reader-connected-tab-distance))] left-1/2 z-20 grid h-8 w-8 place-items-center rounded-full border border-t-0 text-foreground/55 shadow-xl backdrop-blur-md hover:text-foreground disabled:cursor-default disabled:text-foreground/20"
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
								className="reader-connected-panel reader-connected-panel-right flex max-h-[min(82vh,32rem)] flex-col items-center rounded-l-lg border border-foreground/12 border-r-0 px-2 py-3 shadow-2xl backdrop-blur-md"
								onMouseEnter={showEntryPanelPin}
								onMouseLeave={scheduleEntryPanelPinHide}
							>
								<div
									data-reader-component="EntryNavigator"
									data-reader-role="entry-list"
									className="flex max-h-[24rem] min-h-0 w-full flex-col overflow-hidden"
								>
									{firstEntry ? renderEntry(firstEntry) : null}
									{middleEntries.length > 0 ? (
										<div
											data-reader-component="EntryNavigator"
											data-reader-role="entry-scroll-window"
											className="reader-entry-list-window min-h-0"
										>
											<div
												data-reader-component="EntryNavigator"
												data-reader-role="entry-list-boundary-fade"
												data-reader-boundary="start"
												className="reader-entry-list-fade reader-entry-list-fade-top mr-3"
											/>
											<div
												data-reader-component="EntryNavigator"
												data-reader-role="scrollable-entry-list"
												className="reader-scrollbar-hidden max-h-[16rem] min-h-0 overflow-y-auto overscroll-contain"
												style={{ touchAction: "pan-y" }}
												onScroll={() => {
													if (hoveredEntryPreview) {
														showEntryPreview(hoveredEntryPreview.entryId);
													}
												}}
												onWheel={(event) => event.stopPropagation()}
											>
												{middleEntries.map(renderEntry)}
											</div>
											<div
												data-reader-component="EntryNavigator"
												data-reader-role="entry-list-boundary-fade"
												data-reader-boundary="end"
												className="reader-entry-list-fade reader-entry-list-fade-bottom mr-3"
											/>
										</div>
									) : null}
									{lastEntry ? renderEntry(lastEntry) : null}
								</div>
							</div>
							<AnimatePresence>
								{hoveredEntryPreview && hoveredEntry ? (
									<motion.div
										data-reader-component="EntryNavigator"
										data-reader-role="entry-page-preview"
										className="reader-entry-preview-bridge -translate-y-1/2 pointer-events-auto absolute top-0 right-full z-50"
										style={{ top: hoveredEntryPreview.top }}
										initial={{ opacity: 0, x: 8 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 8 }}
										transition={{ duration: 0.15 }}
										onMouseEnter={clearPreviewCloseTimer}
										onMouseLeave={clearEntryPreview}
									>
										<EntryPageFlyout
											currentPageId={currentPageId}
											entry={hoveredEntry}
											onNavigate={travelToBlock}
										/>
									</motion.div>
								) : null}
							</AnimatePresence>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</nav>
	);
}
