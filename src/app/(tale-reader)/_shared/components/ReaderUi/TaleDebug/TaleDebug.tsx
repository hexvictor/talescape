"use client";

import { Bug, ScanSearch, Settings2, X } from "lucide-react";
import { useState } from "react";
import { useReaderStoreShallow } from "../../../contexts/ReaderStoreContext";
import { useTaleDebugState } from "../../../hooks/store/useReaderDebugSelectors";
import { useReaderLocationContext } from "../../../hooks/useReaderLocationContext";
import { DebugLocationDetails } from "./DebugLocationDetails";
import { DebugTabs } from "./DebugPrimitives";
import { GlobalSnapControls } from "./GlobalSnapControls";
import {
	AnchorsPanel,
	NavigationPanel,
	ProgressPanel,
	SegmentsPanel,
	SummaryPanel,
} from "./panels/DebugPanels";

type DebugTab = "anchors" | "navigation" | "progress" | "segments" | "summary";

const coreTabs: { id: DebugTab; label: string }[] = [
	{ id: "summary", label: "Summary" },
	{ id: "navigation", label: "Navigation" },
	{ id: "progress", label: "Progress" },
	{ id: "segments", label: "Segments" },
	{ id: "anchors", label: "Anchors" },
];

/**
 * Renders diagnostics without subscribing inactive panels to scroll progress.
 *
 * @returns Compact debug launcher or the active diagnostics panel.
 *
 * @example
 * <TaleDebug />
 */
export function TaleDebug(): React.JSX.Element {
	const { block, branch, entry, location, page, part } =
		useReaderLocationContext();
	const {
		activeSegmentIndex,
		compiled,
		inspectorControlsOpen,
		mode,
		open,
		openInspector,
		phase,
		seenBlocks,
		taleTitle,
		toggleDebug,
		toggleInspectorControls,
	} = useTaleDebugState();
	const tale = useReaderStoreShallow((state) => state.tale.data);
	const [activeTab, setActiveTab] = useState<DebugTab>("summary");
	const currentContentsBlock = compiled?.contents
		.flatMap((contentsPart) =>
			contentsPart.entries.flatMap((contentsEntry) => contentsEntry.blocks),
		)
		.find((item) => item.blockId === location?.blockId);
	const currentPage = compiled?.pages.find(
		(item) => item.id === location?.pageId,
	);

	if (!open) {
		return (
			<button
				data-reader-ui="true"
				data-reader-component="TaleDebug"
				data-reader-role="compact-debug-status"
				type="button"
				aria-label="Open reader debug"
				className="pointer-events-auto absolute top-4 left-4 z-40 flex min-h-12 max-w-[min(34rem,calc(100vw-2rem))] items-center gap-2 rounded-lg border border-white/12 bg-black/72 px-3 py-2 text-left text-[#d9b56f] opacity-25 shadow-2xl backdrop-blur-md transition-opacity duration-200 hover:opacity-100"
				onClick={toggleDebug}
			>
				<Bug size={18} />
				<span className="hidden min-w-0 sm:block">
					<span className="block truncate font-semibold text-[11px] text-white/78">
						{block?.title ?? taleTitle}
					</span>
					<span className="block truncate text-[10px] text-white/42">
						{currentPage?.label ?? page?.type ?? "No page"} ·{" "}
						{entry?.title ?? "No entry"}
					</span>
					<DebugLocationDetails
						compiled={compiled}
						location={location}
						tale={tale}
					/>
				</span>
			</button>
		);
	}

	return (
		<aside
			data-reader-ui="true"
			className="pointer-events-auto absolute top-4 bottom-4 left-4 z-60 flex w-[min(38rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-white/12 bg-black/80 shadow-2xl backdrop-blur-md"
		>
			<header className="flex shrink-0 items-center justify-between gap-4 border-white/10 border-b px-4 py-3">
				<div className="min-w-0">
					<p className="font-black text-[#d9b56f] text-xs uppercase tracking-[0.2em]">
						Reader Debug
					</p>
					<p className="truncate text-white/46 text-xs">
						{block?.title ?? taleTitle}
					</p>
				</div>
				<div className="flex items-center gap-1">
					{mode === "edit" ? (
						<>
							<button
								type="button"
								aria-label="Inspect current block"
								disabled={!location?.blockId}
								className="grid h-9 w-9 place-items-center rounded border border-white/10 text-white/55 hover:text-white disabled:opacity-25"
								onClick={() => {
									if (location?.blockId) {
										openInspector({ id: location.blockId, type: "block" });
									}
								}}
							>
								<ScanSearch size={16} />
							</button>
							<button
								type="button"
								aria-label={
									inspectorControlsOpen
										? "Hide inspector buttons"
										: "Show inspector buttons"
								}
								className="grid h-9 w-9 place-items-center rounded border border-white/10 text-white/55 hover:text-white"
								onClick={toggleInspectorControls}
							>
								<Settings2
									className={
										inspectorControlsOpen ? "text-[#d9b56f]" : undefined
									}
									size={16}
								/>
							</button>
						</>
					) : null}
					<button
						type="button"
						aria-label="Hide reader debug"
						className="grid h-9 w-9 place-items-center rounded border border-white/10 text-white/55 hover:text-white"
						onClick={toggleDebug}
					>
						<X size={16} />
					</button>
				</div>
			</header>
			{mode === "edit" ? <GlobalSnapControls /> : null}
			<DebugTabs active={activeTab} onChange={setActiveTab} tabs={coreTabs} />
			<div className="min-h-0 flex-1 overflow-y-auto p-3">
				{activeTab === "summary" ? (
					<SummaryPanel
						anchors={compiled?.anchors ?? []}
						blockType={
							block ? (block.isChoiceBlock ? "choice" : "standard") : undefined
						}
						blockTitle={block?.title}
						branchTitle={branch?.title}
						entryTitle={entry?.title}
						pageLabel={currentPage?.label ?? currentContentsBlock?.pageLabel}
						partTitle={part?.title}
						phase={phase}
						seenBlocks={seenBlocks}
					/>
				) : null}
				{activeTab === "navigation" ? (
					<NavigationPanel
						block={block}
						branch={branch}
						entry={entry}
						page={page}
						pageLabel={currentPage?.label ?? currentContentsBlock?.pageLabel}
						part={part}
					/>
				) : null}
				{activeTab === "progress" ? (
					<ProgressPanel compiledCount={compiled?.anchors.length ?? 0} />
				) : null}
				{activeTab === "segments" ? (
					<SegmentsPanel
						activeIndex={activeSegmentIndex}
						segments={compiled?.segments ?? []}
					/>
				) : null}
				{activeTab === "anchors" ? (
					<AnchorsPanel
						activeBlockId={location?.blockId}
						anchors={compiled?.anchors ?? []}
					/>
				) : null}
			</div>
		</aside>
	);
}
