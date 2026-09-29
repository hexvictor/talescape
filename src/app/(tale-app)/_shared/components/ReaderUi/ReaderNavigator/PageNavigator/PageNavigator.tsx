"use client";

import { ArrowLeft, ArrowRight, Grid3X3, Pin, PinOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import { useTaleReaderStoreShallow } from "../../../../contexts/TaleReaderStoreContext";
import { usePinnedHoverPanel } from "../../../../hooks/usePinnedHoverPanel";
import { useRecentReaderActivity } from "../../../../hooks/useRecentReaderActivity";
import {
	type ReaderNavigationPage,
	createReaderNavigationView,
} from "../../../../services/readerNavigationView";
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
	const isLivePreview = useTaleAppStore((state) => state.derived.isLivePreview);
	const tale = useTaleAppStore((state) => state.document.tale);
	const navigationView = useMemo(
		() => (compiled ? createReaderNavigationView(compiled, tale) : null),
		[compiled, tale],
	);
	const [open, setOpen] = useState(false);
	const pendingPageIndexRef = useRef<number | null>(null);
	const closeTimerRef = useRef<number | null>(null);
	const navigationRef = useRef<HTMLElement | null>(null);
	const navigatorVisibility = usePinnedHoverPanel(!isLivePreview);
	const clearCloseTimer = useCallback((): void => {
		window.clearTimeout(closeTimerRef.current ?? undefined);
		closeTimerRef.current = null;
	}, []);
	const recentlyActive = useRecentReaderActivity(
		location?.pageId ?? null,
		activityFadeDelaySeconds * 1000,
	);
	const currentPageId = location?.pageId ?? null;
	const compiledPages = navigationView?.pages;
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
	const currentPage = navigationView?.pages[pageIndex];
	const currentEntry = navigationView?.entries.find(
		(entry) => entry.id === location.entryId,
	);
	const previous = navigationView?.pages[pageIndex - 1];
	const next = navigationView?.pages[pageIndex + 1];
	if (!currentPage || !currentEntry) return null;

	/**
	 * Travels to a route-visible page.
	 *
	 * @param page - Destination page.
	 * @returns Nothing.
	 */
	const travelToPage = (page: ReaderNavigationPage): void => {
		pendingPageIndexRef.current = compiled.pageIndexById[page.id] ?? null;
		scrollApi?.capturePosition();
		scrollApi?.scrollToKeyframe(page.firstKeyframeId, { motion: "travel" });
		setOpen(false);
	};
	const travelToRelativePage = (direction: -1 | 1): void => {
		const baseIndex = pendingPageIndexRef.current ?? pageIndex;
		const targetIndex = Math.max(
			0,
			Math.min((navigationView?.pages.length ?? 1) - 1, baseIndex + direction),
		);
		const targetPage = navigationView?.pages[targetIndex];
		if (!targetPage || targetIndex === baseIndex) return;
		travelToPage(targetPage);
	};

	const paginatedCount = (navigationView?.pages ?? []).filter(
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
			className={cn(
				"reader-page-navigation group/page-nav -translate-x-1/2 pointer-events-auto absolute bottom-0 left-1/2 z-40 max-w-[calc(100vw-2rem)] transition-opacity duration-300",
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
							className="reader-page-browser reader-connected-panel overflow-hidden border border-foreground/12 bg-background/94 shadow-2xl backdrop-blur-xl"
						>
							<PageNavigatorGrid
								currentPageId={currentPage.id}
								entries={navigationView?.entries ?? []}
								pages={navigationView?.pages ?? []}
								onNavigate={travelToPage}
							/>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
			<AnimatePresence initial={false} mode="wait">
				{!navigatorExpanded ? (
					<Button
						data-reader-component="PageNavigator"
						data-reader-role="collapsed-handle"
						key="page-navigator-handle"
						type="button"
						size="sm"
						variant="ghost"
						motion="flat"
						aria-label="Show page navigation"
						className="h-5 w-16 border border-foreground/10 border-b-0 bg-background/46 p-0 text-foreground/24 transition hover:bg-background/72 hover:text-foreground/72"
						onClick={navigatorVisibility.togglePinned}
					>
						<Grid3X3 size={11} />
					</Button>
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
							<Button
								data-reader-component="PageNavigator"
								data-reader-role="pin-control"
								type="button"
								size="icon"
								variant="ghost"
								motion="flat"
								aria-label={
									navigatorVisibility.pinned
										? "Unpin page navigation"
										: "Pin page navigation"
								}
								className="reader-connected-tab reader-connected-tab-top -translate-x-1/2 absolute bottom-[calc(100%+var(--reader-connected-tab-distance))] left-1/2 z-10 h-8 w-8 rounded-full border border-b-0 p-0 text-foreground/40 opacity-100 transition-opacity hover:text-foreground md:h-7 md:w-7 md:opacity-0 md:group-hover/page-controls:opacity-100"
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
							</Button>
						) : null}
						<div
							data-reader-component="PageNavigator"
							data-reader-role="page-controls"
							style={currentPartTheme}
							className="reader-page-console reader-connected-panel reader-connected-panel-bottom relative flex items-center border border-foreground/12 border-b-0 p-1.5 shadow-2xl backdrop-blur-md"
						>
							<Button
								data-reader-component="PageNavigator"
								data-reader-role="previous-page-control"
								type="button"
								size="icon"
								variant="outline"
								motion="flat"
								aria-label="Previous page"
								className="reader-connected-tab reader-connected-tab-left -translate-y-1/2 hover:-translate-y-[calc(50%+1px)] disabled:hover:-translate-y-1/2 absolute top-1/2 right-[calc(100%+var(--reader-connected-tab-distance))] z-10 h-9 w-9 p-0 shadow-[3px_3px_0_var(--secondary)] transition hover:bg-primary hover:text-primary-foreground disabled:cursor-default disabled:opacity-30 disabled:hover:bg-card disabled:hover:text-foreground"
								disabled={!previous}
								onClick={() => travelToRelativePage(-1)}
							>
								<ArrowLeft size={15} strokeWidth={2.5} />
							</Button>
							<Button
								data-reader-component="PageNavigator"
								data-reader-role="page-summary-control"
								type="button"
								variant="ghost"
								motion="flat"
								aria-expanded={open}
								className="h-auto min-w-[11.5rem] border-0 px-3 py-1 text-center normal-case transition hover:bg-[color:var(--reader-part-soft)]"
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
							</Button>
							<Button
								data-reader-component="PageNavigator"
								data-reader-role="next-page-control"
								type="button"
								size="icon"
								variant="outline"
								motion="flat"
								aria-label="Next page"
								className="reader-connected-tab reader-connected-tab-right -translate-y-1/2 hover:-translate-y-[calc(50%+1px)] disabled:hover:-translate-y-1/2 absolute top-1/2 left-[calc(100%+var(--reader-connected-tab-distance))] z-10 h-9 w-9 p-0 shadow-[3px_3px_0_var(--secondary)] transition hover:bg-primary hover:text-primary-foreground disabled:cursor-default disabled:opacity-30 disabled:hover:bg-card disabled:hover:text-foreground"
								disabled={!next}
								onClick={() => travelToRelativePage(1)}
							>
								<ArrowRight size={15} strokeWidth={2.5} />
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
}
