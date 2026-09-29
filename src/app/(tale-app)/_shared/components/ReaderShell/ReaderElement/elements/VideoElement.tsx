"use client";

import type { ResolvedTaleElement } from "../../../../types";

export function VideoElement({ element }: { element: ResolvedTaleElement }) {
	return (
		<figure
			className="overflow-hidden border-2 border-foreground bg-black"
			data-reader-role="video-content"
		>
			<video
				controls
				playsInline
				preload="metadata"
				className="h-full w-full object-cover"
				poster={element.fallbackSrc ?? undefined}
				src={element.src ?? undefined}
			>
				<track kind="captions" />
			</video>
			{element.caption ? (
				<figcaption className="bg-background p-2 text-xs">
					{element.caption}
				</figcaption>
			) : null}
		</figure>
	);
}
