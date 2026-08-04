"use client";

import { useMemo, useState } from "react";
import { editBlock } from "~/app/(tale-app)/(tale-editor)/_shared/services/taleDraftEdits";
import { DebugTabs } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { resolveTaleBreakpoint } from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";
import type {
	ResolvedTaleBlock,
	TaleBlock,
} from "~/app/(tale-app)/_shared/types";
import {
	BlockSizeSettings,
	BlockSummary,
	InspectorHeader,
	NodeSettings,
	StyleSettings,
} from "../InspectorFields";
import { BlockMotionSettings } from "./BlockMotionSettings";

type BlockInspectorTab = "layout" | "motion" | "size" | "style" | "summary";

const tabs: { id: BlockInspectorTab; label: string }[] = [
	{ id: "summary", label: "Summary" },
	{ id: "size", label: "Size" },
	{ id: "layout", label: "Nodes" },
	{ id: "motion", label: "Motion" },
	{ id: "style", label: "Style" },
];

/**
 * Renders block-only editor controls and subscriptions.
 *
 * @param props - Block inspector props.
 * @param props.blockId - Block selected for editing.
 * @param props.initialNodeId - Optional node to focus when opening the Nodes tab.
 * @param props.initialTab - Optional initial inspector tab.
 * @returns Block inspector tabs.
 *
 * @example
 * <BlockInspectorPanel blockId="block-1" />
 */
export function BlockInspectorPanel({
	blockId,
	initialNodeId,
	initialTab = "summary",
}: {
	blockId: string;
	initialNodeId?: string;
	initialTab?: BlockInspectorTab;
}) {
	const scrollApi = useTaleReaderStore((state) => state.scroll.api);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const activeBreakpointId = useTaleAppStore(
		(state) => state.runtime.breakpointId,
	);
	const [activeTab, setActiveTab] = useState<BlockInspectorTab>(initialTab);
	const resolvedTale = useMemo(
		() => resolveTaleBreakpoint(tale, activeBreakpointId),
		[activeBreakpointId, tale],
	);
	const block = resolvedTale.indexMap.blocksById[blockId];
	if (!block)
		return <p className="text-foreground/55 text-sm">Block missing.</p>;

	const commit = (update: (item: ResolvedTaleBlock) => TaleBlock) => {
		scrollApi?.capturePosition();
		setTale(editBlock(tale, block.id, update, activeBreakpointId), {
			reason: "block-inspector",
		});
	};

	return (
		<div
			data-reader-component="BlockInspectorPanel"
			data-reader-role="block-inspector"
			className="-m-3 flex h-full min-h-0 flex-col"
		>
			<div className="shrink-0">
				<InspectorHeader subtitle={block.id} title={block.title} />
				<DebugTabs active={activeTab} onChange={setActiveTab} tabs={tabs} />
			</div>
			<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
				{activeTab === "summary" ? <BlockSummary block={block} /> : null}
				{activeTab === "size" ? (
					<BlockSizeSettings
						size={block.size}
						onChange={(size) => commit((item) => ({ ...item, size }))}
					/>
				) : null}
				{activeTab === "layout" ? (
					<NodeSettings
						block={block}
						initialNodeId={initialNodeId}
						onChange={(nodes, rootNodeId) =>
							commit((item) => ({ ...item, nodes, rootNodeId }))
						}
					/>
				) : null}
				{activeTab === "motion" ? (
					<BlockMotionSettings block={block} onChange={commit} />
				) : null}
				{activeTab === "style" ? (
					<StyleSettings
						style={block.style}
						title="Block style"
						onChange={(style) => commit((item) => ({ ...item, style }))}
					/>
				) : null}
			</div>
		</div>
	);
}
