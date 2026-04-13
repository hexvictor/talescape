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
	type InputsApi,
	attachInputs,
} from "~/features/tale-reader/scroll-engine/input";
import {
	type PinnedLayoutApi,
	initPinnedLayout,
} from "~/features/tale-reader/scroll-engine/pinnedLayout";
import { createScrollDriver } from "~/features/tale-reader/scroll-engine/scrollDriver";
import {
	type SnapModelApi,
	createSnapModel,
} from "~/features/tale-reader/scroll-engine/snapModel";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

type UseTaleScrollEngineArgs = {
	wrapperRef: React.RefObject<HTMLElement | null>;
};

type ViewSnapshot = {
	blockId: number;
};

export function useTaleScrollEngine({ wrapperRef }: UseTaleScrollEngineArgs) {
	const store = useReaderStoreInstance();
	const taleHubOpen = useReaderStore((s) => s.taleHubOpen);
	const setScrollApi = useReaderStore((s) => s.setScrollApi);
	const clearScrollApi = useReaderStore((s) => s.clearScrollApi);
	const setIsLayoutReady = useReaderStore((s) => s.setIsLayoutReady);
	const setIsViewportRebuilding = useReaderStore(
		(s) => s.setIsViewportRebuilding,
	);
	const setProgressTrackingPaused = useReaderStore(
		(s) => s.setProgressTrackingPaused,
	);
	const blocksById = useReaderStore(
		(s) => s.tale.structure.indexMap.blocksById,
	);
	const setActiveBlockId = useReaderStore((s) => s.setActiveBlockId);
	const setNavigationByBlock = useReaderStore((s) => s.setNavigationByBlock);
	const onActiveBlockChanged = useReaderStore((s) => s.onActiveBlockChanged);

	const smootherRef = useRef<any>(null);

	const engineApiRef = useRef<{
		setHubOpen: (open: boolean) => void;
		rebuild: () => void;
		cleanup: () => void;
	} | null>(null);

	const isProgrammaticScrollRef = useRef(false);
	const pendingTargetBlockIdRef = useRef<number | null>(null);
	const layoutReadyTimerRef = useRef<number | null>(null);
	const rebuildTimerRef = useRef<number | null>(null);
	const hasCompletedInitialLayoutRef = useRef(false);
	const isStructuralRebuildRef = useRef(false);
	const hasPendingStructuralRebuildRef = useRef(false);
	const initialAssetsReadyRef = useRef(false);
	const rebuildSnapshotRef = useRef<ViewSnapshot | null>(null);

	const driver = useMemo(() => createScrollDriver(smootherRef), []);
	const pinnedLayoutRef = useRef<PinnedLayoutApi | null>(null);
	const snapModelRef = useRef<SnapModelApi | null>(null);
	const inputsApiRef = useRef<InputsApi | null>(null);
	const activeTrackerRef = useRef<ReturnType<
		typeof initActiveBlockTracker
	> | null>(null);

	useGSAP(
		() => {
			console.log("[TaleScrollEngine] init");

			ScrollTrigger.config({
				ignoreMobileResize: true,
				autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
			});

			let disposed = false;

			const clearLayoutReadyTimer = () => {
				if (layoutReadyTimerRef.current != null) {
					window.clearTimeout(layoutReadyTimerRef.current);
					layoutReadyTimerRef.current = null;
				}
			};

			const clearRebuildTimer = () => {
				if (rebuildTimerRef.current != null) {
					window.clearTimeout(rebuildTimerRef.current);
					rebuildTimerRef.current = null;
				}
			};

			const markLayoutReadySoon = () => {
				console.log("[TaleScrollEngine] mark layout ready soon");

				clearLayoutReadyTimer();

				layoutReadyTimerRef.current = window.setTimeout(() => {
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							if (disposed) return;

							console.log("[TaleScrollEngine] layout ready");
							setIsLayoutReady(true);
							hasCompletedInitialLayoutRef.current = true;
							layoutReadyTimerRef.current = null;
						});
					});
				}, 120);
			};

			const waitForInitialImages = async () => {
				const root = wrapperRef.current;
				if (!root) {
					console.log("[TaleScrollEngine] no wrapper found for initial assets");
					initialAssetsReadyRef.current = true;
					return;
				}

				const images = Array.from(
					root.querySelectorAll<HTMLImageElement>("img"),
				);

				if (!images.length) {
					console.log("[TaleScrollEngine] no initial images to wait for");
					initialAssetsReadyRef.current = true;
					return;
				}

				console.log("[TaleScrollEngine] waiting for initial images", {
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

				console.log("[TaleScrollEngine] initial images loaded");
			};

			const getCurrentViewSnapshot = (): ViewSnapshot | null => {
				const activeBlockId = store.getState().activeBlockId;
				if (activeBlockId == null) return null;

				const block = blocksById[activeBlockId];
				if (!block) return null;

				console.log("[TaleScrollEngine] snapshot captured", {
					blockId: activeBlockId,
				});

				return {
					blockId: activeBlockId,
				};
			};

			const restoreViewSnapshot = () => {
				const snapshot = rebuildSnapshotRef.current;
				rebuildSnapshotRef.current = null;
				if (!snapshot) return;

				const block = blocksById[snapshot.blockId];
				if (!block) return;

				const el = document.querySelector<HTMLElement>(
					`[data-anchor-id="${block.anchorId}"]`,
				);
				if (!el) return;

				const range = snapModelRef.current?.getRangeForElement(el);
				if (!range) return;

				console.log("[TaleScrollEngine] restoring snapshot", {
					blockId: snapshot.blockId,
				});

				isProgrammaticScrollRef.current = true;
				setActiveBlockId(block.id);
				setNavigationByBlock(block);

				driver.scrollTo(range.start, {
					duration: 0,
					ease: "none",
					onDone: () => {
						isProgrammaticScrollRef.current = false;
						activeTrackerRef.current?.updateNow();
						console.log("[TaleScrollEngine] snapshot restored");
					},
				});
			};

			const finishStructuralRebuild = (reason: string) => {
				if (hasPendingStructuralRebuildRef.current) {
					console.log(
						"[TaleScrollEngine] running pending rebuild after current",
						{
							reason,
						},
					);

					hasPendingStructuralRebuildRef.current = false;
					runStructuralRebuild("pending");
					return;
				}

				restoreViewSnapshot();

				isStructuralRebuildRef.current = false;
				setIsViewportRebuilding(false);
				setProgressTrackingPaused(false);
				driver.setPaused(false);

				if (!taleHubOpen) {
					inputsApiRef.current?.enable();
				}

				activeTrackerRef.current?.updateNow();

				console.log("[TaleScrollEngine] rebuild finished", { reason });

				if (!hasCompletedInitialLayoutRef.current) {
					markLayoutReadySoon();
				}
			};

			const runStructuralRebuild = (reason: string) => {
				clearRebuildTimer();

				const isInitialPhase = !hasCompletedInitialLayoutRef.current;
				const shouldShowOverlay = !isInitialPhase;

				if (shouldShowOverlay) {
					rebuildSnapshotRef.current = getCurrentViewSnapshot();
					setIsViewportRebuilding(true);
				} else {
					rebuildSnapshotRef.current = null;
					console.log(
						"[TaleScrollEngine] rebuild started before first load finished",
						{
							reason,
						},
					);
				}

				console.log("[TaleScrollEngine] rebuild started", {
					reason,
					initialPhase: isInitialPhase,
					showOverlay: shouldShowOverlay,
				});

				isStructuralRebuildRef.current = true;
				setProgressTrackingPaused(true);
				driver.setPaused(true);
				inputsApiRef.current?.disable();
				inputsApiRef.current?.killTweens(true);

				pinnedLayoutRef.current?.rebuild();

				requestAnimationFrame(() => {
					ScrollTrigger.refresh();

					requestAnimationFrame(() => {
						snapModelRef.current?.rebuild();
						activeTrackerRef.current?.rebuild();
						ScrollTrigger.refresh();

						requestAnimationFrame(() => {
							finishStructuralRebuild(reason);
						});
					});
				});
			};

			const scheduleStructuralRebuild = (delay = 180, reason = "scheduled") => {
				if (isStructuralRebuildRef.current) {
					hasPendingStructuralRebuildRef.current = true;

					console.log(
						"[TaleScrollEngine] rebuild queued while another rebuild is running",
						{
							reason,
						},
					);

					return;
				}

				if (
					!hasCompletedInitialLayoutRef.current &&
					!initialAssetsReadyRef.current
				) {
					console.log(
						"[TaleScrollEngine] rebuild requested before initial loading finished",
						{
							reason,
						},
					);

					return;
				}

				console.log("[TaleScrollEngine] rebuild scheduled", { delay, reason });

				clearRebuildTimer();

				rebuildTimerRef.current = window.setTimeout(() => {
					runStructuralRebuild(reason);
				}, delay);
			};

			const rebuild = () => {
				scheduleStructuralRebuild(0, "external");
			};

			setIsLayoutReady(false);
			setIsViewportRebuilding(false);
			setProgressTrackingPaused(true);
			hasCompletedInitialLayoutRef.current = false;
			hasPendingStructuralRebuildRef.current = false;
			initialAssetsReadyRef.current = false;

			driver.init({
				wrapper: "#smooth-wrapper",
				content: "#smooth-content",
			});

			pinnedLayoutRef.current = initPinnedLayout();

			snapModelRef.current = createSnapModel({
				pinnedMeta: pinnedLayoutRef.current.pinnedMeta,
				pinnedSTBySection: pinnedLayoutRef.current.pinnedSTBySection,
			});

			inputsApiRef.current = attachInputs({
				driver,
				model: snapModelRef.current,
			});

			activeTrackerRef.current = initActiveBlockTracker({
				model: snapModelRef.current,
				getScroll: driver.getScroll,
				onActiveBlockChanged,
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
				console.log("[TaleScrollEngine] window resize");
				scheduleStructuralRebuild(180, "window-resize");
			};

			engineApiRef.current = {
				setHubOpen,
				rebuild,
				cleanup: () => {
					console.log("[TaleScrollEngine] cleanup");

					clearScrollApi();
					clearLayoutReadyTimer();
					clearRebuildTimer();
					resizeObserver?.disconnect();
					setIsLayoutReady(false);
					setIsViewportRebuilding(false);
					setProgressTrackingPaused(false);
					hasCompletedInitialLayoutRef.current = false;
					hasPendingStructuralRebuildRef.current = false;
					initialAssetsReadyRef.current = false;
					isStructuralRebuildRef.current = false;
					rebuildSnapshotRef.current = null;

					activeTrackerRef.current?.cleanup();
					activeTrackerRef.current = null;

					inputsApiRef.current?.cleanup();
					inputsApiRef.current = null;

					snapModelRef.current?.cleanup();
					snapModelRef.current = null;

					pinnedLayoutRef.current?.cleanup();
					pinnedLayoutRef.current = null;

					driver.cleanup();
				},
			};

			setScrollApi({
				scrollToBlockId: (blockId: number, opts?: { duration?: number }) => {
					const block = blocksById[blockId];
					if (!block) return;

					const el = document.querySelector<HTMLElement>(
						`[data-anchor-id="${block.anchorId}"]`,
					);
					if (!el) return;

					const range = snapModelRef.current?.getRangeForElement(el);
					if (!range) return;

					console.log("[TaleScrollEngine] scrollToBlockId", {
						blockId,
						duration: opts?.duration ?? 0.35,
					});

					isProgrammaticScrollRef.current = true;
					pendingTargetBlockIdRef.current = blockId;

					driver.scrollTo(range.start, {
						duration: opts?.duration ?? 0.35,
						ease: "power1.inOut",
						onDone: () => {
							const targetBlockId = pendingTargetBlockIdRef.current;

							isProgrammaticScrollRef.current = false;
							pendingTargetBlockIdRef.current = null;

							if (targetBlockId != null) {
								onActiveBlockChanged(targetBlockId);
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
					console.log("[TaleScrollEngine] external rebuild requested");
					rebuild();
				},
			});

			engineApiRef.current.setHubOpen(!!taleHubOpen);

			void waitForInitialImages().then(() => {
				if (disposed) return;

				console.log("[TaleScrollEngine] initial structural rebuild");
				runStructuralRebuild("initial-load");
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
		engineApiRef.current?.setHubOpen(!!taleHubOpen);
	}, [taleHubOpen]);

	return {};
}
