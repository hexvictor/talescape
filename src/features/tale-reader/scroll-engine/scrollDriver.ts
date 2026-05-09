"use client";

import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

type InitArgs = {
	wrapper: string;
	content: string;
};

export function createScrollDriver(
	// biome-ignore lint/suspicious/noExplicitAny:
	smootherRef: RefObject<any>,
) {
	const getWindowScroll = () => {
		const scrollTrigger = ScrollTrigger as typeof ScrollTrigger & {
			scroll: () => number;
		};

		return scrollTrigger.scroll();
	};

	const setWindowScroll = (value: number) => {
		const scrollTrigger = ScrollTrigger as typeof ScrollTrigger & {
			scroll: (value: number) => void;
		};

		scrollTrigger.scroll(value);
	};

	const getScroll = () => {
		const smoother = smootherRef.current;
		if (smoother && typeof smoother.scrollTop === "function") {
			return smoother.scrollTop();
		}
		return getWindowScroll();
	};

	const setScroll = (value: number) => {
		const smoother = smootherRef.current;
		if (smoother && typeof smoother.scrollTop === "function") {
			smoother.scrollTop(value);
			return;
		}
		setWindowScroll(value);
	};

	const scrollTo = (
		targetScroll: number,
		opts: {
			duration: number;
			ease: gsap.EaseString;
			onDone?: () => void;
		},
	) => {
		const startScroll = getScroll();
		const max = ScrollTrigger.maxScroll(window);
		const clampedTarget = Math.max(0, Math.min(max, targetScroll));

		if (Math.abs(clampedTarget - startScroll) < 2) {
			opts.onDone?.();
			return null;
		}

		const proxy = { value: startScroll };

		return gsap.to(proxy, {
			value: clampedTarget,
			duration: opts.duration,
			ease: opts.ease,
			overwrite: "auto",
			onUpdate: () => setScroll(proxy.value),
			onComplete: opts.onDone,
		});
	};

	const init = ({ wrapper, content }: InitArgs) => {
		const smoother = ScrollSmoother.create({
			wrapper,
			content,
			smooth: 1,
			smoothTouch: 0.25,
			effects: false,
			normalizeScroll: {
				allowNestedScroll: true,
				allowClicks: true,
			},
		});

		smootherRef.current = smoother;
	};

	const setPaused = (paused: boolean) => {
		const smoother = smootherRef.current;
		if (smoother && typeof smoother.paused === "function") {
			smoother.paused(paused);
		}
	};

	const cleanup = () => {
		const smoother = smootherRef.current;
		if (smoother && typeof smoother.kill === "function") {
			smoother.kill();
		}
		smootherRef.current = null;
	};

	return {
		init,
		cleanup,
		getScroll,
		setScroll,
		scrollTo,
		setPaused,
	};
}
