"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReaderViewportProvider } from "../../../contexts/ReaderViewportContext";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";
import { useChooseReaderPath } from "../../../hooks/useChooseReaderPath";
import { usePrepareReaderLayout } from "../../../hooks/usePrepareReaderLayout";
import { useReaderScrollEngine } from "../../../hooks/useReaderScrollEngine";
import { useViewportSize } from "../../../hooks/useViewportSize";
import { countReaderDiagnostic } from "../../../services/readerDiagnostics";
import { ReaderHub } from "../../ReaderUi/ReaderHub/ReaderHub";
import { ReaderLoading } from "../../ReaderUi/ReaderLoading/ReaderLoading";
import { ReaderMotionReadiness } from "../../ReaderUi/ReaderLoading/ReaderMotionReadiness";
import { ReaderOverlay } from "../../ReaderUi/ReaderOverlay/ReaderOverlay";
import { ReaderMeasurementLayer } from "../ReaderMeasurementLayer/ReaderMeasurementLayer";
import { ReaderStage } from "../ReaderStage/ReaderStage";

type ReaderViewportProps = { additionalOverlay?: ReactNode };

/**
 * Renders the reader camera either as the full page reader or inside an editor pane.
 *
 * @param props - Reader viewport props.
 * @param props.additionalOverlay - Optional route-owned overlay rendered over the viewport.
 * @returns Reader viewport and scroll spacer.
 *
 * @example
 * <ReaderViewport />
 */
export function ReaderViewport({
	additionalOverlay,
}: ReaderViewportProps = {}): React.JSX.Element {
	countReaderDiagnostic("ReaderViewport React render");
	const isPreviewing = useTaleAppStore((state) => state.derived.isPreviewing);
	const [viewportRoot, setViewportRoot] = useState<HTMLDivElement | null>(null);
	const {
		compiled,
		hubDocked: readerHubDocked,
		hubOpen,
		measurementBlockIds,
		setPhase,
		setProgress,
		showsNavigation,
	} = useTaleReaderStoreShallow((state) => ({
		compiled: state.reader.compiled,
		hubDocked: state.derived.hubDocked,
		hubOpen: state.derived.isHubOpen,
		measurementBlockIds: state.reader.measurementBlockIds,
		setPhase: state.engine.setPhase,
		setProgress: state.engine.setProgress,
		showsNavigation: state.derived.showsNavigation,
	}));
	const tale = useTaleAppStore((state) => state.document.tale);
	const hubDocked = !isPreviewing && readerHubDocked;
	const readerHubOpen = !isPreviewing && hubOpen;
	const readerHubVisible = !isPreviewing && showsNavigation;
	const viewport = useViewportSize({
		maximumRightInsetPx: hubDocked ? 448 : 0,
		rightInsetRatio: hubDocked ? 0.42 : 0,
		root: isPreviewing ? viewportRoot : null,
	});
	const measurementRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const choosePath = useChooseReaderPath();

	usePrepareReaderLayout(measurementRef, viewport);

	const finishRestoring = useCallback(() => {
		setProgress(97);
		setPhase("preparing-motion");
	}, [setPhase, setProgress]);

	useReaderScrollEngine({
		compiled,
		onReady: finishRestoring,
		requireScrollRoot: isPreviewing,
		scrollRoot: isPreviewing ? viewportRoot : null,
		stageRef,
		viewport,
	});

	useEffect(() => {
		if (isPreviewing) return;
		document.documentElement.classList.add("scrollbar-none");
		document.body.classList.add("scrollbar-none");
		return () => {
			document.documentElement.classList.remove("scrollbar-none");
			document.body.classList.remove("scrollbar-none");
		};
	}, [isPreviewing]);

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
						<ReaderViewportProvider
							value={{
								compiled,
								onChoosePath: choosePath,
								stageRef,
								viewport,
							}}
						>
							<ReaderStage />
						</ReaderViewportProvider>
					) : null}
				</div>
				<ReaderOverlay />
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
			{isPreviewing ? (
				<div
					ref={setViewportRoot}
					data-reader-component="ReaderViewport"
					data-reader-role="preview-scroll-root"
					className="scrollbar-none h-full overflow-y-auto bg-background outline-none"
				>
					<main
						data-reader-component="ReaderViewport"
						data-reader-role="reader-viewport"
						className="sticky top-0 isolate h-full overflow-hidden bg-background text-foreground"
					>
						{viewportContent}
					</main>
					<div
						aria-hidden="true"
						data-reader-component="ReaderViewport"
						data-reader-role="preview-scroll-spacer"
						style={{ height: compiled?.totalScroll ?? 1 }}
					/>
				</div>
			) : (
				<>
					<main
						data-reader-component="ReaderViewport"
						data-reader-role="reader-viewport"
						className="fixed inset-0 isolate overflow-hidden bg-background text-foreground"
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
