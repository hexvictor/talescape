"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight, Grid3X3, Pin, PinOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "../../../../contexts/TaleReaderStoreContext";
import { usePinnedHoverPanel } from "../../../../hooks/usePinnedHoverPanel";
import { useRecentReaderActivity } from "../../../../hooks/useRecentReaderActivity";
import type { ReaderContentsPage } from "../../../../types";
import { getReaderPartTheme } from "../readerPartTheme";
import { PageNavigatorGrid } from "./PageNavigatorGrid";

/**
 * Renders the compact route-visible page navigator.
 *
 * @returns Page navigator or nothing until reader location is available.
 *
 * @example
 * <PageNavigator />
 */
export function PageNavigator(): React.JSX.Element | null {
	const {
		activityFadeDelaySeconds,
		compiled,
		location,
		navigationPinsVisible,
		reduceInactiveUiOpacity,
		scrollApi,
	} = useTaleReaderStoreShallow((state) => ({
		activityFadeDelaySeconds: state.ui.activityFadeDelaySeconds,
		compiled: state.reader.compiled,
		location: state.navigation.current,
		navigationPinsVisible: state.ui.navigationPinsVisible,
		reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
		scrollApi: state.scroll.api,
	}));
	const isPreviewing = useTaleAppStore((state) => state.derived.isPreviewing);
	const [open, setOpen] = useState(false);
	const pendingPageIndexRef = useRef<number | null>(null);
	const closeTimerRef = useRef<number | null>(null);
	const navigationRef = useRef<HTMLElement | null>(null);
	const navigatorVisibility = usePinnedHoverPanel(!isPreviewing);
	const clearCloseTimer = useCallback((): void => {
		window.clearTimeout(closeTimerRef.current ?? undefined);
		closeTimerRef.current = null;
	}, []);
	const recentlyActive = useRecentReaderActivity(
		location?.pageId ?? null,
		activityFadeDelaySeconds * 1000,
	);
	const currentPageId = location?.pageId ?? null;
	const compiledPages = compiled?.pages;
	const navigatorExpanded = navigatorVisibility.expanded || open;

	useEffect(() => {
		const pendingIndex = pendingPageIndexRef.current;
		if (pendingIndex === null || !compiledPages || !currentPageId) return;
		if (compiledPages[pendingIndex]?.id === currentPageId) {
			pendingPageIndexRef.current = null;
		}
	}, [compiledPages, currentPageId]);
	useEffect(
		() => () => window.clearTimeout(closeTimerRef.current ?? undefined),
		[],
	);
	useEffect(() => {
		if (!open) return;
		const closeAfterOutsidePointerMove = (event: PointerEvent): void => {
			clearCloseTimer();
			if (
				event.target instanceof Node &&
				navigationRef.current?.contains(event.target)
			) {
				return;
			}
			closeTimerRef.current = window.setTimeout(() => setOpen(false), 160);
		};
		document.addEventListener("pointermove", closeAfterOutsidePointerMove, {
			passive: true,
		});
		return () => {
			document.removeEventListener("pointermove", closeAfterOutsidePointerMove);
			clearCloseTimer();
		};
	}, [clearCloseTimer, open]);

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
	 * Travels to a route-visible page.
	 *
	 * @param page - Destination page.
	 * @returns Nothing.
	 */
	const travelToPage = (page: ReaderContentsPage): void => {
		pendingPageIndexRef.current = compiled.pageIndexById[page.id] ?? null;
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(page.firstBlockId, { motion: "travel" });
		setOpen(false);
	};

	/**
	 * Queues relative page navigation from the latest requested destination.
	 *
	 * @param direction - Relative page direction.
	 * @returns Nothing.
	 */
	const travelToRelativePage = (direction: -1 | 1): void => {
		const baseIndex = pendingPageIndexRef.current ?? pageIndex;
		const targetIndex = Math.max(
			0,
			Math.min(compiled.pages.length - 1, baseIndex + direction),
		);
		const targetPage = compiled.pages[targetIndex];
		if (!targetPage || targetIndex === baseIndex) return;
		travelToPage(targetPage);
	};
	const paginatedCount = compiled.pages.filter(
		(page) => page.isPaginated,
	).length;
	const currentLabel =
		currentPage.isPaginated && currentPage.number !== null
			? `Page ${currentPage.number} of ${paginatedCount}`
			: currentPage.label;
	const currentPartTheme = getReaderPartTheme(currentPage.partNumber);

	return (
		<nav
			ref={navigationRef}
			data-reader-ui="true"
			data-reader-component="PageNavigator"
			data-reader-role="page-navigation"
			aria-label="Reader page navigation"
			className={clsx(
				"group/page-nav -translate-x-1/2 pointer-events-auto absolute bottom-0 left-1/2 z-40 max-w-[calc(100vw-2rem)] transition-opacity duration-300",
				!reduceInactiveUiOpacity ||
					recentlyActive ||
					navigatorVisibility.hovered ||
					open
					? "opacity-100"
					: "opacity-25 hover:opacity-100",
			)}
			onMouseEnter={() => {
				clearCloseTimer();
				navigatorVisibility.setHovered(true);
			}}
			onMouseLeave={() => {
				navigatorVisibility.setHovered(false);
			}}
		>
			<AnimatePresence>
				{open && navigatorExpanded ? (
					<motion.div
						className="-translate-x-1/2 absolute bottom-full left-1/2 w-[min(94vw,36rem)] max-w-[36rem] pb-3"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 8 }}
						transition={{ duration: 0.18 }}
						onMouseEnter={clearCloseTimer}
					>
						<div
							data-reader-component="PageNavigator"
							data-reader-role="expanded-page-panel"
							className="reader-connected-panel overflow-hidden rounded-xl border border-foreground/12 bg-background/94 shadow-2xl backdrop-blur-xl"
						>
							<PageNavigatorGrid
								currentPageId={currentPage.id}
								entries={compiled.entries}
								pages={compiled.pages}
								onNavigate={travelToPage}
							/>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
			<AnimatePresence initial={false} mode="wait">
				{!navigatorExpanded ? (
					<button
						data-reader-component="PageNavigator"
						data-reader-role="collapsed-handle"
						key="page-navigator-handle"
						type="button"
						aria-label="Show page navigation"
						className="grid h-5 w-16 place-items-center rounded-t-md border border-foreground/10 border-b-0 bg-background/46 text-foreground/24 transition hover:bg-background/72 hover:text-foreground/72"
						onClick={navigatorVisibility.togglePinned}
					>
						<Grid3X3 size={11} />
					</button>
				) : (
					<motion.div
						key="page-navigator-controls"
						className="reader-connected-shell group/page-controls relative"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 8 }}
						transition={{ duration: 0.18 }}
					>
						{navigationPinsVisible && !open ? (
							<button
								data-reader-component="PageNavigator"
								data-reader-role="pin-control"
								type="button"
								aria-label={
									navigatorVisibility.pinned
										? "Unpin page navigation"
										: "Pin page navigation"
								}
								className="reader-connected-tab reader-connected-tab-top -translate-x-1/2 absolute bottom-[calc(100%+var(--reader-connected-tab-distance))] left-1/2 z-10 grid h-8 w-8 place-items-center rounded-full border border-b-0 text-foreground/40 opacity-100 transition-opacity hover:text-foreground md:h-7 md:w-7 md:opacity-0 md:group-hover/page-controls:opacity-100"
								onClick={() => {
									navigatorVisibility.togglePinned();
									if (navigatorVisibility.pinned) setOpen(false);
								}}
							>
								{navigatorVisibility.pinned ? (
									<Pin size={11} />
								) : (
									<PinOff size={11} />
								)}
							</button>
						) : null}
						<div
							data-reader-component="PageNavigator"
							data-reader-role="page-controls"
							style={currentPartTheme}
							className="reader-connected-panel reader-connected-panel-bottom relative flex items-center rounded-t-lg border border-foreground/12 border-b-0 p-1.5 shadow-2xl backdrop-blur-md"
						>
							<button
								data-reader-component="PageNavigator"
								data-reader-role="previous-page-control"
								type="button"
								aria-label="Previous page"
								className="reader-connected-tab reader-connected-tab-left -translate-y-1/2 absolute top-1/2 right-[calc(100%+var(--reader-connected-tab-distance))] z-10 grid h-8 w-8 place-items-center rounded-full border border-r-0 text-foreground/55 shadow-xl backdrop-blur-md hover:text-foreground disabled:cursor-default disabled:text-foreground/20"
								disabled={!previous}
								onClick={() => travelToRelativePage(-1)}
							>
								<ArrowLeft size={14} />
							</button>
							<button
								data-reader-component="PageNavigator"
								data-reader-role="page-summary-control"
								type="button"
								aria-expanded={open}
								className="min-w-[11.5rem] rounded-md px-3 py-1 text-center transition hover:bg-[color:var(--reader-part-soft)]"
								onClick={() => setOpen((current) => !current)}
							>
								<div className="flex items-center justify-center">
									<p className="truncate font-semibold text-foreground/86 text-xs">
										{currentLabel}
									</p>
								</div>
								<p className="truncate text-[10px] text-foreground/42">
									{currentEntry.title}
								</p>
							</button>
							<button
								data-reader-component="PageNavigator"
								data-reader-role="next-page-control"
								type="button"
								aria-label="Next page"
								className="reader-connected-tab reader-connected-tab-right -translate-y-1/2 absolute top-1/2 left-[calc(100%+var(--reader-connected-tab-distance))] z-10 grid h-8 w-8 place-items-center rounded-full border border-l-0 text-foreground/55 shadow-xl backdrop-blur-md hover:text-foreground disabled:cursor-default disabled:text-foreground/20"
								disabled={!next}
								onClick={() => travelToRelativePage(1)}
							>
								<ArrowRight size={14} />
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
}
