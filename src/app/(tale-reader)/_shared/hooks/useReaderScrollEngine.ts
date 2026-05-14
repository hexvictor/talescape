"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef } from "react";

import {
	useReaderStore,
	useReaderStoreInstance,
} from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import { initActiveBlockTracker } from "~/app/(tale-reader)/_shared/scroll-engine/activeBlockTracker";
import { waitForImagesIn } from "~/app/(tale-reader)/_shared/scroll-engine/domReadiness";
import {
	afterFrame,
	afterTwoFrames,
} from "~/app/(tale-reader)/_shared/scroll-engine/frameTiming";
import {
	type InputBindingsApi,
	attachInputBindings,
} from "~/app/(tale-reader)/_shared/scroll-engine/inputBindings";
import {
	type PinnedScrollLayoutApi,
	initPinnedScrollLayout,
} from "~/app/(tale-reader)/_shared/scroll-engine/pinnedScrollLayout";
import { createScrollDriver } from "~/app/(tale-reader)/_shared/scroll-engine/scrollDriver";
import {
	type ScrollSnapModelApi,
	createScrollSnapModel,
} from "~/app/(tale-reader)/_shared/scroll-engine/scrollSnapModel";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

type UseReaderScrollEngineArgs = {
	wrapperRef: React.RefObject<HTMLElement | null>;
};

type ViewSnapshot = {
	blockId: number;
	scrollProgress: number;
};

export function useReaderScrollEngine({
	wrapperRef,
}: UseReaderScrollEngineArgs) {
	const store = useReaderStoreInstance();

	const readerHubOpen = useReaderStore((s) => s.taleHub.isOpen);
	const isStructureMounted = useReaderStore((s) => s.reader.isStructureMounted);
	const setScrollApi = useReaderStore((s) => s.scroll.setApi);
	const clearApi = useReaderStore((s) => s.scroll.clearApi);
	const setIsLayoutReady = useReaderStore((s) => s.reader.setIsLayoutReady);
	const setIsInitialLoadComplete = useReaderStore(
		(s) => s.reader.setIsInitialLoadComplete,
	);
	const setProgressTrackingPaused = useReaderStore(
		(s) => s.progress.setIsTrackingPaused,
	);
	const blocksById = useReaderStore(
		(s) => s.tale.data.content.indexMap.blocksById,
	);
	const setNavigation = useReaderStore((s) => s.navigation.set);

	// biome-ignore lint/suspicious/noExplicitAny:
	const smootherRef = useRef<any>(null);

	const engineApiRef = useRef<{
		setHubOpen: (open: boolean) => void;
		rebuild: () => void;
		refresh: (reason?: string) => void;
		cleanup: () => void;
	} | null>(null);

	const isProgrammaticScrollRef = useRef(false);
	const pendingTargetBlockIdRef = useRef<number | null>(null);
	const rebuildTimerRef = useRef<number | null>(null);
	const activeChangeTimerRef = useRef<number | null>(null);
	const lastQueuedActiveBlockIdRef = useRef<number | null>(null);
	const isInitialLoadCompleteRef = useRef(false);
	const isStructuralRebuildRef = useRef(false);
	const hasPendingStructuralRebuildRef = useRef(false);
	const initialAssetsReadyRef = useRef(false);
	const isQuietRefreshRef = useRef(false);
	const rebuildSnapshotRef = useRef<ViewSnapshot | null>(null);

	const driver = useMemo(() => createScrollDriver(smootherRef), []);
	const pinnedScrollLayoutRef = useRef<PinnedScrollLayoutApi | null>(null);
	const scrollSnapModelRef = useRef<ScrollSnapModelApi | null>(null);
	const inputsApiRef = useRef<InputBindingsApi | null>(null);
	const activeTrackerRef = useRef<ReturnType<
		typeof initActiveBlockTracker
	> | null>(null);

	useGSAP(
		() => {
			ScrollTrigger.config({
				ignoreMobileResize: true,
				autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
			});

			let disposed = false;
			let resizeObserver: ResizeObserver | null = null;

			const clearRebuildTimer = () => {
				if (rebuildTimerRef.current != null) {
					window.clearTimeout(rebuildTimerRef.current);
					rebuildTimerRef.current = null;
				}
			};

			const clearPendingActiveBlockUpdate = () => {
				if (activeChangeTimerRef.current != null) {
					window.clearTimeout(activeChangeTimerRef.current);
					activeChangeTimerRef.current = null;
				}

				lastQueuedActiveBlockIdRef.current = null;
			};

			const observeStructureElements = () => {
				resizeObserver?.disconnect();

				const observedEls =
					wrapperRef.current?.querySelectorAll<HTMLElement>(
						".pinned-section, .scroll-track",
					) ?? [];

				for (const el of observedEls) {
					resizeObserver?.observe(el);
				}
			};

			const syncVisibleLayout = () => {
				afterTwoFrames(() => {
					if (disposed) return;

					driver.syncLayout();
					activeTrackerRef.current?.updateNow();
				});
			};

			const finishQuietRefresh = (reason: string, scrollBefore: number) => {
				scrollSnapModelRef.current?.rebuild();
				activeTrackerRef.current?.rebuild();
				ScrollTrigger.refresh();
				driver.setScroll(scrollBefore);
				ScrollTrigger.update();

				isStructuralRebuildRef.current = false;
				setProgressTrackingPaused(false);

				if (!readerHubOpen) {
					inputsApiRef.current?.enable();
				}

				activeTrackerRef.current?.updateNow();

				afterTwoFrames(() => {
					isQuietRefreshRef.current = false;

					if (hasPendingStructuralRebuildRef.current) {
						hasPendingStructuralRebuildRef.current = false;
						runStructuralRebuild("pending", "normal");
					}
				});
			};

			const runQuietRefresh = (reason: string) => {
				if (!isInitialLoadCompleteRef.current) return;
				if (isStructuralRebuildRef.current) {
					hasPendingStructuralRebuildRef.current = true;
					return;
				}

				const scrollBefore = driver.getScroll();

				isQuietRefreshRef.current = true;
				isStructuralRebuildRef.current = true;
				setProgressTrackingPaused(true);
				inputsApiRef.current?.disable();
				inputsApiRef.current?.killTweens(true);
				clearPendingActiveBlockUpdate();

				observeStructureElements();
				pinnedScrollLayoutRef.current?.rebuild({ preserveExisting: true });

				afterFrame(() => {
					driver.setScroll(scrollBefore);
					ScrollTrigger.refresh();
					driver.setScroll(scrollBefore);
					ScrollTrigger.update();

					afterFrame(() => {
						finishQuietRefresh(reason, scrollBefore);
					});
				});
			};

			const flushActiveBlockUpdate = () => {
				activeChangeTimerRef.current = null;

				const blockId = lastQueuedActiveBlockIdRef.current;
				lastQueuedActiveBlockIdRef.current = null;

				if (blockId == null) return;

				const state = store.getState();

				if (
					state.progress.isTrackingPaused ||
					!state.reader.isInitialLoadComplete
				) {
					return;
				}

				const block = state.tale.data.content.indexMap.blocksById[blockId];
				if (!block) return;

				if (state.navigation.current?.block.id === blockId) {
					return;
				}

				state.navigation.set(block.id);

				if (!state.progress.isTrackingPaused) {
					state.progress.updateProgressByBlockId(blockId);
				}
			};

			const scheduleActiveBlockUpdate = (blockId: number) => {
				const state = store.getState();

				if (
					state.progress.isTrackingPaused ||
					!state.reader.isInitialLoadComplete
				) {
					return;
				}

				lastQueuedActiveBlockIdRef.current = blockId;

				if (activeChangeTimerRef.current != null) return;

				activeChangeTimerRef.current = window.setTimeout(() => {
					flushActiveBlockUpdate();
				}, 120);
			};

			const waitForInitialImages = async () => {
				await waitForImagesIn(wrapperRef.current);

				if (disposed) return;

				initialAssetsReadyRef.current = true;
			};

			const restoreToBlockStart = (
				blockId: number | null,
				reason: string,
				onDone?: (restoredBlockId: number | null) => void,
				attempt = 0,
			) => {
				const fallbackBlockId =
					store.getState().tale.data.content.bounds.firstBlockId ?? null;
				const targetBlockId = blockId ?? fallbackBlockId;

				if (targetBlockId == null) {
					onDone?.(null);
					return;
				}

				const block =
					store.getState().tale.data.content.indexMap.blocksById[targetBlockId];
				if (!block) {
					onDone?.(null);
					return;
				}

				const el = document.querySelector<HTMLElement>(
					`[data-block-id="${block.id}"]`,
				);
				if (!el) {
					if (attempt < 24) {
						afterFrame(() => {
							restoreToBlockStart(targetBlockId, reason, onDone, attempt + 1);
						});
						return;
					}

					if (targetBlockId !== fallbackBlockId) {
						restoreToBlockStart(fallbackBlockId, `${reason}-fallback`, onDone);
						return;
					}

					console.warn("[ReaderScrollEngine] restore target never mounted", {
						reason,
						blockId: targetBlockId,
					});
					onDone?.(null);
					return;
				}

				const range = scrollSnapModelRef.current?.getRangeForElement(el);
				if (!range) {
					if (attempt < 24) {
						ScrollTrigger.refresh();
						scrollSnapModelRef.current?.rebuild();
						afterFrame(() => {
							restoreToBlockStart(targetBlockId, reason, onDone, attempt + 1);
						});
						return;
					}

					if (targetBlockId !== fallbackBlockId) {
						restoreToBlockStart(fallbackBlockId, `${reason}-fallback`, onDone);
						return;
					}

					console.warn("[ReaderScrollEngine] restore target never mapped", {
						reason,
						blockId: targetBlockId,
					});
					onDone?.(null);
					return;
				}

				isProgrammaticScrollRef.current = true;
				setNavigation(block.id);

				driver.scrollTo(range.start, {
					duration: 0,
					ease: "none",
					onDone: () => {
						isProgrammaticScrollRef.current = false;
						activeTrackerRef.current?.rememberCurrentBlock(targetBlockId);
						onDone?.(targetBlockId);
					},
				});
			};

			const restoreViewSnapshot = (
				snapshot: ViewSnapshot,
				reason: string,
				onDone?: (restoredBlockId: number | null) => void,
			) => {
				const block = blocksById[snapshot.blockId];
				if (!block) {
					onDone?.(null);
					return;
				}

				const el = document.querySelector<HTMLElement>(
					`[data-block-id="${block.id}"]`,
				);
				if (!el) {
					onDone?.(null);
					return;
				}

				const range = scrollSnapModelRef.current?.getRangeForElement(el);
				if (!range) {
					onDone?.(null);
					return;
				}

				const targetScroll =
					range.start + (range.end - range.start) * snapshot.scrollProgress;

				isProgrammaticScrollRef.current = true;
				setNavigation(block.id);
				driver.setScroll(targetScroll);
				ScrollTrigger.update();
				isProgrammaticScrollRef.current = false;
				activeTrackerRef.current?.rememberCurrentBlock(block.id);
				onDone?.(block.id);
			};

			const getCurrentViewSnapshot = (): ViewSnapshot | null => {
				const activeBlock = store.getState().navigation.current?.block;
				if (activeBlock === undefined) return null;

				const el = document.querySelector<HTMLElement>(
					`[data-block-id="${activeBlock.id}"]`,
				);
				const range = el
					? scrollSnapModelRef.current?.getRangeForElement(el)
					: null;
				const scroll = driver.getScroll();
				const scrollProgress =
					range && range.end > range.start
						? Math.max(
								0,
								Math.min(1, (scroll - range.start) / (range.end - range.start)),
							)
						: 0;

				return {
					blockId: activeBlock.id,
					scrollProgress,
				};
			};

			const finalizeInitialLoad = (restoredBlockId: number | null) => {
				afterTwoFrames(() => {
					if (disposed) return;

					isStructuralRebuildRef.current = false;
					isInitialLoadCompleteRef.current = true;

					if (restoredBlockId != null) {
						activeTrackerRef.current?.rememberCurrentBlock(restoredBlockId);
					}

					driver.setPaused(false);
					driver.syncLayout();

					setIsLayoutReady(true);
					setIsInitialLoadComplete(true);
					setProgressTrackingPaused(false);

					if (!readerHubOpen) {
						inputsApiRef.current?.enable();
					}
				});
			};

			const finalizeNormalRebuild = (reason: string) => {
				const snapshot = rebuildSnapshotRef.current;
				rebuildSnapshotRef.current = null;

				const restoreDone = (restoredBlockId: number | null) => {
					isStructuralRebuildRef.current = false;
					setProgressTrackingPaused(false);
					driver.setPaused(false);

					if (restoredBlockId != null) {
						activeTrackerRef.current?.rememberCurrentBlock(restoredBlockId);
					}

					if (!readerHubOpen) {
						inputsApiRef.current?.enable();
					}

					syncVisibleLayout();
				};

				if (!snapshot) {
					restoreDone(null);
					return;
				}

				restoreViewSnapshot(snapshot, reason, restoreDone);
			};

			const finishStructuralRebuild = (
				reason: string,
				mode: "initial" | "normal",
			) => {
				if (mode === "initial") {
					hasPendingStructuralRebuildRef.current = false;

					const savedBlockId =
						store.getState().progress.data.lastBlockId ?? null;

					restoreToBlockStart(savedBlockId, "initial-restore", (blockId) => {
						finalizeInitialLoad(blockId);
					});

					return;
				}

				if (hasPendingStructuralRebuildRef.current) {
					hasPendingStructuralRebuildRef.current = false;
					runStructuralRebuild("pending", "normal");
					return;
				}

				finalizeNormalRebuild(reason);
			};

			const runStructuralRebuild = (
				reason: string,
				mode: "initial" | "normal",
			) => {
				clearRebuildTimer();

				if (mode === "normal") {
					rebuildSnapshotRef.current = getCurrentViewSnapshot();
				} else {
					rebuildSnapshotRef.current = null;
				}

				isStructuralRebuildRef.current = true;
				setProgressTrackingPaused(true);
				driver.setPaused(true);
				inputsApiRef.current?.disable();
				inputsApiRef.current?.killTweens(true);
				clearPendingActiveBlockUpdate();

				observeStructureElements();
				pinnedScrollLayoutRef.current?.rebuild({ preserveExisting: true });

				afterFrame(() => {
					ScrollTrigger.refresh();
					const snapshot = rebuildSnapshotRef.current;
					if (snapshot) {
						restoreViewSnapshot(snapshot, `${reason}-mid-refresh`);
					}

					afterFrame(() => {
						scrollSnapModelRef.current?.rebuild();
						activeTrackerRef.current?.rebuild();
						ScrollTrigger.refresh();
						const snapshot = rebuildSnapshotRef.current;
						if (snapshot) {
							restoreViewSnapshot(snapshot, `${reason}-post-refresh`);
						}

						afterFrame(() => {
							finishStructuralRebuild(reason, mode);
						});
					});
				});
			};

			const scheduleStructuralRebuild = (delay = 180, reason = "scheduled") => {
				const isResizeObserverReason = reason === "resize-observer";

				if (isResizeObserverReason && !isInitialLoadCompleteRef.current) {
					return;
				}

				if (isStructuralRebuildRef.current) {
					if (isResizeObserverReason) return;

					hasPendingStructuralRebuildRef.current = true;
					return;
				}

				if (
					!isInitialLoadCompleteRef.current &&
					(!initialAssetsReadyRef.current ||
						!store.getState().reader.isStructureMounted)
				) {
					return;
				}

				const mode: "initial" | "normal" = isInitialLoadCompleteRef.current
					? "normal"
					: "initial";

				clearRebuildTimer();

				rebuildTimerRef.current = window.setTimeout(() => {
					runStructuralRebuild(reason, mode);
				}, delay);
			};

			const rebuild = () => {
				scheduleStructuralRebuild(0, "external");
			};

			setIsLayoutReady(false);
			setIsInitialLoadComplete(false);
			setProgressTrackingPaused(true);

			isInitialLoadCompleteRef.current = false;
			hasPendingStructuralRebuildRef.current = false;
			initialAssetsReadyRef.current = false;

			driver.init({
				wrapper: "#smooth-wrapper",
				content: "#smooth-content",
			});

			pinnedScrollLayoutRef.current = initPinnedScrollLayout();

			scrollSnapModelRef.current = createScrollSnapModel({
				pinnedMeta: pinnedScrollLayoutRef.current.pinnedMeta,
				pinnedSTBySection: pinnedScrollLayoutRef.current.pinnedSTBySection,
			});

			inputsApiRef.current = attachInputBindings({
				driver,
				model: scrollSnapModelRef.current,
			});

			activeTrackerRef.current = initActiveBlockTracker({
				model: scrollSnapModelRef.current,
				getScroll: driver.getScroll,
				onVisibleBlockChange: scheduleActiveBlockUpdate,
				shouldTrack: () =>
					!isProgrammaticScrollRef.current && !isStructuralRebuildRef.current,
			});

			const setHubOpen = (open: boolean) => {
				driver.setPaused(open);

				if (open) {
					document.documentElement.style.overflow = "hidden";
					document.body.style.overflow = "hidden";
					inputsApiRef.current?.disable();
				} else {
					document.documentElement.style.overflow = "";
					document.body.style.overflow = "";

					if (!isStructuralRebuildRef.current) {
						inputsApiRef.current?.enable();
					}
				}
			};

			resizeObserver =
				typeof ResizeObserver !== "undefined"
					? new ResizeObserver(() => {
							if (isQuietRefreshRef.current) return;
							scheduleStructuralRebuild(180, "resize-observer");
						})
					: null;

			observeStructureElements();

			const onWindowResize = () => {
				scheduleStructuralRebuild(180, "window-resize");
			};

			engineApiRef.current = {
				setHubOpen,
				rebuild,
				refresh: (reason = "external-refresh") => {
					runQuietRefresh(reason);
				},
				cleanup: () => {
					clearApi();
					clearRebuildTimer();
					clearPendingActiveBlockUpdate();
					resizeObserver?.disconnect();

					setIsLayoutReady(false);
					setIsInitialLoadComplete(false);
					setProgressTrackingPaused(false);

					isInitialLoadCompleteRef.current = false;
					hasPendingStructuralRebuildRef.current = false;
					initialAssetsReadyRef.current = false;
					isStructuralRebuildRef.current = false;
					isQuietRefreshRef.current = false;
					rebuildSnapshotRef.current = null;

					activeTrackerRef.current?.cleanup();
					activeTrackerRef.current = null;

					inputsApiRef.current?.cleanup();
					inputsApiRef.current = null;

					scrollSnapModelRef.current?.cleanup();
					scrollSnapModelRef.current = null;

					pinnedScrollLayoutRef.current?.cleanup();
					pinnedScrollLayoutRef.current = null;

					driver.cleanup();
				},
			};

			setScrollApi({
				scrollToBlockId: (
					blockId: number,
					opts?: { duration?: number; navigate?: boolean },
				) => {
					const { duration = 0.35, navigate = true } = opts ?? {};
					const block = blocksById[blockId];
					if (!block) return;

					const el = document.querySelector<HTMLElement>(
						`[data-block-id="${block.id}"]`,
					);
					if (!el) return;

					const range = scrollSnapModelRef.current?.getRangeForElement(el);
					if (!range) return;

					clearPendingActiveBlockUpdate();

					isProgrammaticScrollRef.current = true;
					pendingTargetBlockIdRef.current = navigate ? blockId : null;

					driver.scrollTo(range.start, {
						duration,
						ease: "power1.inOut",
						onDone: () => {
							const targetBlockId = pendingTargetBlockIdRef.current;

							isProgrammaticScrollRef.current = false;
							pendingTargetBlockIdRef.current = null;

							if (navigate && targetBlockId != null) {
								scheduleActiveBlockUpdate(targetBlockId);
							} else {
								activeTrackerRef.current?.updateNow();
							}
						},
					});
				},
				setPaused: (paused: boolean) => {
					driver.setPaused(paused);
				},
				rebuild: () => {
					rebuild();
				},
				clearPendingActiveBlockUpdate: () => {
					clearPendingActiveBlockUpdate();
				},
			});

			engineApiRef.current.setHubOpen(!!readerHubOpen);

			void waitForInitialImages().then(() => {
				if (disposed) return;

				scheduleStructuralRebuild(0, "initial-load");
			});

			window.addEventListener("resize", onWindowResize);

			return () => {
				disposed = true;
				window.removeEventListener("resize", onWindowResize);

				engineApiRef.current?.cleanup();
				engineApiRef.current = null;

				for (const trigger of ScrollTrigger.getAll()) {
					trigger.kill();
				}
			};
		},
		{ scope: wrapperRef },
	);

	useEffect(() => {
		engineApiRef.current?.setHubOpen(!!readerHubOpen);
	}, [readerHubOpen]);

	useEffect(() => {
		if (!isStructureMounted) return;
		const isInitialLoadComplete = store.getState().reader.isInitialLoadComplete;

		if (isInitialLoadComplete) {
			engineApiRef.current?.refresh("visible-structure-mounted");
			return;
		}

		engineApiRef.current?.rebuild();
	}, [isStructureMounted, store]);

	return {};
}
