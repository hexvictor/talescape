"use client";

import { FileText, Maximize2, Network, Paintbrush, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import {
	editBlock,
	editBlockNodes,
	editBlockPagination,
} from "~/app/(tale-app)/(studio)/_shared/services/taleDraftEdits";
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
import { api } from "~/trpc/react";
import {
	BlockSizeSettings,
	InspectorHeader,
	NodeSettings,
	StyleSettings,
} from "../InspectorFields";
import { BlockDetailsSettings } from "./BlockDetailsSettings";
import { BlockMotionSettings } from "./BlockMotionSettings";

type BlockInspectorTab = "layout" | "motion" | "size" | "style" | "summary";

const tabs: {
	icon: React.JSX.Element;
	id: BlockInspectorTab;
	label: string;
}[] = [
	{ icon: <FileText size={15} />, id: "summary", label: "Summary" },
	{ icon: <Maximize2 size={15} />, id: "size", label: "Size" },
	{ icon: <Network size={15} />, id: "layout", label: "Nodes" },
	{ icon: <Waves size={15} />, id: "motion", label: "Motion" },
	{ icon: <Paintbrush size={15} />, id: "style", label: "Style" },
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
	const { dirty, setTale, tale } = useTaleAppStoreShallow((state) => ({
		dirty: state.document.dirty,
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const activeBreakpointId = useTaleAppStore(
		(state) => state.runtime.breakpointId,
	);
	const [activeTab, setActiveTab] = useState<BlockInspectorTab>(initialTab);
	const addBlock = api.taleApp.studio.addBlock.useMutation();
	const removeBlock = api.taleApp.studio.removeBlock.useMutation();
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
	const requireSavedDraft = (): boolean => {
		if (!dirty) return true;
		window.alert(
			"Save the current Studio draft before changing block structure.",
		);
		return false;
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
				{activeTab === "summary" ? (
					<BlockDetailsSettings
						block={block}
						onChange={commit}
						onAdd={() => {
							if (!requireSavedDraft() || addBlock.isPending) return;
							addBlock.mutate(
								{ branchId: Number(block.branchId), taleId: tale.id },
								{
									onError: (error) => window.alert(error.message),
									onSuccess: () => window.location.reload(),
								},
							);
						}}
						onPaginatedChange={(isPaginated) =>
							setTale(editBlockPagination(tale, block.id, isPaginated), {
								reason: "block-pagination",
							})
						}
						onRemove={() => {
							if (
								!requireSavedDraft() ||
								removeBlock.isPending ||
								!window.confirm(`Remove ${block.title}? This cannot be undone.`)
							)
								return;
							removeBlock.mutate(
								{ blockId: Number(block.id), taleId: tale.id },
								{
									onError: (error) => window.alert(error.message),
									onSuccess: () => window.location.reload(),
								},
							);
						}}
					/>
				) : null}
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
							setTale(
								editBlockNodes(
									tale,
									block.id,
									nodes,
									rootNodeId,
									activeBreakpointId,
								),
								{
									reason: "block-node-inspector",
								},
							)
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
