"use client";

import { Boxes, ImageIcon, Music2, Type } from "lucide-react";
import type { ResolvedTaleElement } from "~/app/(tale-app)/_shared/types";
import { Thumbnail } from "~/components/data-display/thumbnail";

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
	if (element.type === "image" && element.src) {
		return (
			<Thumbnail
				alt=""
				className={`h-11 w-14 ${className ?? ""}`}
				src={element.src}
			/>
		);
	}

	if (element.type === "text" || element.type === "quote") {
		const preview = element.text?.trim() || element.label || element.type;
		return (
			<Thumbnail
				className={`h-11 w-14 p-1 text-[8px] leading-3 ${className ?? ""}`}
				fallback={
					<span className="max-h-9 overflow-hidden break-words text-center">
						{preview}
					</span>
				}
			/>
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
		<Thumbnail
			className={`h-11 w-14 ${className ?? ""}`}
			fallback={<Icon size={16} />}
		/>
	);
}
