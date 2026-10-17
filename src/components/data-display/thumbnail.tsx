"use client";

import { ImageIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Decorations } from "~/components/decorations";
import type {
	Decoration,
	MediaDecorationPreset,
} from "~/components/decorations/types";
import { Shape, type ShapeOptions } from "~/components/ui/shape";
import cn from "~/lib/utils/cn";

export type ThumbnailProps = ComponentProps<"div"> &
	ShapeOptions & {
		alt?: string;
		disabled?: boolean;
		decorations?: MediaDecorationPreset | Decoration[];
		fallback?: ReactNode;
		fit?: "contain" | "cover";
		preset?: MediaDecorationPreset;
		selected?: boolean;
		src?: string | null;
	};

export function Thumbnail({
	alt = "",
	className,
	disabled = false,
	decorations,
	fallback,
	fit = "cover",
	preset,
	selected = false,
	src,
	children,
	shapes,
	borderWidth,
	borderColor,
	shadow,
	shadowColor,
	shadowOffset,
	...props
}: ThumbnailProps): React.JSX.Element {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const content = (
		<div
			data-reader-component="Thumbnail"
			data-reader-role="thumbnail-surface"
			{...props}
			aria-disabled={disabled || undefined}
			data-disabled={disabled || undefined}
			data-decoration-layer={decorations || preset ? "overlay" : undefined}
			data-selected={selected || undefined}
			data-slot="thumbnail"
			className={cn(
				"relative grid shrink-0 place-items-center overflow-hidden border border-foreground/15 bg-muted text-muted-foreground data-[selected]:border-primary data-[disabled]:opacity-45 data-[selected]:ring-2 data-[selected]:ring-primary/35",
				(decorations || preset) && "ts-decoration-host isolate",
				className,
			)}
		>
			{decorations || preset ? (
				<Decorations
					layer="overlay"
					items={Array.isArray(decorations) ? decorations : undefined}
					preset={typeof decorations === "string" ? decorations : preset}
				/>
			) : null}
			{src && failedSrc !== src ? (
				<img
					alt={alt}
					className={cn(
						"h-full w-full",
						fit === "cover" ? "object-cover" : "object-contain",
					)}
					loading="lazy"
					src={src}
					onError={() => setFailedSrc(src)}
				/>
			) : (
				(fallback ?? <ImageIcon aria-hidden="true" className="size-4" />)
			)}
			{children}
		</div>
	);
	return shapes !== undefined ? (
		<Shape
			shapes={shapes}
			borderWidth={borderWidth ?? 1}
			borderColor={borderColor}
			shadow={shadow}
			shadowColor={shadowColor}
			shadowOffset={shadowOffset}
			style={{ width: "fit-content", maxWidth: "100%" }}
		>
			{content}
		</Shape>
	) : (
		content
	);
}
