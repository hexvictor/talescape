"use client";

import cn from "~/lib/utils/cn";
import { useTaleAppStore } from "../../../../contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "../../../../contexts/TaleReaderStoreContext";
import type {
	Anchor,
	ResolvedTaleBlock,
	Tale,
	TaleBranch,
	TaleEntry,
	TalePage,
	TalePart,
	TimelineSegment,
} from "../../../../types";
import { DebugCard, DebugField } from "../DebugPrimitives";

/**
 * Renders current reader and route summary metrics.
 *
 * @param props - Summary values selected by the debug shell.
 * @returns Summary cards.
 */
export function SummaryPanel({
	anchors,
	blockType,
	blockTitle,
	branchTitle,
	entryTitle,
	pageLabel,
	partTitle,
	phase,
	seenBlocks,
}: {
	anchors: Anchor[];
	blockType?: string;
	blockTitle?: string;
	branchTitle?: string;
	entryTitle?: string;
	pageLabel?: string;
	partTitle?: string;
	phase: string;
	seenBlocks: number;
}) {
	return (
		<div
			data-reader-component="DebugSummaryPanel"
			data-reader-role="debug-panel"
			className="space-y-3"
		>
			<DebugCard title="Now reading">
				<DebugField label="Phase" value={phase} />
				<DebugField label="Block" value={blockTitle} />
				<DebugField label="Block type" value={blockType} />
				<DebugField label="Branch" value={branchTitle} />
				<DebugField label="Page" value={pageLabel} />
				<DebugField label="Entry" value={entryTitle} />
				<DebugField label="Part" value={partTitle} />
			</DebugCard>
			<DebugCard title="Route">
				<DebugField label="Compiled blocks" value={String(anchors.length)} />
				<DebugField label="Reached blocks" value={String(seenBlocks)} />
			</DebugCard>
		</div>
	);
}

/**
 * Renders current narrative relationship details.
 *
 * @param props - Resolved current reader entities.
 * @returns Navigation diagnostic cards.
 */
export function NavigationPanel({
	block,
	branch,
	entry,
	page,
	pageLabel,
	part,
}: {
	block: ResolvedTaleBlock | null;
	branch: TaleBranch | null;
	entry: TaleEntry | null;
	page: TalePage | null;
	pageLabel?: string;
	part: TalePart | null;
}) {
	return (
		<div
			data-reader-component="NavigationDebugPanel"
			data-reader-role="debug-panel"
			className="space-y-3"
		>
			<DebugCard title="Block and branch">
				<DebugField label="Block id" value={block?.id} />
				<DebugField label="Title" value={block?.title} />
				<DebugField label="Branch id" value={branch?.id} />
				<DebugField label="Path" value={branch?.path} />
			</DebugCard>
			<DebugCard title="Narrative hierarchy">
				<DebugField label="Page" value={pageLabel} />
				<DebugField label="Page id" value={page?.id} />
				<DebugField label="Page type" value={page?.type} />
				<DebugField
					label="Page is paginated"
					value={String(page?.isPaginated)}
				/>
				<DebugField label="Entry" value={entry?.title} />
				<DebugField label="Entry type" value={entry?.type} />
				<DebugField label="Part" value={part?.title} />
				<DebugField label="Part id" value={part?.id} />
			</DebugCard>
		</div>
	);
}

/**
 * Renders live saved-progress diagnostics.
 *
 * @param props - Progress panel props.
 * @param props.compiledCount - Number of compiled blocks.
 * @returns Progress diagnostic cards.
 */
export function ProgressPanel({ compiledCount }: { compiledCount: number }) {
	const progress = useTaleReaderStore((state) => state.progress.data);
	const numberedPageIds = useTaleAppStore(
		(state) => state.document.tale.order.numberedPageIds,
	);
	const seenNumberedPages = progress.seenPageIds.filter((pageId) =>
		numberedPageIds.includes(pageId),
	).length;
	return (
		<div
			data-reader-component="ProgressDebugPanel"
			data-reader-role="debug-panel"
			className="space-y-3"
		>
			<DebugCard title="Saved position">
				<DebugField label="Block" value={progress.blockId} />
				<DebugField
					label="Inner progress"
					value={`${Math.round(progress.innerProgress * 100)}%`}
				/>
				<DebugField
					label="Seen blocks"
					value={`${progress.seenBlockIds.length}/${compiledCount}`}
				/>
				<DebugField
					label="Seen numbered pages"
					value={`${seenNumberedPages}/${numberedPageIds.length}`}
				/>
				<DebugField
					label="Seen narrative units"
					value={String(progress.seenPageIds.length)}
				/>
				<DebugField
					label="Seen entries"
					value={String(progress.seenEntryIds.length)}
				/>
				<DebugField
					label="Seen parts"
					value={String(progress.seenPartIds.length)}
				/>
				<DebugField
					label="Committed fragments"
					value={String(progress.committedAnimationIds.length)}
				/>
			</DebugCard>
			<DebugCard title="Selected route">
				<DebugField
					label="Branches"
					value={progress.selectedBranchIds.join(", ")}
				/>
				<DebugField label="Saved at" value={progress.updatedAt} />
			</DebugCard>
		</div>
	);
}

/**
 * Renders compiled timeline segments.
 *
 * @param props - Segment panel props.
 * @returns Segment rows with the active segment highlighted.
 */
export function SegmentsPanel({
	activeIndex,
	segments,
}: {
	activeIndex: number;
	segments: TimelineSegment[];
}) {
	const tale = useTaleAppStore((state) => state.document.tale);
	return (
		<div
			data-reader-component="SegmentsDebugPanel"
			data-reader-role="debug-panel"
			className="space-y-2"
		>
			{segments.map((segment) => (
				<div
					key={`${segment.index}-${segment.type}`}
					className={cn(
						"grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded border px-3 py-2 text-xs",
						segment.index === activeIndex
							? "border-primary/50 bg-primary/10"
							: "border-foreground/8 bg-foreground/[0.035]",
					)}
				>
					<span className="font-bold text-foreground/42">{segment.index}</span>
					<span className="truncate text-foreground/76">
						{getSegmentLabel(segment, tale)}
					</span>
					<span className="text-foreground/42">
						{segment.type} / {Math.round(segment.length)}
					</span>
				</div>
			))}
		</div>
	);
}

/**
 * Renders compiled anchor geometry.
 *
 * @param props - Anchor panel props.
 * @returns Anchor diagnostic rows.
 */
export function AnchorsPanel({
	activeBlockId,
	anchors,
}: {
	activeBlockId?: string;
	anchors: Anchor[];
}) {
	const tale = useTaleAppStore((state) => state.document.tale);
	return (
		<div
			data-reader-component="AnchorsDebugPanel"
			data-reader-role="debug-panel"
			className="space-y-2"
		>
			{anchors.map((anchor) => (
				<div
					key={anchor.id}
					className={cn(
						"rounded border px-3 py-2 text-xs",
						anchor.blockId === activeBlockId
							? "border-primary/50 bg-primary/10"
							: "border-foreground/8 bg-foreground/[0.035]",
					)}
				>
					<p className="font-semibold text-foreground/78">
						{tale.indexMap.blocksById[anchor.blockId]?.title ?? anchor.blockId}
					</p>
					<p className="mt-1 text-foreground/43">
						{Math.round(anchor.point.x)}, {Math.round(anchor.point.y)} /{" "}
						{Math.round(anchor.width)} x {Math.round(anchor.height)} / scroll{" "}
						{Math.round(anchor.scroll)}
					</p>
				</div>
			))}
		</div>
	);
}

/**
 * Creates a readable label for one timeline segment.
 *
 * @param segment - Timeline segment.
 * @returns Human-readable segment label.
 */
function getSegmentLabel(segment: TimelineSegment, tale: Tale): string {
	const blockTitle = (blockId: string | null): string =>
		(blockId && tale.indexMap.blocksById[blockId]?.title) ?? "Entrance";
	if (segment.type === "reading") return blockTitle(segment.blockId);
	if (segment.type === "pause") {
		return `${blockTitle(segment.blockId)} (${segment.pauseType} pause)`;
	}
	return `${blockTitle(segment.fromBlockId)} -> ${blockTitle(segment.toBlockId)}`;
}
