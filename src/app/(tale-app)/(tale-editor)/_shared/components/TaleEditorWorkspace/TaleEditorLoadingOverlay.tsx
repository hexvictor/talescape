"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { useSmoothedLoadingProgress } from "~/app/(tale-app)/_shared/components/ReaderUi/ReaderLoading/useSmoothedLoadingProgress";
import type { LayoutPhase } from "~/app/(tale-app)/_shared/types";

const phaseText: Record<LayoutPhase, string> = {
	"loading-tale": "Fetching tale",
	"preparing-structure": "Preparing structure",
	"waiting-for-assets": "Loading images and fonts",
	"measuring-layout": "Measuring preview",
	"compiling-reader": "Building story flow",
	"restoring-progress": "Restoring preview position",
	"preparing-motion": "Preparing motion",
	ready: "Ready",
};

/**
 * Displays a full editor loading overlay until preview and graph are ready.
 *
 * @param props - Editor loading state.
 * @param props.onReady - Called once the editor has completed its initial load.
 * @param props.graphOpen - Whether the flow graph pane is visible and should be awaited.
 * @returns Editor loading overlay or null after readiness.
 *
 * @example
 * <TaleEditorLoadingOverlay graphOpen={graphOpen} />
 */
export function TaleEditorLoadingOverlay({
	graphOpen,
	onReady,
}: {
	graphOpen: boolean;
	onReady: () => void;
}): React.JSX.Element {
	const title = useTaleAppStore((state) => state.document.tale.title);
	const { phase, readerReady, targetProgress } = useTaleReaderStoreShallow(
		(state) => ({
			phase: state.engine.phase,
			readerReady: state.engine.ready,
			targetProgress: state.engine.progress,
		}),
	);
	const [graphReady, setGraphReady] = useState(!graphOpen);
	const progress = useSmoothedLoadingProgress(
		Math.min(100, targetProgress * 0.82 + (graphReady ? 18 : 0)),
	);
	const visible = !(readerReady && graphReady && progress >= 99.9);

	useEffect(() => {
		if (!graphOpen) {
			setGraphReady(true);
			return;
		}
		setGraphReady(false);
		let firstFrame = 0;
		let secondFrame = 0;
		firstFrame = window.requestAnimationFrame(() => {
			secondFrame = window.requestAnimationFrame(() => setGraphReady(true));
		});
		return () => {
			window.cancelAnimationFrame(firstFrame);
			window.cancelAnimationFrame(secondFrame);
		};
	}, [graphOpen]);

	useEffect(() => {
		if (visible) return;
		onReady();
	}, [onReady, visible]);

	return (
		<AnimatePresence>
			{visible ? (
				<motion.div
					key="editor-loading"
					data-reader-component="TaleEditorLoadingOverlay"
					data-reader-role="loading-overlay"
					className="fixed inset-0 z-[1200] flex items-center justify-center bg-background text-foreground"
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.32, ease: "easeOut" }}
				>
					<motion.div
						className="w-[min(25rem,calc(100vw-3rem))]"
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, ease: "easeOut" }}
					>
						<p className="truncate font-black text-primary text-xs uppercase tracking-[0.2em]">
							{title}
						</p>
						<h1 className="mt-4 font-black text-3xl">Opening editor</h1>
						<div className="mt-7 h-1 overflow-hidden rounded-full bg-foreground/10">
							<motion.div
								className="h-full origin-left rounded-full bg-primary"
								style={{ scaleX: progress / 100 }}
							/>
						</div>
						<div className="mt-4 flex items-center justify-between gap-4 text-sm">
							<p className="text-foreground/60">
								{readerReady
									? graphReady
										? "Ready"
										: "Preparing graph"
									: phaseText[phase]}
							</p>
							<p className="font-black text-primary tabular-nums">
								{Math.round(progress)}%
							</p>
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
