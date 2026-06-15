"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { useReaderStageState } from "../../../hooks/store/useReaderRuntimeSelectors";
import { countReaderDiagnostic } from "../../../services/readerDiagnostics";
import type { CompiledReader, TalePath, ViewportSize } from "../../../types";
import { ReaderBlock } from "../ReaderBlock/ReaderBlock";

export function ReaderStage({
	compiled,
	onChoosePath,
	stageRef,
	viewport,
}: {
	compiled: CompiledReader;
	onChoosePath: (path: TalePath) => void;
	stageRef: RefObject<HTMLDivElement | null>;
	viewport: ViewportSize;
}) {
	const { renderedBlockIds, renderRevision, scrollApi } = useReaderStageState();
	const requestedIds = new Set(renderedBlockIds);
	const renderedAnchors =
		renderedBlockIds.length === 0
			? compiled.anchors.slice(0, 3)
			: compiled.anchors.filter((anchor) => requestedIds.has(anchor.block.id));
	countReaderDiagnostic("ReaderStage React render", {
		mountedBlocks: renderedAnchors.length,
	});

	useEffect(() => {
		if (renderRevision === 0) return;
		scrollApi?.repaint();
	}, [renderRevision, scrollApi]);

	return (
		<div
			ref={stageRef}
			data-reader-component="ReaderStage"
			data-reader-role="camera-stage"
			className="absolute inset-0"
			style={{
				transform: `translate3d(${viewport.width / 2}px, ${viewport.height / 2}px, 0)`,
				willChange: "transform",
			}}
		>
			{renderedAnchors.map((anchor) => (
				<ReaderBlock
					key={anchor.block.id}
					anchor={anchor}
					onChoosePath={onChoosePath}
				/>
			))}
		</div>
	);
}
