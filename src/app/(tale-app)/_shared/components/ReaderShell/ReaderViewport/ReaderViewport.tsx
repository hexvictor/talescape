"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	type ReaderViewportContextValue,
	ReaderViewportProvider,
} from "../../../contexts/ReaderViewportContext";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";
import { useChooseReaderPath } from "../../../hooks/useChooseReaderPath";
import { usePrepareReaderLayout } from "../../../hooks/usePrepareReaderLayout";
import { useReaderScrollEngine } from "../../../hooks/useReaderScrollEngine";
import { useViewportSize } from "../../../hooks/useViewportSize";
import { countReaderDiagnostic } from "../../../services/readerDiagnostics";
import {
	resolveTaleBreakpoint,
	selectViewportBreakpointId,
} from "../../../services/resolveTaleBreakpoint";
import { ReaderHub } from "../../ReaderUi/ReaderHub/ReaderHub";
import { ReaderLoading } from "../../ReaderUi/ReaderLoading/ReaderLoading";
import { ReaderMotionReadiness } from "../../ReaderUi/ReaderLoading/ReaderMotionReadiness";
import { ReaderContents } from "../../ReaderUi/ReaderNavigator/ReaderContents";
import { ReaderOverlay } from "../../ReaderUi/ReaderOverlay/ReaderOverlay";
import { ReaderMeasurementLayer } from "../ReaderMeasurementLayer/ReaderMeasurementLayer";
import { ReaderStage } from "../ReaderStage/ReaderStage";

type ReaderViewportProps = {
	additionalOverlay?: ReactNode;
};

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
	const isEditor = useTaleAppStore((state) => state.derived.isEditor);
	const [viewportRoot, setViewportRoot] = useState<HTMLDivElement | null>(null);

	const {
		compiled,
		contentsDocked,
		dockedContentsWidthPx,
		dockedHubWidthPx,
		hubDocked,
		readerContentsOpen,
		readerHubOpen,
		measurementBlockIds,
		setPhase,
		setProgress,
		showsNavigation,
	} = useTaleReaderStoreShallow((state) => ({
		compiled: state.reader.compiled,
		contentsDocked: state.derived.contentsDocked,
		dockedContentsWidthPx: state.derived.dockedContentsWidthPx,
		dockedHubWidthPx: state.derived.dockedHubWidthPx,
		hubDocked: state.derived.hubDocked,
		readerContentsOpen: state.derived.readerContentsOpen,
		readerHubOpen: state.derived.isHubOpen,
		measurementBlockIds: state.reader.measurementBlockIds,
		setPhase: state.engine.setPhase,
		setProgress: state.engine.setProgress,
		showsNavigation: state.derived.showsNavigation,
	}));

	const tale = useTaleAppStore((state) => state.document.tale);
	const selectedBreakpointId = useTaleAppStore(
		(state) => state.runtime.breakpointId,
	);

	const viewport = useViewportSize({
		leftInsetRatio: contentsDocked ? 1 : 0,
		maximumLeftInsetPx: contentsDocked ? dockedContentsWidthPx : 0,
		maximumRightInsetPx: hubDocked ? dockedHubWidthPx : 0,
		rightInsetRatio: hubDocked ? 1 : 0,
		root: isPreviewing ? viewportRoot : null,
	});

	const measurementRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const choosePath = useChooseReaderPath();
	const resolvedTale = useMemo(() => {
		const breakpointId = isEditor
			? selectedBreakpointId
			: selectViewportBreakpointId(tale, viewport);
		return resolveTaleBreakpoint(tale, breakpointId);
	}, [isEditor, selectedBreakpointId, tale, viewport]);
	const layoutVariantKey = isEditor
		? `editor:${selectedBreakpointId ?? "base"}`
		: `reader:${selectViewportBreakpointId(tale, viewport) ?? "base"}`;

	const viewportContextValue = useMemo<ReaderViewportContextValue>(
		() => ({
			compiled,
			onChoosePath: choosePath,
			stageRef,
			viewport,
		}),
		[choosePath, compiled, viewport],
	);

	usePrepareReaderLayout(
		measurementRef,
		resolvedTale,
		layoutVariantKey,
		viewport,
	);

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
		document.documentElement.classList.add("overflow-hidden");
		document.body.classList.add("scrollbar-none");
		document.body.classList.add("overflow-hidden");

		return () => {
			document.documentElement.classList.remove("scrollbar-none");
			document.documentElement.classList.remove("overflow-hidden");
			document.body.classList.remove("scrollbar-none");
			document.body.classList.remove("overflow-hidden");
		};
	}, [isPreviewing]);

	const viewportContent = (
		<>
			<div
				data-reader-runtime-root="true"
				data-reader-component="ReaderViewport"
				data-reader-role="camera-viewport"
				className="absolute inset-y-0 left-0 overflow-hidden transition-[left,right] duration-180 ease-out"
				style={{
					left:
						readerContentsOpen && contentsDocked
							? `${dockedContentsWidthPx}px`
							: 0,
					right: readerHubOpen && hubDocked ? `${dockedHubWidthPx}px` : 0,
				}}
			>
				<div className="absolute inset-0">
					{compiled ? <ReaderStage /> : null}
				</div>
				<ReaderOverlay />
				{additionalOverlay}
			</div>
			{showsNavigation ? <ReaderHub /> : null}
			{showsNavigation ? <ReaderContents /> : null}

			<ReaderMotionReadiness />
			<ReaderLoading />
		</>
	);

	return (
		<ReaderViewportProvider value={viewportContextValue}>
			{measurementBlockIds.length > 0 ? (
				<ReaderMeasurementLayer
					blockIds={measurementBlockIds}
					rootRef={measurementRef}
					tale={resolvedTale}
					viewport={viewport}
				/>
			) : null}

			{isPreviewing ? (
				<div
					ref={setViewportRoot}
					data-reader-component="ReaderViewport"
					data-reader-role="preview-scroll-root"
					className="scrollbar-none h-full overflow-hidden overscroll-contain bg-background outline-none"
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
						style={{ height: 1 }}
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
						style={{ height: 1 }}
					/>
				</>
			)}
		</ReaderViewportProvider>
	);
}
