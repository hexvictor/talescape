"use client";

import type { RefObject } from "react";
import type { Anchor, Tale } from "../../../types";
import { NodeRenderer } from "../ReaderBlock/NodeRenderer";

export function ReaderMeasurementLayer({
	blockIds,
	rootRef,
	tale,
}: {
	blockIds: string[];
	rootRef: RefObject<HTMLDivElement | null>;
	tale: Tale;
}): React.JSX.Element {
	return (
		<div
			ref={rootRef}
			aria-hidden="true"
			data-reader-component="ReaderMeasurementLayer"
			data-reader-role="measurement-layer"
			className="pointer-events-none fixed top-0 left-[-100000px] opacity-0"
		>
			{blockIds.flatMap((blockId) => {
				const anchor = getMeasurementAnchor(tale, blockId);
				if (!anchor || anchor.block.size.mode !== "content") return [];
				return [
					<article
						key={anchor.block.id}
						data-reader-measure-block={anchor.block.id}
						data-reader-component="ReaderMeasurementLayer"
						data-reader-role="measurement-block"
						className="relative flex w-fit items-center justify-center overflow-visible p-4 md:p-8"
						style={{ background: anchor.block.resolved.background }}
					>
						<NodeRenderer
							anchor={anchor}
							nodeId={anchor.block.rootNodeId}
							onChoosePath={() => {}}
						/>
					</article>,
				];
			})}
		</div>
	);
}

function getMeasurementAnchor(tale: Tale, blockId: string): Anchor | null {
	const block = tale.indexMap.blocksById[blockId];
	const branch = block && tale.indexMap.branchesById[block.branchId];
	const entry = block && tale.indexMap.entriesById[block.entryId];
	const page = block && tale.indexMap.pagesById[block.pageId];
	const part = block && tale.indexMap.partsById[block.partId];
	if (!block || !branch || !entry || !page || !part) return null;
	return {
		block,
		branch,
		entry,
		height: 0,
		id: block.id,
		page,
		part,
		point: { x: 0, y: 0 },
		readingPathPoints: [],
		scroll: 0,
		viewportOffset: { x: 0, y: 0 },
		width: 0,
	};
}
