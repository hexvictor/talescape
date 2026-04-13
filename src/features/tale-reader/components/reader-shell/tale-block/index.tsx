"use client";

import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import type { BlockMeta } from "~/features/tale-reader/types/taleStructure";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import { TaleFragment } from "../../fragments";
import TaleBlockDebug from "../../blocks/TaleBlockDebug";
import { TaleScrollIndicator } from "../../ui";

type TaleBlockProps = {
	block: BlockMeta;
};

const bgColors = [
	"bg-red-900/30",
	"bg-green-900/30",
	"bg-blue-900/30",
	"bg-yellow-900/30",
	"bg-purple-900/30",
	"bg-pink-900/30",
];

export function TaleBlockComponent({ block }: TaleBlockProps) {
	const setIsStructureMounted = useReaderStore((s) => s.setIsStructureMounted);
	const scrollRebuild = useReaderStore((s) => s.scrollApi?.rebuild);
	const fragmentsById = useReaderStore(
		(s) => s.tale.structure.indexMap.fragmentsById,
	);

	const bg = bgColors[block.globalIndex % bgColors.length];
	const isHorizontal = block.section.orientation === "horizontal";
	const contentRef = useRef<HTMLDivElement | null>(null);
	const rebuildTimerRef = useRef<number | null>(null);

	const blockFragments = block.fragmentIds
		.map((id) => fragmentsById[id])
		.filter((fragment): fragment is NonNullable<typeof fragment> => !!fragment);

	useEffect(() => {
		if (block.isLast) {
			setIsStructureMounted(true);
		}
	}, [block.isLast, setIsStructureMounted]);

	useEffect(() => {
		const root = contentRef.current;
		if (!root) return;

		const images = Array.from(root.querySelectorAll("img"));
		if (!images.length) {
			scrollRebuild?.();
			return;
		}

		let finished = 0;
		let cancelled = false;

		const scheduleRebuild = () => {
			if (rebuildTimerRef.current != null) {
				window.clearTimeout(rebuildTimerRef.current);
			}

			rebuildTimerRef.current = window.setTimeout(() => {
				requestAnimationFrame(() => {
					scrollRebuild?.();
				});
			}, 80);
		};

		const handleDone = () => {
			if (cancelled) return;

			finished += 1;

			if (finished >= images.length) {
				scheduleRebuild();
			}
		};

		const cleanups: Array<() => void> = [];

		for (const img of images) {
			if (img.complete) {
				handleDone();
				continue;
			}

			const onLoad = () => handleDone();
			const onError = () => handleDone();

			img.addEventListener("load", onLoad);
			img.addEventListener("error", onError);

			cleanups.push(() => {
				img.removeEventListener("load", onLoad);
				img.removeEventListener("error", onError);
			});
		}

		return () => {
			cancelled = true;

			if (rebuildTimerRef.current != null) {
				window.clearTimeout(rebuildTimerRef.current);
				rebuildTimerRef.current = null;
			}

			cleanups.forEach((fn) => fn());
		};
	}, [block.id, scrollRebuild]);

	return (
		<div
			id={String(block.id)}
			data-block-id={block.id}
			data-anchor-id={block.anchorId}
			data-snap={block.isSnap}
			data-direction={block.section.direction}
			data-orientation={block.section.orientation}
			data-block-section-id={block.sectionId}
			data-block-entry-id={block.entryId}
			data-block-page-id={block.pageId ?? undefined}
			data-block-part-id={block.partId ?? undefined}
			data-block-global-index={block.globalIndex}
			className={clsx(
				"relative overflow-hidden",
				isHorizontal
					? "flex h-screen shrink-0 items-center justify-center"
					: "flex min-h-screen min-w-screen items-center justify-center",
				bg,
			)}
		>
			<TaleBlockDebug block={block} />

			<div
				className={clsx(
					"relative z-10 flex items-center justify-center",
					isHorizontal
						? "h-full shrink-0 px-4 py-4 sm:px-6 sm:py-6"
						: "min-h-screen w-full px-4 py-10 sm:px-8 sm:py-14",
				)}
			>
				<div
					ref={contentRef}
					className={clsx(
						"flex items-center justify-center",
						isHorizontal
							? "h-full shrink-0 flex-col gap-4"
							: "w-full max-w-5xl flex-col gap-6",
					)}
				>
					{blockFragments.map((fragment) => (
						<TaleFragment
							key={fragment.id}
							fragment={fragment}
							orientation={block.section.orientation}
						/>
					))}
				</div>
			</div>

			{block.isFirst ? <TaleScrollIndicator /> : null}
		</div>
	);
}

const TaleBlock = React.memo(TaleBlockComponent);

export default TaleBlock;
