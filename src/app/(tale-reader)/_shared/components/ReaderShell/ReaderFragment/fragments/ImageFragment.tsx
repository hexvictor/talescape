"use client";

import type { ResolvedTaleFragment } from "../../../../types";

/**
 * Renders a story image with authored fitting and a deterministic fallback.
 *
 * @param props - Image fragment props.
 * @param props.contentSized - Whether the parent block is content-sized.
 * @param props.fragment - Resolved image fragment.
 * @returns The image figure.
 */
export function ImageFragment({
	contentSized,
	fragment,
}: {
	contentSized: boolean;
	fragment: ResolvedTaleFragment;
}) {
	const fillsAuthoredFrame =
		fragment.style?.height !== undefined || fragment.style?.width !== undefined;

	return (
		<figure
			className={
				fillsAuthoredFrame
					? "h-full w-full overflow-hidden"
					: "overflow-hidden rounded-lg border border-white/14 bg-black/35 shadow-2xl"
			}
		>
			<img
				alt={fragment.alt ?? ""}
				className={
					fillsAuthoredFrame
						? "h-full w-full"
						: contentSized
							? "max-h-[68dvh] w-full object-contain"
							: "h-64 w-full object-cover md:h-80"
				}
				onError={(event) => {
					if (
						fragment.fallbackSrc &&
						event.currentTarget.dataset.fallbackApplied !== "true"
					) {
						event.currentTarget.dataset.fallbackApplied = "true";
						event.currentTarget.src = fragment.fallbackSrc;
					}
				}}
				src={fragment.src ?? undefined}
				style={{
					objectFit: fragment.style?.objectFit,
					objectPosition: fragment.style?.objectPosition,
				}}
			/>
			{fragment.caption ? (
				<figcaption className="border-white/10 border-t bg-black/54 px-4 py-3 text-white/62 text-xs">
					{fragment.caption}
				</figcaption>
			) : null}
		</figure>
	);
}
