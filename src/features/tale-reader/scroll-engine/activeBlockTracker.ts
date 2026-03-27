"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SnapModelApi } from "./snapModel";

type ActiveBlockTrackerApi = {
  rebuild: () => void;
  cleanup: () => void;
};

type ActiveBlockTrackerArgs = {
  model: SnapModelApi;
  getScroll: () => number;
  onActiveBlockChanged: (blockId: number) => void;
};

export function initActiveBlockTracker({
  model,
  getScroll,
  onActiveBlockChanged,
}: ActiveBlockTrackerArgs): ActiveBlockTrackerApi {
  let tracker: ScrollTrigger | null = null;
  let lastBlockId: number | null = null;

  const updateActiveBlock = () => {
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
    onActiveBlockChanged(blockId);
  };

  const rebuild = () => {
    tracker?.kill();

    tracker = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: updateActiveBlock,
    });

    updateActiveBlock();
  };

  const cleanup = () => {
    tracker?.kill();
    tracker = null;
    lastBlockId = null;
  };

  return {
    rebuild,
    cleanup,
  };
}