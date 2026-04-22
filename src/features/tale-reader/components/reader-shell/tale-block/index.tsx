"use client";

import clsx from "clsx";
import React, { useEffect } from "react";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import type { Block } from "~/server/db/data/tale-reader/types/blocks";
import TaleBlockDebug from "../../blocks/TaleBlockDebug";
import { TaleFragment } from "../../fragments";
import { TaleScrollIndicator } from "../../ui";

type TaleBlockProps = {
	block: Block;
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
	const fragmentsById = useReaderStore(
		(s) => s.tale.structure.indexMap.fragmentsById,
	);

	const bg = bgColors[block.globalIndex % bgColors.length];
	const isHorizontal = block.section.orientation === "horizontal";

	const blockFragments = block.fragmentIds
		.map((id) => fragmentsById[id])
		.filter((fragment): fragment is NonNullable<typeof fragment> => !!fragment);

	useEffect(() => {
		if (block.isLast) {
			console.log("[TaleBlock] structure mounted on last block", {
				blockId: block.id,
			});
			setIsStructureMounted(true);
		}
	}, [block.id, block.isLast, setIsStructureMounted]);

	return (
		<div
			id={String(block.id)}
			data-block-id={block.id}
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
