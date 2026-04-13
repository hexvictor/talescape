"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef } from "react";

import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
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

export function useTaleScrollEngine({ wrapperRef }: UseTaleScrollEngineArgs) {
	const taleHubOpen = useReaderStore((s) => s.taleHubOpen);
	const setScrollApi = useReaderStore((s) => s.setScrollApi);
	const clearScrollApi = useReaderStore((s) => s.clearScrollApi);
	const setIsLayoutReady = useReaderStore((s) => s.setIsLayoutReady);
	const blocksById = useReaderStore(
		(s) => s.tale.structure.indexMap.blocksById,
	);
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

	const driver = useMemo(() => createScrollDriver(smootherRef), []);
	const pinnedLayoutRef = useRef<PinnedLayoutApi | null>(null);
	const snapModelRef = useRef<SnapModelApi | null>(null);
	const inputsApiRef = useRef<InputsApi | null>(null);
	const activeTrackerRef = useRef<ReturnType<
		typeof initActiveBlockTracker
	> | null>(null);

	useGSAP(
		() => {
			ScrollTrigger.config({
				ignoreMobileResize: true,
				autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
			});

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
				clearLayoutReadyTimer();

				layoutReadyTimerRef.current = window.setTimeout(() => {
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							setIsLayoutReady(true);
							hasCompletedInitialLayoutRef.current = true;
							layoutReadyTimerRef.current = null;
						});
					});
				}, 120);
			};

			const finishStructuralRebuild = () => {
				isStructuralRebuildRef.current = false;
				driver.setPaused(false);

				if (!taleHubOpen) {
					inputsApiRef.current?.enable();
				}

				if (!hasCompletedInitialLayoutRef.current) {
					markLayoutReadySoon();
				}
			};

			const runStructuralRebuild = () => {
				clearRebuildTimer();

				isStructuralRebuildRef.current = true;
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
							finishStructuralRebuild();
						});
					});
				});
			};

			const scheduleStructuralRebuild = (delay = 500) => {
				clearRebuildTimer();

				rebuildTimerRef.current = window.setTimeout(() => {
					runStructuralRebuild();
				}, delay);
			};

			const rebuild = () => {
				scheduleStructuralRebuild(0);
			};

			setIsLayoutReady(false);
			hasCompletedInitialLayoutRef.current = false;

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
							scheduleStructuralRebuild();
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
				scheduleStructuralRebuild();
			};

			engineApiRef.current = {
				setHubOpen,
				rebuild,
				cleanup: () => {
					clearScrollApi();
					clearLayoutReadyTimer();
					clearRebuildTimer();
					resizeObserver?.disconnect();
					setIsLayoutReady(false);
					hasCompletedInitialLayoutRef.current = false;
					isStructuralRebuildRef.current = false;

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
					rebuild();
				},
			});

			engineApiRef.current.setHubOpen(!!taleHubOpen);

			runStructuralRebuild();

			window.addEventListener("resize", onWindowResize);

			return () => {
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
