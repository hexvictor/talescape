"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PinnedMeta } from "./pinnedLayout";

export type SnapItem = {
  el: HTMLElement;
  start: number;
  end: number;
  snap: boolean;
};

export type SnapModelApi = {
  itemsRef: React.RefObject<SnapItem[]>;
  rebuild: () => void;
  getIndexFromScroll: (scroll: number) => number;
  cleanup: () => void;
};

type Args = {
  pinnedMeta: Map<HTMLElement, PinnedMeta>;
  pinnedSTBySection: Map<HTMLElement, ScrollTrigger>;
};

export function createSnapModel({
  pinnedMeta,
  pinnedSTBySection,
}: Args): SnapModelApi {
  const itemsRef = { current: [] as SnapItem[] };

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

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

    const p = clamp((target - fromVal) / denom, 0, 1);
    return start + p * (end - start);
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
    return { start: startScroll, end: Math.max(startScroll, endScroll) };
  };

  const getRangeForEl = (el: HTMLElement) => {
    const pinnedSection = el.closest(".pinned-section") as HTMLElement | null;
    if (pinnedSection) {
      const range = getPinnedRange(el, pinnedSection);
      if (range) return range;
    }
    return { start: getNormalFlowStart(el), end: getNormalFlowEnd(el) };
  };

  const rebuild = () => {
    const ITEM_SELECTOR = "[data-snap='true'], [data-snap='false']";
    const els = gsap.utils.toArray<HTMLElement>(ITEM_SELECTOR);
    const max = ScrollTrigger.maxScroll(window);

    const mapped = els.map((el) => {
      const { start, end } = getRangeForEl(el);
      const snap = el.dataset.snap === "true";
      return {
        el,
        start: clamp(start, 0, max),
        end: clamp(end, 0, max),
        snap,
      } satisfies SnapItem;
    });

    mapped.sort((a, b) => a.start - b.start);

    const unique: SnapItem[] = [];
    for (const it of mapped) {
      const last = unique[unique.length - 1];
      if (!last || Math.abs(it.start - last.start) > 1) unique.push(it);
      else {
        last.end = Math.max(last.end, it.end);
        last.snap = last.snap || it.snap;
      }
    }

    itemsRef.current = unique;
  };

  const getIndexFromScroll = (scroll: number) => {
    const items = itemsRef.current;
    const EPS = ScrollTrigger.isTouch ? 60 : 20;

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (scroll >= it.start - EPS && scroll <= it.end + EPS) return i;
    }

    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < items.length; i++) {
      const d = Math.abs(items[i].start - scroll);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  };

  const cleanup = () => {
    itemsRef.current = [];
  };

  return { itemsRef: itemsRef as any, rebuild, getIndexFromScroll, cleanup };
}
