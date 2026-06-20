"use client";

import { useState } from "react";
import { useInspectorEditingState } from "~/app/(tale-app)/(tale-editor)/_shared/hooks/useTaleEditorStore";
import { editFragment } from "~/app/(tale-app)/(tale-editor)/_shared/services/taleDraftEdits";
import type {
	ResolvedTaleFragment,
	TaleFragment,
} from "~/app/(tale-app)/_shared/types";
import { DebugTabs } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import {
	FragmentPlacementSettings,
	FragmentSummary,
	InspectorHeader,
	StyleSettings,
} from "../InspectorFields";
import { FragmentMotionSettings } from "./FragmentMotionSettings";

type FragmentInspectorTab = "motion" | "placement" | "style" | "summary";

const tabs: { id: FragmentInspectorTab; label: string }[] = [
	{ id: "summary", label: "Summary" },
	{ id: "placement", label: "Placement" },
	{ id: "motion", label: "Motion" },
	{ id: "style", label: "Style" },
];

/**
 * Renders fragment-only editor controls and subscriptions.
 *
 * @param props - Fragment inspector props.
 * @param props.blockId - Parent block id.
 * @param props.fragmentId - Fragment selected for editing.
 * @returns Fragment inspector tabs.
 *
 * @example
 * <FragmentInspectorPanel blockId="block-1" fragmentId="fragment-1" />
 */
export function FragmentInspectorPanel({
	blockId,
	fragmentId,
}: {
	blockId: string;
	fragmentId: string;
}) {
	const { requestRecompile, scrollApi, setData, tale } =
		useInspectorEditingState();
	const [activeTab, setActiveTab] = useState<FragmentInspectorTab>("summary");
	const block = tale.indexMap.blocksById[blockId];
	const fragment = tale.indexMap.fragmentsById[fragmentId];
	if (!block || !fragment) {
		return <p className="text-sm text-white/55">Fragment missing.</p>;
	}

	const commit = (update: (item: ResolvedTaleFragment) => TaleFragment) => {
		scrollApi?.capturePosition();
		setData(editFragment(tale, fragment.id, update));
		requestRecompile("fragment-inspector");
	};

	return (
		<div
			data-reader-component="FragmentInspectorPanel"
			data-reader-role="fragment-inspector"
			className="-m-3"
		>
			<InspectorHeader subtitle={block.title} title={fragment.id} />
			<DebugTabs active={activeTab} onChange={setActiveTab} tabs={tabs} />
			<div className="space-y-3 p-3">
				{activeTab === "summary" ? (
					<FragmentSummary fragment={fragment} />
				) : null}
				{activeTab === "placement" ? (
					<FragmentPlacementSettings
						block={block}
						fragment={fragment}
						onChange={(placement) =>
							commit((item) => ({
								...item,
								nodeId: placement.nodeId ?? item.nodeId,
								placement,
							}))
						}
					/>
				) : null}
				{activeTab === "motion" ? (
					<FragmentMotionSettings fragment={fragment} onChange={commit} />
				) : null}
				{activeTab === "style" ? (
					<StyleSettings
						style={fragment.style}
						title="Fragment style"
						onChange={(style) => commit((item) => ({ ...item, style }))}
					/>
				) : null}
			</div>
		</div>
	);
}
