"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ScrollSnapModelApi } from "./scrollSnapModel";

type ActiveBlockTrackerApi = {
	rebuild: () => void;
	cleanup: () => void;
	updateNow: () => void;
	rememberCurrentBlock: (blockId: number | null) => void;
};

type ActiveBlockTrackerArgs = {
	model: ScrollSnapModelApi;
	getScroll: () => number;
	onVisibleBlockChange: (blockId: number) => void;
	onScrollStateChange?: (state: {
		maxPx: number;
		progress: number;
		scrollPx: number;
		viewportHeight: number;
	}) => void;
	shouldTrack: () => boolean;
};

export function initActiveBlockTracker({
	model,
	getScroll,
	onVisibleBlockChange,
	onScrollStateChange,
	shouldTrack,
}: ActiveBlockTrackerArgs): ActiveBlockTrackerApi {
	let scrollTrigger: ScrollTrigger | null = null;
	let lastReportedBlockId: number | null = null;
	let pendingAnimationFrameId: number | null = null;

	const cancelScheduled = () => {
		if (pendingAnimationFrameId != null) {
			cancelAnimationFrame(pendingAnimationFrameId);
			pendingAnimationFrameId = null;
		}
	};

	const updateActiveBlock = () => {
		pendingAnimationFrameId = null;
		if (!shouldTrack()) return;

		const scroll = getScroll();
		const max = ScrollTrigger.maxScroll(window);
		onScrollStateChange?.({
			maxPx: max,
			progress: max > 0 ? scroll / max : 0,
			scrollPx: scroll,
			viewportHeight: window.innerHeight,
		});

		const item = model.getCurrentItem(scroll);
		if (!item) return;

		if (item.blockId === lastReportedBlockId) return;

		lastReportedBlockId = item.blockId;
		onVisibleBlockChange(item.blockId);
	};

	const scheduleUpdate = () => {
		if (pendingAnimationFrameId != null) return;
		pendingAnimationFrameId = requestAnimationFrame(updateActiveBlock);
	};

	const rebuild = () => {
		scrollTrigger?.kill();
		cancelScheduled();

		scrollTrigger = ScrollTrigger.create({
			trigger: document.documentElement,
			start: 0,
			end: "max",
			invalidateOnRefresh: true,
			onUpdate: scheduleUpdate,
			onRefresh: scheduleUpdate,
		});

		updateActiveBlock();
	};

	const updateNow = () => {
		cancelScheduled();
		updateActiveBlock();
	};

	const rememberCurrentBlock = (blockId: number | null) => {
		lastReportedBlockId = blockId;
	};

	const cleanup = () => {
		scrollTrigger?.kill();
		scrollTrigger = null;
		lastReportedBlockId = null;
		cancelScheduled();
	};

	return { rebuild, cleanup, updateNow, rememberCurrentBlock };
}
