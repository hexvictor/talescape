"use client";

import clsx from "clsx";
import React, { useMemo } from "react";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import ReaderBlock from "../ReaderBlock";

type ReaderSectionProps = {
	sectionId: number;
};

function ReaderSectionComponent({ sectionId }: ReaderSectionProps) {
	const debugMode = useReaderStore((s) => s.debugMode);
	const sectionsById = useReaderStore(
		(s) => s.tale.structure.indexMap.sectionsById,
	);
	const blocksById = useReaderStore(
		(s) => s.tale.structure.indexMap.blocksById,
	);

	const section = sectionsById[sectionId];

	const sectionBlocks = useMemo(() => {
		if (!section) return [];
		return section.blockIds
			.map((id) => blocksById[id])
			.filter((block): block is NonNullable<typeof block> => !!block);
	}, [section, blocksById]);

	if (!section) return null;
	if (!sectionBlocks.length) return null;

	const isVertical = section.orientation === "vertical";

	return (
		<section
			id={`section-${section.id}`}
			data-section-id={section.id}
			data-direction={section.direction}
			data-orientation={section.orientation}
			className={clsx(
				"pinned-section relative h-screen overflow-hidden",
				debugMode && "outline outline-2 outline-emerald-400/70",
			)}
		>
			<div
				className={clsx(
					isVertical
						? "scroll-track flex flex-col"
						: "scroll-track flex w-max items-center",
					debugMode && "outline outline-2 outline-red-400/70",
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
