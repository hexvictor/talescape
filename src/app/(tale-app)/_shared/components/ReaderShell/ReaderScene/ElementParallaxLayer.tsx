"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ElementParallax } from "../../../types";

export const defaultElementParallax: ElementParallax = {
	enabled: true,
	source: "both",
	scrollBasis: "timeline",
	scrollX: 0,
	scrollY: -0.15,
	mouseX: 16,
	mouseY: 12,
	scale: 1.15,
};

export function getElementParallaxStyle(
	config?: ElementParallax,
	active = true,
): CSSProperties {
	if (!config?.enabled || !active) return {};
	const scroll = config.source !== "mouse";
	const mouse = config.source !== "scroll";
	const finite = (value: number, fallback = 0) =>
		Number.isFinite(value) ? value : fallback;
	const scale = Math.max(1, finite(config.scale, 1));
	const limit = (scale - 1) * 50;
	const scrollX =
		config.scrollBasis === "timeline"
			? "--reader-scroll-offset"
			: "--reader-camera-offset-x";
	const scrollY =
		config.scrollBasis === "timeline"
			? "--reader-scroll-offset"
			: "--reader-camera-offset-y";
	const travel = (
		scrollVariable: string,
		depth: number,
		pointer: string,
		pixels: number,
	) => {
		const value = `calc(var(${scrollVariable}, 0px) * ${scroll ? finite(depth) : 0} + var(${pointer}, 0) * ${mouse ? finite(pixels) : 0}px)`;
		// Unscaled foreground graphics need travel too; overscan bounds scaled backgrounds.
		return scale === 1 ? value : `clamp(-${limit}%, ${value}, ${limit}%)`;
	};
	return {
		translate: `${travel(scrollX, config.scrollX, "--reader-pointer-x", config.mouseX)} ${travel(scrollY, config.scrollY, "--reader-pointer-y", config.mouseY)}`,
		scale,
		willChange: "translate",
	};
}

/** Separate from registered animation targets so ambient and parallax motion compose. */
export function ElementParallaxLayer({
	config,
	active = true,
	children,
}: {
	config?: ElementParallax;
	active?: boolean;
	children: ReactNode;
}) {
	return (
		<div
			data-reader-component="ElementParallaxLayer"
			data-reader-role="parallax-layer"
			className="reader-parallax-layer h-full w-full"
			style={getElementParallaxStyle(config, active)}
		>
			{children}
		</div>
	);
}
