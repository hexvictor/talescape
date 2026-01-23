"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PinnedMeta } from "./usePinnedSections";

type Item = { el: HTMLElement; start: number; end: number; snap: boolean };

type Args = {
  pinnedMeta: Map<HTMLElement, PinnedMeta>;
  getPinnedST: (section: HTMLElement) => ScrollTrigger | null;
  getScroll: () => number;
};

export function useSnapItems({ pinnedMeta, getPinnedST }: Args) {
  const itemsRef = useRef<Item[]>([]);

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

    const st = getPinnedST(pinnedSection);
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

  const rebuildItems = () => {
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
      } satisfies Item;
    });

    mapped.sort((a, b) => a.start - b.start);

    const unique: Item[] = [];
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

  return { itemsRef, rebuildItems };
}
