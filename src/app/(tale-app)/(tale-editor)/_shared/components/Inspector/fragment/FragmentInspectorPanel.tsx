"use client";

import { useEffect, useMemo, useState } from "react";
import { editFragment } from "~/app/(tale-app)/(tale-editor)/_shared/services/taleDraftEdits";
import { DebugTabs } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { resolveTaleBreakpoint } from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";
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
import { FragmentContentSettings } from "./FragmentContentSettings";
import { FragmentMotionSettings } from "./FragmentMotionSettings";

export type FragmentInspectorTab =
	| "content"
	| "motion"
	| "placement"
	| "style"
	| "summary";

const tabs: { id: FragmentInspectorTab; label: string }[] = [
	{ id: "summary", label: "Summary" },
	{ id: "content", label: "Content" },
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
 * @param props.initialTab - Optional initially selected tab.
 * @returns Fragment inspector tabs.
 *
 * @example
 * <FragmentInspectorPanel blockId="block-1" fragmentId="fragment-1" />
 */
export function FragmentInspectorPanel({
	blockId,
	fragmentId,
	initialTab = "summary",
}: {
	blockId: string;
	fragmentId: string;
	initialTab?: FragmentInspectorTab;
}) {
	const scrollApi = useTaleReaderStore((state) => state.scroll.api);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const activeBreakpointId = useTaleAppStore(
		(state) => state.runtime.breakpointId,
	);
	const [activeTab, setActiveTab] = useState<FragmentInspectorTab>(initialTab);
	useEffect(() => {
		setActiveTab(initialTab);
	}, [fragmentId, initialTab]);
	const resolvedTale = useMemo(
		() => resolveTaleBreakpoint(tale, activeBreakpointId),
		[activeBreakpointId, tale],
	);
	const block = resolvedTale.indexMap.blocksById[blockId];
	const fragment = resolvedTale.indexMap.fragmentsById[fragmentId];
	if (!block || !fragment) {
		return <p className="text-foreground/55 text-sm">Fragment missing.</p>;
	}

	const commit = (update: (item: ResolvedTaleFragment) => TaleFragment) => {
		scrollApi?.capturePosition();
		setTale(editFragment(tale, fragment.id, update, activeBreakpointId), {
			reason: "fragment-inspector",
		});
	};

	return (
		<div
			data-reader-component="FragmentInspectorPanel"
			data-reader-role="fragment-inspector"
			className="-m-3 flex h-full min-h-0 flex-col"
		>
			<div className="shrink-0">
				<InspectorHeader subtitle={block.title} title={fragment.id} />
				<DebugTabs active={activeTab} onChange={setActiveTab} tabs={tabs} />
			</div>
			<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
				{activeTab === "summary" ? (
					<FragmentSummary fragment={fragment} />
				) : null}
				{activeTab === "content" ? (
					<FragmentContentSettings fragment={fragment} onChange={commit} />
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
