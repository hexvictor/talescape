"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	type ReaderViewportContextValue,
	ReaderViewportProvider,
} from "../../contexts/ReaderViewportContext";
import { useTaleAppStore } from "../../contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "../../contexts/TaleReaderStoreContext";
import { useChooseReaderPath } from "../../hooks/useChooseReaderPath";
import { usePrepareReaderLayout } from "../../hooks/usePrepareReaderLayout";
import { useReaderScrollEngine } from "../../hooks/useReaderScrollEngine";
import { useViewportSize } from "../../hooks/useViewportSize";
import { countReaderDiagnostic } from "../../services/readerDiagnostics";
import {
	resolveTaleBreakpoint,
	selectViewportBreakpointId,
} from "../../services/resolveTaleBreakpoint";
import { normalizeTaleBackgroundConfig } from "../../services/taleBackgroundSettings";
import { ReaderMeasurementLayer } from "../ReaderShell/ReaderMeasurementLayer/ReaderMeasurementLayer";
import { ReaderStage } from "../ReaderShell/ReaderStage/ReaderStage";
import { ReaderHub } from "../ReaderUi/ReaderHub/ReaderHub";
import { ReaderLoading } from "../ReaderUi/ReaderLoading/ReaderLoading";
import { ReaderMotionReadiness } from "../ReaderUi/ReaderLoading/ReaderMotionReadiness";
import { ReaderContents } from "../ReaderUi/ReaderNavigator/ReaderContents";
import { ReaderOverlay } from "../ReaderUi/ReaderOverlay/ReaderOverlay";

type TaleReaderViewportProps = {
	additionalOverlay?: ReactNode;
};

/**
 * Renders the reader camera as a full workspace or embedded live preview.
 *
 * @param props - Reader viewport props.
 * @param props.additionalOverlay - Optional route-owned overlay rendered over the viewport.
 * @returns Reader viewport and scroll spacer.
 *
 * @example
 * <TaleReaderViewport />
 */
export function TaleReaderViewport({
	additionalOverlay,
}: TaleReaderViewportProps = {}): React.JSX.Element {
	countReaderDiagnostic("TaleReaderViewport React render");

	const isLivePreview = useTaleAppStore((state) => state.derived.isLivePreview);
	const isStudio = useTaleAppStore((state) => state.derived.isStudio);
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
	const background = normalizeTaleBackgroundConfig(tale.backgroundConfig);
	const backgroundStyle = {
		"--tale-canvas-dark-color": background.dark.color,
		"--tale-canvas-dark-image": background.dark.imageUrl
			? `url(${JSON.stringify(background.dark.imageUrl)})`
			: "none",
		"--tale-canvas-light-color": background.light.color,
		"--tale-canvas-light-image": background.light.imageUrl
			? `url(${JSON.stringify(background.light.imageUrl)})`
			: "none",
	} as CSSProperties;
	const selectedBreakpointId = useTaleAppStore(
		(state) => state.runtime.breakpointId,
	);

	const viewport = useViewportSize({
		leftInsetRatio: contentsDocked ? 1 : 0,
		maximumLeftInsetPx: contentsDocked ? dockedContentsWidthPx : 0,
		maximumRightInsetPx: hubDocked ? dockedHubWidthPx : 0,
		rightInsetRatio: hubDocked ? 1 : 0,
		root: isLivePreview ? viewportRoot : null,
	});

	const measurementRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const choosePath = useChooseReaderPath();
	const resolvedTale = useMemo(() => {
		const breakpointId = isStudio
			? selectedBreakpointId
			: selectViewportBreakpointId(tale, viewport);
		return resolveTaleBreakpoint(tale, breakpointId);
	}, [isStudio, selectedBreakpointId, tale, viewport]);
	const layoutVariantKey = isStudio
		? `studio:${selectedBreakpointId ?? "base"}`
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
		requireScrollRoot: isLivePreview,
		scrollRoot: isLivePreview ? viewportRoot : null,
		stageRef,
		tale: resolvedTale,
		viewport,
	});

	useEffect(() => {
		if (isLivePreview) return;

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
	}, [isLivePreview]);

	const viewportContent = (
		<>
			<div
				data-reader-runtime-root="true"
				data-reader-component="TaleReaderViewport"
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

			{isLivePreview ? (
				<div
					ref={setViewportRoot}
					data-reader-component="TaleReaderViewport"
					data-reader-role="preview-scroll-root"
					className="tale-canvas scrollbar-none h-full overflow-hidden overscroll-contain outline-none"
					style={backgroundStyle}
				>
					<main
						data-reader-component="TaleReaderViewport"
						data-reader-role="reader-viewport"
						className="sticky top-0 isolate h-full overflow-hidden text-foreground"
					>
						{viewportContent}
					</main>
					<div
						aria-hidden="true"
						data-reader-component="TaleReaderViewport"
						data-reader-role="preview-scroll-spacer"
						style={{ height: 1 }}
					/>
				</div>
			) : (
				<>
					<main
						data-reader-component="TaleReaderViewport"
						data-reader-role="reader-viewport"
						className="tale-canvas fixed inset-0 isolate overflow-hidden text-foreground"
						style={backgroundStyle}
					>
						{viewportContent}
					</main>
					<div
						aria-hidden="true"
						data-reader-component="TaleReaderViewport"
						data-reader-role="scroll-spacer"
						style={{ height: 1 }}
					/>
				</>
			)}
		</ReaderViewportProvider>
	);
}
