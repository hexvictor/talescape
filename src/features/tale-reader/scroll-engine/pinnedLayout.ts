"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type Axis = "x" | "y";
export type DirX = "right" | "left";
export type DirY = "down" | "up";

export type PinnedMeta = {
	section: HTMLElement;
	track: HTMLElement;
	axis: Axis;
	direction: DirX | DirY;
	getTravel: () => number;
	getFromTo: () => { fromVal: number; toVal: number };
};

export type PinnedLayoutApi = {
	pinnedMeta: Map<HTMLElement, PinnedMeta>;
	pinnedSTBySection: Map<HTMLElement, ScrollTrigger>;
	rebuild: () => void;
	cleanup: () => void;
};

export function initPinnedLayout(): PinnedLayoutApi {
	const pinnedMeta = new Map<HTMLElement, PinnedMeta>();
	const pinnedSTBySection = new Map<HTMLElement, ScrollTrigger>();
	const tweensBySection = new Map<HTMLElement, gsap.core.Tween>();

	const cleanupSection = (section: HTMLElement) => {
		const tween = tweensBySection.get(section);
		if (tween) {
			tween.scrollTrigger?.kill();
			tween.kill();
			tweensBySection.delete(section);
		}

		const meta = pinnedMeta.get(section);
		if (meta) {
			gsap.set(meta.track, { clearProps: "x,y,transform" });
		}

		pinnedMeta.delete(section);
		pinnedSTBySection.delete(section);
	};

	const buildSection = (section: HTMLElement) => {
		const track = section.querySelector<HTMLElement>(".scroll-track");
		if (!track) return;

		gsap.set(track, { clearProps: "x,y,transform" });

		const axis =
			section.dataset.orientation === "vertical" ? "y" : ("x" as Axis);

		const direction =
			section.dataset.direction ??
			(axis === "x" ? ("right" as DirX) : ("down" as DirY));

		const getTravel = () =>
			axis === "x"
				? Math.max(0, track.scrollWidth - window.innerWidth)
				: Math.max(0, track.scrollHeight - window.innerHeight);

		const getFromTo = () => {
			const travel = getTravel();

			if (axis === "x") {
				const fromVal = direction === "right" ? 0 : -travel;
				const toVal = direction === "right" ? -travel : 0;
				return { fromVal, toVal };
			}

			const fromVal = direction === "down" ? 0 : -travel;
			const toVal = direction === "down" ? -travel : 0;
			return { fromVal, toVal };
		};

		const tween = gsap.fromTo(
			track,
			{ [axis]: getFromTo().fromVal } as gsap.TweenVars,
			{
				[axis]: getFromTo().toVal,
				ease: "none",
				scrollTrigger: {
					trigger: section,
					start: "top top",
					end: () => `+=${getTravel()}`,
					pin: true,
					scrub: 1,
					invalidateOnRefresh: true,
					anticipatePin: 1,
				},
			} as gsap.TweenVars,
		);

		const st = tween.scrollTrigger ?? null;
		if (st) {
			pinnedSTBySection.set(section, st);
		}

		tweensBySection.set(section, tween);

		pinnedMeta.set(section, {
			section,
			track,
			axis,
			direction: direction as DirX | DirY,
			getTravel,
			getFromTo,
		});
	};

	const rebuild = () => {
		const currentSections = gsap.utils.toArray<HTMLElement>(".pinned-section");

		for (const section of Array.from(tweensBySection.keys())) {
			cleanupSection(section);
		}

		for (const section of currentSections) {
			buildSection(section);
		}
	};

	const cleanup = () => {
		for (const section of Array.from(tweensBySection.keys())) {
			cleanupSection(section);
		}

		pinnedMeta.clear();
		pinnedSTBySection.clear();
		tweensBySection.clear();
	};

	rebuild();

	return {
		pinnedMeta,
		pinnedSTBySection,
		rebuild,
		cleanup,
	};
}
