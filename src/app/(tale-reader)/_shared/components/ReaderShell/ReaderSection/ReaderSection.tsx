"use client";

import clsx from "clsx";
import React, { useMemo } from "react";
import { useReaderStore } from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import ReaderBlock from "../ReaderBlock";

type ReaderSectionProps = {
	sectionId: number;
};

function ReaderSectionComponent({ sectionId }: ReaderSectionProps) {
	const debugMode = useReaderStore((s) => s.ui.isDebugEnabled);
	const sectionsById = useReaderStore(
		(s) => s.tale.data.content.indexMap.sectionsById,
	);
	const blocksById = useReaderStore(
		(s) => s.tale.data.content.indexMap.blocksById,
	);

	const section = sectionsById[sectionId];

	const sectionBlocks = useMemo(() => {
		if (!section) return [];
		return section.children.blockIds
			.map((id) => blocksById[id])
			.filter((block): block is NonNullable<typeof block> => !!block);
	}, [section, blocksById]);

	if (!section) return null;
	if (!sectionBlocks.length) return null;

	const isVertical = section.orientation === "vertical";
	const isReverseDirection =
		section.direction === "left" || section.direction === "up";

	return (
		<section
			id={`section-${section.id}`}
			data-section-id={section.id}
			data-direction={section.direction}
			data-orientation={section.orientation}
			className={clsx(
				"pinned-section relative h-screen overflow-hidden",
				debugMode && "outline-2 outline-emerald-400/70",
			)}
		>
			<div
				className={clsx(
					isVertical
						? [
								"scroll-track flex",
								isReverseDirection ? "flex-col-reverse" : "flex-col",
							]
						: [
								"scroll-track flex w-max items-center",
								isReverseDirection && "flex-row-reverse",
							],
					debugMode && "outline-2 outline-red-400/70",
				)}
			>
				{sectionBlocks.map((block) => (
					<ReaderBlock key={block.id} block={block} />
				))}
			</div>
		</section>
	);
}

const ReaderSection = React.memo(ReaderSectionComponent);

export default ReaderSection;
