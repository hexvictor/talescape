"use client";

import { Boxes, ImageIcon, Music2, Type } from "lucide-react";
import type { ResolvedTaleElement } from "~/app/(tale-app)/_shared/types";
import cn from "~/lib/utils/cn";

/**
 * Renders a compact visual hint for an Element row.
 */
export function ElementThumbnail({
	className,
	element,
}: {
	className?: string;
	element: ResolvedTaleElement;
}): React.JSX.Element {
	const sharedClassName = cn(
		"grid h-11 w-14 shrink-0 place-items-center overflow-hidden border border-foreground/14 bg-foreground/[0.04] text-foreground/54",
		className,
	);

	if (element.type === "image" && element.src) {
		return (
			<img
				alt=""
				className={cn(sharedClassName, "object-cover")}
				loading="lazy"
				src={element.src}
			/>
		);
	}

	if (element.type === "text" || element.type === "quote") {
		const preview = element.text?.trim() || element.label || element.type;
		return (
			<div className={cn(sharedClassName, "p-1 text-[8px] leading-3")}>
				<span className="max-h-9 overflow-hidden break-words text-center">
					{preview}
				</span>
			</div>
		);
	}

	const Icon =
		element.type === "image"
			? ImageIcon
			: element.type === "audio" || element.type === "soundCue"
				? Music2
				: element.type === "choiceButton" || element.type === "codexEntry"
					? Boxes
					: Type;

	return (
		<div className={sharedClassName}>
			<Icon size={16} />
		</div>
	);
}
