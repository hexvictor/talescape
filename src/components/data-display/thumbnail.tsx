"use client";

import { ImageIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import cn from "~/lib/utils/cn";

export type ThumbnailProps = Omit<ComponentProps<"div">, "children"> & {
	alt?: string;
	disabled?: boolean;
	fallback?: ReactNode;
	fit?: "contain" | "cover";
	selected?: boolean;
	src?: string | null;
};

export function Thumbnail({
	alt = "",
	className,
	disabled = false,
	fallback,
	fit = "cover",
	selected = false,
	src,
	...props
}: ThumbnailProps): React.JSX.Element {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);

	return (
		<div
			{...props}
			aria-disabled={disabled || undefined}
			data-disabled={disabled || undefined}
			data-selected={selected || undefined}
			data-slot="thumbnail"
			className={cn(
				"relative grid shrink-0 place-items-center overflow-hidden border border-foreground/15 bg-muted text-muted-foreground data-[selected]:border-primary data-[disabled]:opacity-45 data-[selected]:ring-2 data-[selected]:ring-primary/35",
				className,
			)}
		>
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
		</div>
	);
}
