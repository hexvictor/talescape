"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef } from "react";

import {
	useReaderStore,
	useReaderStoreInstance,
} from "~/features/tale-reader/contexts/ReaderStoreContext";
import { initActiveBlockTracker } from "~/features/tale-reader/scroll-engine/activeBlockTracker";
import {
	type InputBindingsApi,
	attachInputBindings,
} from "~/features/tale-reader/scroll-engine/inputBindings";
import {
	type PinnedScrollLayoutApi,
	initPinnedScrollLayout,
} from "~/features/tale-reader/scroll-engine/pinnedScrollLayout";
import { createScrollDriver } from "~/features/tale-reader/scroll-engine/scrollDriver";
import {
	type ScrollSnapModelApi,
	createScrollSnapModel,
} from "~/features/tale-reader/scroll-engine/scrollSnapModel";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

type UseReaderScrollEngineArgs = {
	wrapperRef: React.RefObject<HTMLElement | null>;
};

type ViewSnapshot = {
	blockId: number;
};

export function useReaderScrollEngine({
	wrapperRef,
}: UseReaderScrollEngineArgs) {
	const store = useReaderStoreInstance();

	const readerHubOpen = useReaderStore((s) => s.taleHub.isOpen);
	const setScrollApi = useReaderStore((s) => s.scroll.setApi);
	const clearApi = useReaderStore((s) => s.scroll.clearApi);
	const setIsLayoutReady = useReaderStore((s) => s.setIsLayoutReady);
	const setIsInitialLoadComplete = useReaderStore(
		(s) => s.setIsInitialLoadComplete,
	);
	const setIsViewportRebuilding = useReaderStore(
		(s) => s.setIsViewportRebuilding,
	);
	const setProgressTrackingPaused = useReaderStore(
		(s) => s.setProgressTrackingPaused,
	);
	const blocksById = useReaderStore(
		(s) => s.tale.structure.indexMap.blocksById,
	);
	const setNavigation = useReaderStore((s) => s.setNavigation);

	// biome-ignore lint/suspicious/noExplicitAny:
	const smootherRef = useRef<any>(null);

	const engineApiRef = useRef<{
		setHubOpen: (open: boolean) => void;
		rebuild: () => void;
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
			console.log("[ReaderScrollEngine] init");

			ScrollTrigger.config({
				ignoreMobileResize: true,
				autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
			});

			let disposed = false;

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

			const flushActiveBlockUpdate = () => {
				activeChangeTimerRef.current = null;

				const blockId = lastQueuedActiveBlockIdRef.current;
				lastQueuedActiveBlockIdRef.current = null;

				if (blockId == null) return;

				const state = store.getState();

				if (state.progressTrackingPaused || !state.isInitialLoadComplete) {
					return;
				}

				const block = state.tale.structure.indexMap.blocksById[blockId];
				if (!block) return;

				if (state.navigation?.block.id === blockId) {
					return;
				}

				state.setNavigation(block.id);

				if (!state.progressTrackingPaused) {
					state.updateProgressByBlockId(blockId);
				}
			};

			const scheduleActiveBlockUpdate = (blockId: number) => {
				const state = store.getState();

				if (state.progressTrackingPaused || !state.isInitialLoadComplete) {
					return;
				}

				lastQueuedActiveBlockIdRef.current = blockId;

				if (activeChangeTimerRef.current != null) return;

				activeChangeTimerRef.current = window.setTimeout(() => {
					flushActiveBlockUpdate();
				}, 120);
			};

			const waitForInitialImages = async () => {
				const root = wrapperRef.current;
				if (!root) {
					console.log(
						"[ReaderScrollEngine] no wrapper found for initial assets",
					);
					initialAssetsReadyRef.current = true;
					return;
				}

				const images = Array.from(
					root.querySelectorAll<HTMLImageElement>("img"),
				);

				if (!images.length) {
					console.log("[ReaderScrollEngine] no initial images to wait for");
					initialAssetsReadyRef.current = true;
					return;
				}

				console.log("[ReaderScrollEngine] waiting for initial images", {
					imageCount: images.length,
				});

				await Promise.all(
					images.map(
						(img) =>
							new Promise<void>((resolve) => {
								if (img.complete) {
									resolve();
									return;
								}

								const handleDone = () => {
									img.removeEventListener("load", handleDone);
									img.removeEventListener("error", handleDone);
									resolve();
								};

								img.addEventListener("load", handleDone, { once: true });
								img.addEventListener("error", handleDone, { once: true });
							}),
					),
				);

				if (disposed) return;

				initialAssetsReadyRef.current = true;
				console.log("[ReaderScrollEngine] initial images loaded");
			};

			const restoreToBlockStart = (
				blockId: number | null,
				reason: string,
				onDone?: () => void,
			) => {
				if (blockId == null) {
					onDone?.();
					return;
				}

				const block = blocksById[blockId];
				if (!block) {
					onDone?.();
					return;
				}

				const el = document.querySelector<HTMLElement>(
					`[data-block-id="${block.id}"]`,
				);
				if (!el) {
					onDone?.();
					return;
				}

				const range = scrollSnapModelRef.current?.getRangeForElement(el);
				if (!range) {
					onDone?.();
					return;
				}

				console.log("[ReaderScrollEngine] restoring to block start", {
					reason,
					blockId,
				});

				isProgrammaticScrollRef.current = true;
				setNavigation(block.id);

				driver.scrollTo(range.start, {
					duration: 0,
					ease: "none",
					onDone: () => {
						isProgrammaticScrollRef.current = false;
						activeTrackerRef.current?.updateNow();
						console.log("[ReaderScrollEngine] restore complete", {
							reason,
							blockId,
						});
						onDone?.();
					},
				});
			};

			const getCurrentViewSnapshot = (): ViewSnapshot | null => {
				const activeBlock = store.getState().navigation?.block;
				if (activeBlock === undefined) return null;

				console.log("[ReaderScrollEngine] snapshot captured", {
					blockId: activeBlock.id,
				});

				return {
					blockId: activeBlock.id,
				};
			};

			const finalizeInitialLoad = () => {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						if (disposed) return;

						console.log("[ReaderScrollEngine] initial load complete");

						isStructuralRebuildRef.current = false;
						isInitialLoadCompleteRef.current = true;

						setIsLayoutReady(true);
						setIsInitialLoadComplete(true);
						setIsViewportRebuilding(false);
						setProgressTrackingPaused(false);

						driver.setPaused(false);

						if (!readerHubOpen) {
							inputsApiRef.current?.enable();
						}

						activeTrackerRef.current?.updateNow();
					});
				});
			};

			const finalizeNormalRebuild = (reason: string) => {
				const snapshot = rebuildSnapshotRef.current;
				rebuildSnapshotRef.current = null;

				const restoreDone = () => {
					isStructuralRebuildRef.current = false;
					setIsViewportRebuilding(false);
					setProgressTrackingPaused(false);
					driver.setPaused(false);

					if (!readerHubOpen) {
						inputsApiRef.current?.enable();
					}

					activeTrackerRef.current?.updateNow();

					console.log("[ReaderScrollEngine] rebuild finished", { reason });
				};

				if (!snapshot) {
					restoreDone();
					return;
				}

				restoreToBlockStart(snapshot.blockId, reason, restoreDone);
			};

			const finishStructuralRebuild = (
				reason: string,
				mode: "initial" | "normal",
			) => {
				if (hasPendingStructuralRebuildRef.current) {
					console.log(
						"[ReaderScrollEngine] running pending rebuild after current",
						{
							reason,
							mode,
						},
					);

					hasPendingStructuralRebuildRef.current = false;
					runStructuralRebuild(
						"pending",
						isInitialLoadCompleteRef.current ? "normal" : "initial",
					);
					return;
				}

				if (mode === "initial") {
					const savedBlockId = store.getState().progress.lastBlockId ?? null;

					restoreToBlockStart(savedBlockId, "initial-restore", () => {
						finalizeInitialLoad();
					});

					return;
				}

				finalizeNormalRebuild(reason);
			};

			const runStructuralRebuild = (
				reason: string,
				mode: "initial" | "normal",
			) => {
				clearRebuildTimer();

				const shouldShowOverlay = mode === "normal";

				if (shouldShowOverlay) {
					rebuildSnapshotRef.current = getCurrentViewSnapshot();
					setIsViewportRebuilding(true);
				} else {
					rebuildSnapshotRef.current = null;
					console.log(
						"[ReaderScrollEngine] rebuild started before first load finished",
						{
							reason,
						},
					);
				}

				console.log("[ReaderScrollEngine] rebuild started", {
					reason,
					mode,
					showOverlay: shouldShowOverlay,
				});

				isStructuralRebuildRef.current = true;
				setProgressTrackingPaused(true);
				driver.setPaused(true);
				inputsApiRef.current?.disable();
				inputsApiRef.current?.killTweens(true);
				clearPendingActiveBlockUpdate();

				pinnedScrollLayoutRef.current?.rebuild();

				requestAnimationFrame(() => {
					ScrollTrigger.refresh();

					requestAnimationFrame(() => {
						scrollSnapModelRef.current?.rebuild();
						activeTrackerRef.current?.rebuild();
						ScrollTrigger.refresh();

						requestAnimationFrame(() => {
							finishStructuralRebuild(reason, mode);
						});
					});
				});
			};

			const scheduleStructuralRebuild = (delay = 180, reason = "scheduled") => {
				if (isStructuralRebuildRef.current) {
					hasPendingStructuralRebuildRef.current = true;

					console.log(
						"[ReaderScrollEngine] rebuild queued while another rebuild is running",
						{
							reason,
						},
					);

					return;
				}

				if (
					!isInitialLoadCompleteRef.current &&
					!initialAssetsReadyRef.current
				) {
					console.log(
						"[ReaderScrollEngine] rebuild requested before initial loading finished",
						{
							reason,
						},
					);
					return;
				}

				const mode: "initial" | "normal" = isInitialLoadCompleteRef.current
					? "normal"
					: "initial";

				console.log("[ReaderScrollEngine] rebuild scheduled", {
					delay,
					reason,
					mode,
				});

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
			setIsViewportRebuilding(false);
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
				scheduleActiveBlockUpdate,
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

			const resizeObserver =
				typeof ResizeObserver !== "undefined"
					? new ResizeObserver(() => {
							scheduleStructuralRebuild(180, "resize-observer");
						})
					: null;

			const observedEls =
				wrapperRef.current?.querySelectorAll<HTMLElement>(
					".pinned-section, .scroll-track",
				) ?? [];

			for (const el of observedEls) {
				resizeObserver?.observe(el);
			}

			const onWindowResize = () => {
				console.log("[ReaderScrollEngine] window resize");
				scheduleStructuralRebuild(180, "window-resize");
			};

			engineApiRef.current = {
				setHubOpen,
				rebuild,
				cleanup: () => {
					console.log("[ReaderScrollEngine] cleanup");

					clearApi();
					clearRebuildTimer();
					clearPendingActiveBlockUpdate();
					resizeObserver?.disconnect();

					setIsLayoutReady(false);
					setIsInitialLoadComplete(false);
					setIsViewportRebuilding(false);
					setProgressTrackingPaused(false);

					isInitialLoadCompleteRef.current = false;
					hasPendingStructuralRebuildRef.current = false;
					initialAssetsReadyRef.current = false;
					isStructuralRebuildRef.current = false;
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

					console.log("[ReaderScrollEngine] scrollToBlockId", {
						blockId,
						duration,
						navigate,
					});

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
					console.log("[ReaderScrollEngine] external rebuild requested");
					rebuild();
				},
				clearPendingActiveBlockUpdate: () => {
					clearPendingActiveBlockUpdate();
				},
			});

			engineApiRef.current.setHubOpen(!!readerHubOpen);

			void waitForInitialImages().then(() => {
				if (disposed) return;

				console.log("[ReaderScrollEngine] initial structural rebuild");
				runStructuralRebuild("initial-load", "initial");
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

	return {};
}
