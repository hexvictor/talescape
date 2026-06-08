"use client";

import { useReaderViewportController } from "../../../hooks/useReaderViewportController";
import { countReaderDiagnostic } from "../../../services/readerDiagnostics";
import { ReaderLoading } from "../../ReaderUi/ReaderLoading/ReaderLoading";
import { ReaderMotionReadiness } from "../../ReaderUi/ReaderLoading/ReaderMotionReadiness";
import { ReaderMeasurementLayer } from "../ReaderMeasurementLayer/ReaderMeasurementLayer";
import { ReaderStage } from "../ReaderStage/ReaderStage";
import { ReaderOverlayUi } from "./ReaderOverlayUi";

export function ReaderViewport() {
	countReaderDiagnostic("ReaderViewport React render");
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
			<main className="fixed inset-0 isolate overflow-hidden bg-[#0d0b08] text-[#fff8e8]">
				{compiled ? (
					<ReaderStage
						compiled={compiled}
						onChoosePath={choosePath}
						stageRef={stageRef}
						viewport={viewport}
					/>
				) : null}
				<ReaderOverlayUi />
				<ReaderMotionReadiness />
				<ReaderLoading />
			</main>
			<div
				aria-hidden="true"
				style={{ height: (compiled?.totalScroll ?? 1) + viewport.height }}
			/>
		</>
	);
}
