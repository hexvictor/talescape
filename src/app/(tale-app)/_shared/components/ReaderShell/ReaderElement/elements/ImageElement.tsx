"use client";

import type { ResolvedTaleElement } from "../../../../types";
import { getSharedReaderStyle } from "../../ReaderScene/readerStyleProperties";

/**
 * Renders a story image with authored fitting and a deterministic fallback.
 *
 * @param props - Image element props.
 * @param props.contentSized - Whether the parent block is content-sized.
 * @param props.element - Resolved image element.
 * @returns The image figure.
 */
export function ImageElement({
	contentSized,
	element,
}: {
	contentSized: boolean;
	element: ResolvedTaleElement;
}): React.JSX.Element {
	const fillsAuthoredFrame =
		element.style?.height !== undefined || element.style?.width !== undefined;
	const imageStyle = element.imageStyle ?? {};

	return (
		<figure
			data-reader-component="ImageElement"
			data-reader-role="image-content"
			data-reader-element-id={element.id}
			className={
				fillsAuthoredFrame
					? "h-full w-full overflow-hidden"
					: "overflow-hidden rounded-lg border border-foreground/14 bg-background/35 shadow-2xl"
			}
		>
			<img
				alt={element.alt ?? ""}
				className={
					fillsAuthoredFrame
						? "h-full w-full"
						: contentSized
							? "max-h-[68dvh] w-full object-contain"
							: "h-64 w-full object-cover md:h-80"
				}
				onError={(event) => {
					if (
						element.fallbackSrc &&
						event.currentTarget.dataset.fallbackApplied !== "true"
					) {
						event.currentTarget.dataset.fallbackApplied = "true";
						event.currentTarget.src = element.fallbackSrc;
					}
				}}
				src={element.src ?? undefined}
				style={{
					...getSharedReaderStyle(imageStyle),
					objectFit: imageStyle.objectFit ?? element.style?.objectFit,
					objectPosition:
						imageStyle.objectPosition ?? element.style?.objectPosition,
				}}
			/>
			{element.caption ? (
				<figcaption className="border-foreground/10 border-t bg-background/54 px-4 py-3 text-foreground/62 text-xs">
					{element.caption}
				</figcaption>
			) : null}
		</figure>
	);
}
