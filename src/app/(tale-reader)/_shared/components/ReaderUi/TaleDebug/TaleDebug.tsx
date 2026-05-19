"use client";

import clsx from "clsx";
import { Bug, Eye, EyeOff, Maximize2, Minimize2, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useReaderStore } from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import { DebugTabList } from "./DebugPrimitives";
import { DebugPeekBadges, DebugSummary, SummaryBadges } from "./DebugSummary";
import { NavigationDebugPanel } from "./NavigationDebugPanel";
import { ProgressDebugPanel } from "./ProgressDebugPanel";
import { ScrollDebugPanel } from "./ScrollDebugPanel";
import { SettingsDebugPanel } from "./SettingsDebugPanel";
import type { DebugTab } from "./types";

const tabs: { description: string; id: DebugTab; label: string }[] = [
	{ id: "summary", label: "Summary", description: "Compact reader state." },
	{
		id: "navigation",
		label: "Navigation",
		description:
			"Current tale, block, branch, section, part, entry, page, and path context.",
	},
	{
		id: "scroll",
		label: "Scroll",
		description:
			"Scroll position, progress, viewport, and scroll engine state.",
	},
	{
		id: "progress",
		label: "Progress",
		description: "Saved reading progress and path tracking state.",
	},
	{
		id: "settings",
		label: "Settings",
		description:
			"Live input and snapping settings for keyboard, wheel, and drag.",
	},
];

export default function TaleDebug() {
	const debugMode = useReaderStore((s) => s.ui.isDebugEnabled);
	const uiVisible = useReaderStore((s) => s.ui.isVisible);
	const navigationContext = useReaderStore((s) => s.navigation.context);
	const navigation = useReaderStore((s) => s.navigation.current);
	const progress = useReaderStore((s) => s.progress);
	const reader = useReaderStore((s) => s.reader);
	const scrollApi = useReaderStore((s) => s.scroll.api);
	const tale = useReaderStore((s) => s.tale.data);
	const [isOpen, setIsOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [showPeekBadges, setShowPeekBadges] = useState(true);
	const [activeTab, setActiveTab] = useState<DebugTab>("summary");

	useEffect(() => {
		if (!debugMode || !uiVisible) {
			scrollApi?.setPaused(false);
		}

		return () => {
			scrollApi?.setPaused(false);
		};
	}, [debugMode, scrollApi, uiVisible]);

	if (!debugMode || !uiVisible) return null;

	const block = navigation?.block ?? null;
	const page = navigation?.page ?? null;
	const entry = navigation?.entry ?? null;
	const part = navigation?.part ?? null;
	const section = navigation?.section ?? null;
	const branch = block?.branch ?? null;
	const effectivePage = navigation?.effectivePage ?? null;

	const pauseReaderScroll = () => scrollApi?.setPaused(true);
	const resumeReaderScroll = () => scrollApi?.setPaused(false);
	const stopDebugWheel = (event: React.WheelEvent<HTMLDivElement>) => {
		event.stopPropagation();

		if (!canScrollDebugPanel(event.currentTarget, event.target, event.deltaY)) {
			event.preventDefault();
		}
	};
	const stopDebugTouch = (event: React.TouchEvent<HTMLDivElement>) => {
		event.stopPropagation();
	};

	return (
		<div
			className={clsx(
				"pointer-events-auto z-[90] flex text-white sm:absolute sm:top-5 sm:left-5 sm:max-w-[calc(100vw-2rem)] sm:flex-col sm:items-start sm:gap-2",
				isOpen
					? "fixed inset-0 items-stretch sm:inset-auto"
					: "absolute top-4 left-4 items-start",
			)}
			onBlurCapture={(event) => {
				const nextTarget = event.relatedTarget;
				if (
					!(nextTarget instanceof Node) ||
					!event.currentTarget.contains(nextTarget)
				) {
					resumeReaderScroll();
				}
			}}
			onFocusCapture={pauseReaderScroll}
			onPointerEnter={pauseReaderScroll}
			onPointerLeave={resumeReaderScroll}
			onTouchMoveCapture={stopDebugTouch}
			onWheelCapture={stopDebugWheel}
		>
			{!isOpen ? (
				<div className="flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2">
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/75 px-3 py-2 font-semibold text-xs shadow-2xl backdrop-blur-md transition hover:bg-black/90"
						onClick={() => setIsOpen(true)}
						aria-label="Open reader debug"
					>
						<Bug className="h-4 w-4" />
						Debug
					</button>

					{showPeekBadges ? (
						<div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/65 px-2 py-1.5 shadow-2xl backdrop-blur-md">
							<DebugPeekBadges
								block={block}
								navigationContext={navigationContext}
							/>
							<button
								type="button"
								className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
								onClick={() => setShowPeekBadges(false)}
								aria-label="Hide debug badges"
							>
								<EyeOff className="h-3.5 w-3.5" />
							</button>
						</div>
					) : (
						<button
							type="button"
							className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/65 text-white/70 shadow-2xl backdrop-blur-md transition hover:bg-black/85 hover:text-white"
							onClick={() => setShowPeekBadges(true)}
							aria-label="Show debug badges"
						>
							<Eye className="h-4 w-4" />
						</button>
					)}
				</div>
			) : null}

			{isOpen ? (
				<div
					className={clsx(
						"flex h-full w-full flex-col border-white/15 bg-black/80 shadow-2xl backdrop-blur-md sm:h-auto sm:rounded-2xl sm:border",
						isExpanded
							? "sm:max-h-[80vh] sm:w-[min(calc(100vw-2rem),58rem)] sm:overflow-hidden"
							: "h-[58vh] max-h-[58vh] self-end sm:h-auto sm:max-h-[80vh] sm:w-[min(calc(100vw-2rem),30rem)] sm:self-auto",
					)}
				>
					<div className="border-white/10 border-b p-3 sm:p-4">
						<p className="font-bold text-[10px] text-white/55 uppercase tracking-[0.22em]">
							Reader Debug
						</p>
					</div>

					<div className="flex min-h-0 flex-1 flex-col sm:max-h-[calc(80vh-6.5rem)]">
						<DebugTabList
							activeTab={activeTab}
							onChange={setActiveTab}
							tabs={tabs}
						/>

						<div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
							{activeTab === "summary" ? (
								<DebugSummary
									block={block}
									branch={branch}
									entry={entry}
									effectivePage={effectivePage}
									navigationContext={navigationContext}
									page={page}
									part={part}
									section={section}
								/>
							) : null}

							{activeTab === "navigation" ? (
								<NavigationDebugPanel
									block={block}
									branch={branch}
									entry={entry}
									effectivePage={effectivePage}
									navigationContext={navigationContext}
									page={page}
									part={part}
									section={section}
									taleTitle={tale.title}
								/>
							) : null}

							{activeTab === "scroll" ? (
								<ScrollDebugPanel reader={reader} />
							) : null}

							{activeTab === "progress" ? (
								<ProgressDebugPanel progress={progress} />
							) : null}

							{activeTab === "settings" ? <SettingsDebugPanel /> : null}

							{activeTab !== "summary" ? (
								<div className="mt-4 border-white/10 border-t pt-4">
									<SummaryBadges
										block={block}
										effectivePage={effectivePage}
										navigationContext={navigationContext}
										pageType={effectivePage?.type ?? page?.type ?? null}
										section={section}
									/>
								</div>
							) : null}
						</div>
					</div>

					<div className="flex flex-wrap justify-end gap-2 border-white/10 border-t p-3">
						<button
							type="button"
							className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold text-white text-xs transition hover:bg-white/15"
							onClick={() => {
								setIsOpen(false);
								setIsExpanded(false);
								resumeReaderScroll();
							}}
							aria-label="Close reader debug"
						>
							<X className="h-3.5 w-3.5" />
							Close
						</button>
						<button
							type="button"
							className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-semibold text-black text-xs transition hover:bg-white/85"
							onClick={() => setIsExpanded((value) => !value)}
							aria-label={
								isExpanded ? "Collapse reader debug" : "Expand reader debug"
							}
						>
							{isExpanded ? (
								<Minimize2 className="h-3.5 w-3.5" />
							) : (
								<Maximize2 className="h-3.5 w-3.5" />
							)}
							{isExpanded ? "Collapse" : "Expand"}
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}

function canScrollDebugPanel(
	root: HTMLElement,
	target: EventTarget,
	deltaY: number,
) {
	if (!(target instanceof HTMLElement)) return false;

	let element: HTMLElement | null = target;
	while (element && root.contains(element)) {
		const style = window.getComputedStyle(element);
		const canOverflow = ["auto", "scroll"].includes(style.overflowY);
		const hasScrollableContent =
			element.scrollHeight > element.clientHeight + 1;

		if (canOverflow && hasScrollableContent) {
			if (deltaY > 0) {
				return (
					element.scrollTop + element.clientHeight < element.scrollHeight - 1
				);
			}

			if (deltaY < 0) {
				return element.scrollTop > 0;
			}
		}

		element = element.parentElement;
	}

	return false;
}
