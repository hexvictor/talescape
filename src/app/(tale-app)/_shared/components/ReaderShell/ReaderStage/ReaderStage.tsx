"use client";

import { useEffect } from "react";
import { useReaderViewportContext } from "../../../contexts/ReaderViewportContext";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";
import { countReaderDiagnostic } from "../../../services/readerDiagnostics";
import { TaleBlock } from "../TaleBlock/TaleBlock";

/**
 * Renders the active block window inside the reader camera stage.
 *
 * @returns Positioned reader blocks for the current render window.
 *
 * @example
 * <ReaderStage />
 */
export function ReaderStage(): React.JSX.Element {
	const { compiled, stageRef, viewport } = useReaderViewportContext();
	const { renderedBlockIds, renderRevision, scrollApi } =
		useTaleReaderStoreShallow((state) => ({
			renderedBlockIds: state.scroll.renderedBlockIds,
			renderRevision: state.scroll.renderRevision,
			scrollApi: state.scroll.api,
		}));
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
				<TaleBlock key={anchor.block.id} anchor={anchor} />
			))}
		</div>
	);
}
