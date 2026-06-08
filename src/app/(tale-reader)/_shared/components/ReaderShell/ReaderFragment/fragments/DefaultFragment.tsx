"use client";

import clsx from "clsx";
import type { ResolvedTaleFragment } from "../../../../types";

export function DefaultFragment({
	fragment,
	index,
}: {
	fragment: ResolvedTaleFragment;
	index: number;
}) {
	return (
		<div
			className={clsx(
				"max-w-3xl rounded-lg border p-5 text-base leading-8 shadow-xl backdrop-blur-md md:text-lg",
				index % 2 === 0 ? "justify-self-start" : "justify-self-end",
				"border-white/12 bg-black/36",
			)}
			style={{
				background: fragment.style?.backgroundCss,
				border: fragment.style?.border,
				borderRadius: fragment.style?.borderRadius,
				boxShadow: fragment.style?.boxShadow,
				color: fragment.style?.color,
				fontSize: fragment.style?.fontSize,
				fontWeight: fragment.style?.fontWeight,
				lineHeight: fragment.style?.lineHeight,
				textAlign: fragment.style?.textAlign,
			}}
		>
			<p>{fragment.text}</p>
		</div>
	);
}
