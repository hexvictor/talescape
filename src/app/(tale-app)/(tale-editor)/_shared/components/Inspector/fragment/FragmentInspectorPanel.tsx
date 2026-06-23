"use client";

import { useState } from "react";
import { editFragment } from "~/app/(tale-app)/(tale-editor)/_shared/services/taleDraftEdits";
import { DebugTabs } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import type {
	ResolvedTaleFragment,
	TaleFragment,
} from "~/app/(tale-app)/_shared/types";
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
	const scrollApi = useTaleReaderStore((state) => state.scroll.api);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const [activeTab, setActiveTab] = useState<FragmentInspectorTab>("summary");
	const block = tale.indexMap.blocksById[blockId];
	const fragment = tale.indexMap.fragmentsById[fragmentId];
	if (!block || !fragment) {
		return <p className="text-foreground/55 text-sm">Fragment missing.</p>;
	}

	const commit = (update: (item: ResolvedTaleFragment) => TaleFragment) => {
		scrollApi?.capturePosition();
		setTale(editFragment(tale, fragment.id, update), {
			reason: "fragment-inspector",
		});
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
