"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PinnedScrollMeta } from "./pinnedScrollLayout";

export type ScrollSnapItem = {
	blockId: number;
	el: HTMLElement;
	index: number;
	nextBlockId: number | null;
	nextSnapBlockId: number | null;
	previousBlockId: number | null;
	previousSnapBlockId: number | null;
	start: number;
	end: number;
	snap: boolean;
};

export type ScrollSnapRange = {
	start: number;
	end: number;
};

export type ScrollSnapModelApi = {
	itemsRef: { current: ScrollSnapItem[] };
	itemsByBlockIdRef: { current: Map<number, ScrollSnapItem> };
	snapItemsRef: { current: ScrollSnapItem[] };
	snapItemsByBlockIdRef: { current: Map<number, ScrollSnapItem> };
	rebuild: () => void;
	getIndexFromScroll: (scroll: number) => number;
	getAdjacentItem: (
		direction: ScrollDirection,
		currentScroll: number,
	) => ScrollSnapItem | null;
	getItemAtIndex: (index: number) => ScrollSnapItem | null;
	getItemByBlockId: (blockId: number) => ScrollSnapItem | null;
	getCurrentItem: (scroll: number) => ScrollSnapItem | null;
	getBestVisibleSnapItem: (
		direction: ScrollDirection,
		currentScroll: number,
	) => ScrollSnapItem | null;
	getNearbySnapItem: (
		direction: ScrollDirection,
		currentScroll: number,
		epsilon: number,
	) => ScrollSnapItem | null;
	getRangeForElement: (el: HTMLElement) => ScrollSnapRange;
	cleanup: () => void;
};

export type ScrollDirection = 1 | -1;

type Args = {
	pinnedMeta: Map<HTMLElement, PinnedScrollMeta>;
	pinnedSTBySection: Map<HTMLElement, ScrollTrigger>;
};

type VisibleSnapCandidate = {
	item: ScrollSnapItem;
	overlap: number;
};

const MIN_VISIBLE_SNAP_OVERLAP_RATIO = 0.45;
const MIN_DIRECTIONAL_SNAP_OVERLAP_RATIO = 0.22;
const MIN_DIRECTIONAL_SNAP_VISIBLE_PX = 48;

export function createScrollSnapModel({
	pinnedMeta,
	pinnedSTBySection,
}: Args): ScrollSnapModelApi {
	const itemsRef = { current: [] as ScrollSnapItem[] };
	const itemsByBlockIdRef = { current: new Map<number, ScrollSnapItem>() };
	const snapItemsRef = { current: [] as ScrollSnapItem[] };
	const snapItemsByBlockIdRef = {
		current: new Map<number, ScrollSnapItem>(),
	};

	const clamp = (value: number, min: number, max: number) =>
		Math.max(min, Math.min(max, value));

	const offsetWithin = (
		el: HTMLElement,
		ancestor: HTMLElement,
		axis: "x" | "y",
	) => {
		let cur: HTMLElement | null = el;
		let acc = 0;

		while (cur && cur !== ancestor) {
			acc += axis === "x" ? cur.offsetLeft : cur.offsetTop;
			cur = cur.offsetParent as HTMLElement | null;
		}

		return cur === ancestor ? acc : 0;
	};

	const getNormalFlowStart = (el: HTMLElement) => {
		const temp = ScrollTrigger.create({
			trigger: el,
			start: "top top",
			end: "+=1",
		});

		const pos = temp.start as number;
		temp.kill();
		return pos;
	};

	const getNormalFlowEnd = (el: HTMLElement) => {
		const start = getNormalFlowStart(el);
		const extra = Math.max(0, el.offsetHeight - window.innerHeight);
		return start + extra;
	};

	const mapPinnedOffsetToScroll = (
		pinnedSection: HTMLElement,
		el: HTMLElement,
		offsetAlongTrack: number,
	) => {
		const meta = pinnedMeta.get(pinnedSection);
		if (!meta) return null;

		const st = pinnedSTBySection.get(pinnedSection) ?? null;
		if (!st) return null;

		const start = st.start as number;
		const end = st.end as number;

		const travel = meta.getTravel();
		if (!travel) return start;

		if (!el.closest(".scroll-track")) return start;

		const target = -offsetAlongTrack;
		const { fromVal, toVal } = meta.getFromTo();
		const denom = toVal - fromVal;
		if (!denom) return start;

		const progress = clamp((target - fromVal) / denom, 0, 1);
		return start + progress * (end - start);
	};

	const getPinnedRange = (el: HTMLElement, pinnedSection: HTMLElement) => {
		const meta = pinnedMeta.get(pinnedSection);
		if (!meta) return null;

		const track = meta.track;
		if (!el.closest(".scroll-track")) return null;

		const offsetStart = offsetWithin(el, track, meta.axis);

		const viewportSize =
			meta.axis === "x" ? window.innerWidth : window.innerHeight;
		const elSize = meta.axis === "x" ? el.offsetWidth : el.offsetHeight;
		const extra = Math.max(0, elSize - viewportSize);
		const offsetEnd = offsetStart + extra;

		const startScroll = mapPinnedOffsetToScroll(pinnedSection, el, offsetStart);
		const endScroll = mapPinnedOffsetToScroll(pinnedSection, el, offsetEnd);

		if (startScroll == null || endScroll == null) return null;

		return {
			start: startScroll,
			end: Math.max(startScroll, endScroll),
		};
	};

	const getRangeForElement = (el: HTMLElement): ScrollSnapRange => {
		const pinnedSection = el.closest(".pinned-section") as HTMLElement | null;

		if (pinnedSection) {
			const range = getPinnedRange(el, pinnedSection);
			if (range) return range;
		}

		return {
			start: getNormalFlowStart(el),
			end: getNormalFlowEnd(el),
		};
	};

	const getBlockId = (el: HTMLElement) => {
		const blockId = Number(el.dataset.blockId ?? el.id);
		return Number.isFinite(blockId) ? blockId : null;
	};

	const buildIndexes = (items: ScrollSnapItem[]) => {
		const byBlockId = new Map<number, ScrollSnapItem>();
		const snapItems = items.filter((item) => item.snap);
		const snapByBlockId = new Map<number, ScrollSnapItem>();

		for (let index = 0; index < items.length; index++) {
			const item = items[index];
			if (!item) continue;

			item.index = index;
			item.previousBlockId = items[index - 1]?.blockId ?? null;
			item.nextBlockId = items[index + 1]?.blockId ?? null;

			byBlockId.set(item.blockId, item);
		}

		for (let index = 0; index < snapItems.length; index++) {
			const item = snapItems[index];
			if (!item) continue;

			item.previousSnapBlockId = snapItems[index - 1]?.blockId ?? null;
			item.nextSnapBlockId = snapItems[index + 1]?.blockId ?? null;
			snapByBlockId.set(item.blockId, item);
		}

		itemsByBlockIdRef.current = byBlockId;
		snapItemsRef.current = snapItems;
		snapItemsByBlockIdRef.current = snapByBlockId;
	};

	const rebuild = () => {
		const itemSelector = "[data-snap='true'], [data-snap='false']";
		const els = gsap.utils.toArray<HTMLElement>(itemSelector);
		const max = ScrollTrigger.maxScroll(window);

		const mapped = els.flatMap((el) => {
			const blockId = getBlockId(el);
			if (blockId == null) return [];

			const { start, end } = getRangeForElement(el);

			return [
				{
					blockId,
					el,
					index: 0,
					nextBlockId: null,
					nextSnapBlockId: null,
					previousBlockId: null,
					previousSnapBlockId: null,
					start: clamp(start, 0, max),
					end: clamp(end, 0, max),
					snap: el.dataset.snap === "true",
				} satisfies ScrollSnapItem,
			];
		});

		mapped.sort((a, b) => a.start - b.start);

		const unique: ScrollSnapItem[] = [];

		for (const item of mapped) {
			const last = unique[unique.length - 1];

			if (!last || Math.abs(item.start - last.start) > 1) {
				unique.push(item);
			} else {
				last.end = Math.max(last.end, item.end);
				last.snap = last.snap || item.snap;
			}
		}

		itemsRef.current = unique;
		buildIndexes(unique);
	};

	const getIndexFromScroll = (scroll: number) => {
		const items = itemsRef.current;
		const epsilon = ScrollTrigger.isTouch ? 60 : 20;

		for (let i = items.length - 1; i >= 0; i--) {
			const item = items[i];
			if (!item) continue;

			if (scroll >= item.start - epsilon && scroll <= item.end + epsilon) {
				return i;
			}
		}

		let best = 0;
		let bestDist = Number.POSITIVE_INFINITY;

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (!item) continue;

			const dist = Math.abs(item.start - scroll);
			if (dist < bestDist) {
				bestDist = dist;
				best = i;
			}
		}

		return best;
	};

	const getItemAtIndex = (index: number) => itemsRef.current[index] ?? null;

	const getItemByBlockId = (blockId: number) =>
		itemsByBlockIdRef.current.get(blockId) ?? null;

	const getCurrentItem = (scroll: number) =>
		getItemAtIndex(getIndexFromScroll(scroll));

	const getAdjacentItem = (
		direction: ScrollDirection,
		currentScroll: number,
	) => {
		const samePositionTolerance = 2;
		const items = itemsRef.current;

		if (direction > 0) {
			return (
				items.find(
					(item) => item.start > currentScroll + samePositionTolerance,
				) ?? null
			);
		}

		for (let index = items.length - 1; index >= 0; index--) {
			const item = items[index];
			if (!item) continue;
			if (item.end < currentScroll - samePositionTolerance) return item;
		}

		return null;
	};

	const getNearbySnapItem = (
		direction: ScrollDirection,
		currentScroll: number,
		epsilon: number,
	) => {
		const items = itemsRef.current;
		const samePositionTolerance = 2;

		if (direction > 0) {
			for (const item of snapItemsRef.current) {
				if (currentScroll <= item.start + samePositionTolerance) continue;
				if (currentScroll > item.start + epsilon) continue;

				return item;
			}

			const target = items.find(
				(item) => item.start > currentScroll + samePositionTolerance,
			);
			if (!target?.snap) return null;

			const previous = items[target.index - 1];
			const triggerDistance = Math.max(0, target.start - currentScroll);
			const isNearSnapBoundary =
				triggerDistance <= epsilon ||
				(!!previous && currentScroll >= previous.end - epsilon);

			return isNearSnapBoundary ? target : null;
		}

		for (let index = snapItemsRef.current.length - 1; index >= 0; index--) {
			const item = snapItemsRef.current[index];
			if (!item) continue;
			if (currentScroll >= item.end - samePositionTolerance) continue;
			if (currentScroll < item.end - epsilon) continue;

			return item;
		}

		for (let index = items.length - 1; index >= 0; index--) {
			const target = items[index];
			if (!target) continue;
			if (target.end >= currentScroll - samePositionTolerance) continue;
			if (!target.snap) return null;

			const next = items[target.index + 1];
			const triggerDistance = Math.max(0, currentScroll - target.end);
			const isNearSnapBoundary =
				triggerDistance <= epsilon ||
				(!!next && currentScroll <= next.start + epsilon);

			return isNearSnapBoundary ? target : null;
		}

		return null;
	};

	const getVisibleCandidate = (
		item: ScrollSnapItem,
	): VisibleSnapCandidate | null => {
		const rect = item.el.getBoundingClientRect();
		const overlap = Math.max(
			0,
			Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
		);

		if (overlap <= 0) return null;

		return {
			item,
			overlap,
		};
	};

	const targetWouldContinueDirection = (
		item: ScrollSnapItem,
		direction: ScrollDirection,
		currentScroll: number,
	) => {
		const samePositionTolerance = 2;
		const targetScroll = direction > 0 ? item.start : item.end;

		return direction > 0
			? targetScroll >= currentScroll - samePositionTolerance
			: targetScroll <= currentScroll + samePositionTolerance;
	};

	/**
	 * Chooses a visible snap after free wheel or touch scrolling settles.
	 *
	 * Burst input is allowed to move through snap blocks first. When it
	 * stops, the reader settles to the dominant snap block unless the next snap in
	 * the user's last direction is visible enough to feel intentional. A dominant
	 * non-snap block intentionally means "stay here."
	 */
	const getBestVisibleSnapItem = (
		direction: ScrollDirection,
		currentScroll: number,
	) => {
		let largestVisibleOverlap = 0;
		let dominantCandidate: VisibleSnapCandidate | null = null;
		let directionalSnapCandidate: VisibleSnapCandidate | null = null;

		for (const item of itemsRef.current) {
			const candidate = getVisibleCandidate(item);
			if (!candidate) continue;

			largestVisibleOverlap = Math.max(
				largestVisibleOverlap,
				candidate.overlap,
			);

			if (!targetWouldContinueDirection(item, direction, currentScroll)) {
				continue;
			}

			if (!dominantCandidate || candidate.overlap > dominantCandidate.overlap) {
				dominantCandidate = candidate;
			}

			if (
				item.snap &&
				targetWouldContinueDirection(item, direction, currentScroll) &&
				(!directionalSnapCandidate ||
					candidate.overlap > directionalSnapCandidate.overlap)
			) {
				directionalSnapCandidate = candidate;
			}
		}

		if (!dominantCandidate) return null;

		const directionalMinOverlap = Math.max(
			dominantCandidate.overlap * MIN_DIRECTIONAL_SNAP_OVERLAP_RATIO,
			MIN_DIRECTIONAL_SNAP_VISIBLE_PX,
		);

		if (
			directionalSnapCandidate &&
			directionalSnapCandidate.overlap >= directionalMinOverlap
		) {
			return directionalSnapCandidate.item;
		}

		if (!dominantCandidate.item.snap) return null;

		const minOverlap = largestVisibleOverlap * MIN_VISIBLE_SNAP_OVERLAP_RATIO;
		if (dominantCandidate.overlap < minOverlap) return null;

		return dominantCandidate.item;
	};

	const cleanup = () => {
		itemsRef.current = [];
		itemsByBlockIdRef.current = new Map();
		snapItemsRef.current = [];
		snapItemsByBlockIdRef.current = new Map();
	};

	return {
		itemsRef,
		itemsByBlockIdRef,
		snapItemsRef,
		snapItemsByBlockIdRef,
		rebuild,
		getIndexFromScroll,
		getAdjacentItem,
		getItemAtIndex,
		getItemByBlockId,
		getCurrentItem,
		getBestVisibleSnapItem,
		getNearbySnapItem,
		getRangeForElement,
		cleanup,
	};
}
