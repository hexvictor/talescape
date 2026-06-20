"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useTaleStore } from "../../../contexts/TaleStoreContext";
import { useReaderViewportController } from "../../../hooks/useReaderViewportController";
import { countReaderDiagnostic } from "../../../services/readerDiagnostics";
import { ReaderHub } from "../../ReaderUi/ReaderHub/ReaderHub";
import { ReaderLoading } from "../../ReaderUi/ReaderLoading/ReaderLoading";
import { ReaderMotionReadiness } from "../../ReaderUi/ReaderLoading/ReaderMotionReadiness";
import { ReaderMeasurementLayer } from "../ReaderMeasurementLayer/ReaderMeasurementLayer";
import { ReaderStage } from "../ReaderStage/ReaderStage";
import { ReaderOverlayUi } from "./ReaderOverlayUi";

type ReaderViewportProps = {
	additionalOverlay?: ReactNode;
	embedded?: boolean;
	showReaderUi?: boolean;
};

/**
 * Renders the reader camera either as the full page reader or inside an editor pane.
 *
 * @param props - Reader viewport props.
 * @param props.additionalOverlay - Optional route-owned overlay rendered over the viewport.
 * @param props.embedded - Whether the viewport is scoped to its own scroll container.
 * @param props.showReaderUi - Whether reader navigation/debug UI should be rendered.
 * @returns Reader viewport and scroll spacer.
 *
 * @example
 * <ReaderViewport embedded showReaderUi={false} />
 */
export function ReaderViewport({
	additionalOverlay,
	embedded = false,
	showReaderUi = true,
}: ReaderViewportProps = {}): React.JSX.Element {
	countReaderDiagnostic("ReaderViewport React render");
	const [viewportRoot, setViewportRoot] = useState<HTMLDivElement | null>(null);
	const readerHubVisible = useTaleStore(
		(state) =>
			showReaderUi &&
			(state.ui.visibilityMode === "all" ||
				state.ui.visibilityMode === "navigation"),
	);
	const readerHubOpen = useTaleStore(
		(state) =>
			showReaderUi &&
			state.hub.open &&
			(state.ui.visibilityMode === "all" ||
				state.ui.visibilityMode === "navigation"),
	);
	const {
		choosePath,
		compiled,
		hubDocked,
		measurementBlockIds,
		measurementRef,
		stageRef,
		tale,
		viewport,
	} = useReaderViewportController({ embedded, viewportRoot });

	const viewportContent = (
		<>
			<div
				data-reader-runtime-root="true"
				data-reader-component="ReaderViewport"
				data-reader-role="camera-viewport"
				className="absolute inset-y-0 left-0 overflow-hidden transition-[right] duration-300 ease-out"
				style={{
					right: readerHubOpen && hubDocked ? "min(28rem, 42vw)" : 0,
				}}
			>
				<div className="absolute inset-0">
					{compiled ? (
						<ReaderStage
							compiled={compiled}
							onChoosePath={choosePath}
							stageRef={stageRef}
							viewport={viewport}
						/>
					) : null}
				</div>
				{showReaderUi ? <ReaderOverlayUi /> : null}
				{additionalOverlay}
			</div>
			{readerHubVisible ? <ReaderHub /> : null}
			<ReaderMotionReadiness />
			<ReaderLoading />
		</>
	);

	return (
		<>
			{measurementBlockIds.length > 0 ? (
				<ReaderMeasurementLayer
					blockIds={measurementBlockIds}
					rootRef={measurementRef}
					tale={tale}
					viewport={viewport}
				/>
			) : null}
			{embedded ? (
				<div
					ref={setViewportRoot}
					data-reader-component="ReaderViewport"
					data-reader-role="embedded-scroll-root"
					className="scrollbar-none h-full overflow-y-auto bg-[#0d0b08] outline-none"
				>
					<main
						data-reader-component="ReaderViewport"
						data-reader-role="reader-viewport"
						className="sticky top-0 isolate h-full overflow-hidden bg-[#0d0b08] text-[#fff8e8]"
					>
						{viewportContent}
					</main>
					<div
						aria-hidden="true"
						data-reader-component="ReaderViewport"
						data-reader-role="embedded-scroll-spacer"
						style={{ height: compiled?.totalScroll ?? 1 }}
					/>
				</div>
			) : (
				<>
					<main
						data-reader-component="ReaderViewport"
						data-reader-role="reader-viewport"
						className="fixed inset-0 isolate overflow-hidden bg-[#0d0b08] text-[#fff8e8]"
					>
						{viewportContent}
					</main>
					<div
						aria-hidden="true"
						data-reader-component="ReaderViewport"
						data-reader-role="scroll-spacer"
						style={{ height: (compiled?.totalScroll ?? 1) + viewport.height }}
					/>
				</>
			)}
		</>
	);
}
