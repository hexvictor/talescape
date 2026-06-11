"use client";

import { useReaderStore } from "../../../contexts/ReaderStoreContext";
import { useReaderViewportController } from "../../../hooks/useReaderViewportController";
import { countReaderDiagnostic } from "../../../services/readerDiagnostics";
import { ReaderHub } from "../../ReaderUi/ReaderHub/ReaderHub";
import { ReaderLoading } from "../../ReaderUi/ReaderLoading/ReaderLoading";
import { ReaderMotionReadiness } from "../../ReaderUi/ReaderLoading/ReaderMotionReadiness";
import { ReaderMeasurementLayer } from "../ReaderMeasurementLayer/ReaderMeasurementLayer";
import { ReaderStage } from "../ReaderStage/ReaderStage";
import { ReaderOverlayUi } from "./ReaderOverlayUi";

export function ReaderViewport(): React.JSX.Element {
	countReaderDiagnostic("ReaderViewport React render");
	const readerHubVisible = useReaderStore(
		(state) =>
			state.ui.visibilityMode === "all" ||
			state.ui.visibilityMode === "navigation",
	);
	const readerHubOpen = useReaderStore(
		(state) =>
			state.hub.open &&
			(state.ui.visibilityMode === "all" ||
				state.ui.visibilityMode === "navigation"),
	);
	const {
		choosePath,
		compiled,
		measurementBlockIds,
		measurementRef,
		stageRef,
		tale,
		viewport,
	} = useReaderViewportController();

	return (
		<>
			{measurementBlockIds.length > 0 ? (
				<ReaderMeasurementLayer
					blockIds={measurementBlockIds}
					rootRef={measurementRef}
					tale={tale}
				/>
			) : null}
			<main
				data-reader-component="ReaderViewport"
				data-reader-role="reader-viewport"
				className="fixed inset-0 isolate overflow-hidden bg-[#0d0b08] text-[#fff8e8]"
			>
				<div
					data-reader-runtime-root="true"
					data-reader-component="ReaderViewport"
					data-reader-role="camera-viewport"
					className="absolute inset-y-0 left-0 overflow-hidden transition-[right] duration-300 ease-out"
					style={{
						right: readerHubOpen ? "min(28rem, 42vw)" : 0,
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
					<ReaderOverlayUi />
				</div>
				{readerHubVisible ? <ReaderHub /> : null}
				<ReaderMotionReadiness />
				<ReaderLoading />
			</main>
			<div
				aria-hidden="true"
				data-reader-component="ReaderViewport"
				data-reader-role="scroll-spacer"
				style={{ height: (compiled?.totalScroll ?? 1) + viewport.height }}
			/>
		</>
	);
}
