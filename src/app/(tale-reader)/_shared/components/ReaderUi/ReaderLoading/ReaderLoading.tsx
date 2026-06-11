"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useReaderLoadingState } from "../../../hooks/store/useReaderRuntimeSelectors";
import type { LayoutPhase } from "../../../types";
import { useSmoothedLoadingProgress } from "./useSmoothedLoadingProgress";

const phaseText: Record<LayoutPhase, string> = {
	"loading-tale": "Fetching tale",
	"preparing-structure": "Preparing structure",
	"waiting-for-assets": "Loading images and fonts",
	"measuring-layout": "Measuring pages",
	"compiling-reader": "Building story flow",
	"restoring-progress": "Restoring reading position",
	"preparing-motion": "Preparing motion",
	ready: "Ready",
};

/**
 * Renders the Motion-powered reader loading overlay.
 *
 * @returns Loading progress for the active tale until the engine is ready.
 *
 * @example
 * <ReaderLoading />
 */
export function ReaderLoading(): React.JSX.Element {
	const { phase, ready, setPhase, setReady, setStatus, targetProgress, title } =
		useReaderLoadingState();
	const progress = useSmoothedLoadingProgress(targetProgress);
	const visible = !ready;

	useEffect(() => {
		if (phase !== "preparing-motion" || progress < 99.9) return;
		setPhase("ready");
		setReady(true);
		setStatus("ready");
	}, [phase, progress, setPhase, setReady, setStatus]);

	return (
		<AnimatePresence>
			{visible ? (
				<motion.div
					key="reader-loading"
					data-reader-component="ReaderLoading"
					data-reader-role="loading-overlay"
					className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0b08] text-[#fff8e8]"
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.42, ease: "easeOut" }}
				>
					<motion.div
						className="w-[min(24rem,calc(100vw-3rem))]"
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, ease: "easeOut" }}
					>
						<p className="truncate font-black text-[#d9b56f] text-xs uppercase tracking-[0.2em]">
							{title}
						</p>
						<h1 className="mt-4 font-black text-3xl">Opening tale</h1>
						<div className="mt-7 h-1 overflow-hidden rounded-full bg-white/10">
							<motion.div
								className="h-full origin-left rounded-full bg-[#d9b56f]"
								style={{ scaleX: progress / 100 }}
							/>
						</div>
						<div className="mt-4 flex items-center justify-between gap-4 text-sm">
							<p className="text-white/60">{phaseText[phase]}</p>
							<p className="font-black text-[#d9b56f] tabular-nums">
								{Math.round(progress)}%
							</p>
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
