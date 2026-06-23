"use client";

import { Bug, X } from "lucide-react";
import { useState } from "react";
import { EditorDebugHeaderActions } from "~/app/(tale-app)/(tale-editor)/_shared/components/TaleEditor/EditorDebugHeaderActions";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";
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

* Renders diagnostics only while reader debug visibility is enabled.
*
* @returns Null while hidden or the active diagnostics panel.
*
* @example
* <TaleDebug />

*/
export function TaleDebug(): React.JSX.Element | null {
	const visible = useTaleReaderStoreShallow(
		(state) => state.ui.visibilityMode === "all" && state.ui.debugVisible,
	);

	if (!visible) return null;

	return <TaleDebugContent />;
}

/**

* Renders the active reader diagnostics panel and compact debug launcher.
*
* @returns Compact debug launcher or the expanded diagnostics panel.
*
* @example
* <TaleDebugContent />

*/
function TaleDebugContent(): React.JSX.Element {
	const { block, branch, entry, location, page, part } =
		useReaderLocationContext();
	const {
		activeSegmentIndex,
		compiled,
		open,
		phase,
		seenBlocks,
		taleTitle,
		toggleDebug,
	} = useTaleDebugState();
	const tale = useTaleAppStore((state) => state.document.tale);
	const isEditor = useTaleAppStore((state) => state.derived.isEditor);
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
				className="pointer-events-auto absolute top-4 left-4 z-40 flex min-h-12 max-w-[min(34rem,calc(100vw-2rem))] items-center gap-2 rounded-lg border border-foreground/12 bg-background/72 px-3 py-2 text-left text-primary opacity-25 shadow-2xl backdrop-blur-md transition-opacity duration-200 hover:opacity-100"
				onClick={toggleDebug}
			>
				<Bug size={18} />
				<span className="hidden min-w-0 sm:block">
					<span className="block truncate font-semibold text-[11px] text-foreground/78">
						{block?.title ?? taleTitle}
					</span>
					<span className="block truncate text-[10px] text-foreground/42">
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
			className="pointer-events-auto absolute top-4 bottom-4 left-4 z-60 flex w-[min(38rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-foreground/12 bg-background/80 shadow-2xl backdrop-blur-md"
		>
			<header className="flex shrink-0 items-center justify-between gap-4 border-foreground/10 border-b px-4 py-3">
				<div className="min-w-0">
					<p className="font-black text-primary text-xs uppercase tracking-[0.2em]">
						Reader Debug
					</p>
					<p className="truncate text-foreground/46 text-xs">
						{block?.title ?? taleTitle}
					</p>
				</div>
				<div className="flex items-center gap-1">
					{isEditor ? (
						<EditorDebugHeaderActions blockId={location?.blockId ?? null} />
					) : null}
					<button
						type="button"
						aria-label="Hide reader debug"
						className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/55 hover:text-foreground"
						onClick={toggleDebug}
					>
						<X size={16} />
					</button>
				</div>
			</header>
			{isEditor ? <GlobalSnapControls /> : null}
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
