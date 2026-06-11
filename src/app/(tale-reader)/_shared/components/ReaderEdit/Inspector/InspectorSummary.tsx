import type { ResolvedTaleBlock, ResolvedTaleFragment } from "../../../types";
import {
	DebugCard,
	DebugField,
} from "../../ReaderUi/TaleDebug/DebugPrimitives";

/**
 * Renders the inspector title bar.
 *
 * @param props - Component props.
 * @param props.subtitle - Secondary title text.
 * @param props.title - Primary title text.
 * @returns Header markup.
 */
export function InspectorHeader({
	subtitle,
	title,
}: {
	subtitle: string;
	title: string;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="InspectorHeader"
			data-reader-role="inspector-summary"
			className="border-white/10 border-b bg-black/24 px-3 py-3"
		>
			<p className="truncate font-black text-[#d9b56f] text-xs uppercase">
				{title}
			</p>
			<p className="mt-1 truncate text-white/42 text-xs">{subtitle}</p>
		</div>
	);
}

/**
 * Renders key block metadata.
 *
 * @param props - Component props.
 * @param props.block - Inspected block.
 * @returns Block summary.
 */
export function BlockSummary({
	block,
}: {
	block: ResolvedTaleBlock;
}): React.JSX.Element {
	return (
		<DebugCard title="Block">
			<DebugField label="Id" value={block.id} />
			<DebugField label="Description" value={block.description} />
			<DebugField label="Branch" value={block.branchId} />
			<DebugField label="Page" value={block.pageId} />
			<DebugField label="Entry" value={block.entryId} />
			<DebugField label="Part" value={block.partId} />
			<DebugField label="Root node" value={block.rootNodeId} />
			<DebugField label="Nodes" value={String(block.nodes.length)} />
			<DebugField label="Fragments" value={String(block.fragments.length)} />
			<DebugField
				label="Flow"
				value={
					block.transition.flow.type === "linear"
						? block.transition.flow.direction
						: "stack"
				}
			/>
		</DebugCard>
	);
}

/**
 * Renders key fragment metadata.
 *
 * @param props - Component props.
 * @param props.fragment - Inspected fragment.
 * @returns Fragment summary.
 */
export function FragmentSummary({
	fragment,
}: {
	fragment: ResolvedTaleFragment;
}): React.JSX.Element {
	return (
		<DebugCard title="Fragment">
			<DebugField label="Id" value={fragment.id} />
			<DebugField label="Type" value={fragment.type} />
			<DebugField label="Node" value={fragment.nodeId} />
			<DebugField label="Placement" value={fragment.placement.mode} />
			<DebugField label="Order" value={String(fragment.order)} />
			<DebugField
				label="Visible range"
				value={`${fragment.resolvedVisibleRange.start} - ${fragment.resolvedVisibleRange.end}`}
			/>
		</DebugCard>
	);
}
