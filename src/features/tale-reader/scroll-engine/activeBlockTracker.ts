"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ScrollSnapModelApi } from "./scrollSnapModel";

type ActiveBlockTrackerApi = {
	rebuild: () => void;
	cleanup: () => void;
	updateNow: () => void;
};

type ActiveBlockTrackerArgs = {
	model: ScrollSnapModelApi;
	getScroll: () => number;
	scheduleActiveBlockUpdate: (blockId: number) => void;
	shouldTrack: () => boolean;
};

export function initActiveBlockTracker({
	model,
	getScroll,
	scheduleActiveBlockUpdate,
	shouldTrack,
}: ActiveBlockTrackerArgs): ActiveBlockTrackerApi {
	let tracker: ScrollTrigger | null = null;
	let lastBlockId: number | null = null;
	let rafId: number | null = null;

	const cancelScheduled = () => {
		if (rafId != null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	};

	const updateActiveBlock = () => {
		rafId = null;

		if (!shouldTrack()) return;

		const items = model.itemsRef.current;
		if (!items.length) return;

		const scroll = getScroll();
		const index = model.getIndexFromScroll(scroll);
		const item = items[index];
		if (!item) return;

		const blockId = Number(item.el.dataset.blockId ?? item.el.id);
		if (!Number.isFinite(blockId)) return;
		if (blockId === lastBlockId) return;

		lastBlockId = blockId;
		scheduleActiveBlockUpdate(blockId);
	};

	const scheduleUpdate = () => {
		if (rafId != null) return;
		rafId = requestAnimationFrame(updateActiveBlock);
	};

	const rebuild = () => {
		tracker?.kill();
		cancelScheduled();

		tracker = ScrollTrigger.create({
			trigger: document.documentElement,
			start: 0,
			end: () => ScrollTrigger.maxScroll(window),
			onUpdate: scheduleUpdate,
		});

		updateActiveBlock();
	};

	const updateNow = () => {
		cancelScheduled();
		updateActiveBlock();
	};

	const cleanup = () => {
		tracker?.kill();
		tracker = null;
		lastBlockId = null;
		cancelScheduled();
	};

	return { rebuild, cleanup, updateNow };
}
