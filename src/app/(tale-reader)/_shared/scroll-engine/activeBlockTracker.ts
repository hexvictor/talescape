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
	shouldTrack: () => boolean;
};

export function initActiveBlockTracker({
	model,
	getScroll,
	onVisibleBlockChange,
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

		const snapItems = model.itemsRef.current;
		if (!snapItems.length) return;

		const scroll = getScroll();
		const index = model.getIndexFromScroll(scroll);
		const item = snapItems[index];
		if (!item) return;

		const blockId = Number(item.el.dataset.blockId ?? item.el.id);
		if (!Number.isFinite(blockId)) return;
		if (blockId === lastReportedBlockId) return;

		lastReportedBlockId = blockId;
		onVisibleBlockChange(blockId);
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
