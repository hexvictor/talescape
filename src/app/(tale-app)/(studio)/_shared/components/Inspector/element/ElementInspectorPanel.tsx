"use client";

import { FileText, Move, Paintbrush, PanelsTopLeft, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import {
	editElement,
	setDraftFrameChildDefaultState,
} from "~/app/(tale-app)/(studio)/_shared/services/taleDraftEdits";
import { DebugTabs } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { resolveTaleBreakpoint } from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";
import type {
	ResolvedTaleElement,
	TaleElement,
	TaleInspectorTarget,
} from "~/app/(tale-app)/_shared/types";
import { useTaleStudioStore } from "../../../hooks/useTaleStudioStore";
import {
	ElementPlacementSettings,
	ElementSummary,
	InspectorHeader,
	StyleSettings,
} from "../InspectorFields";
import { ElementContentSettings } from "./ElementContentSettings";
import { ElementMotionSettings } from "./ElementMotionSettings";

export type ElementInspectorTab =
	| "content"
	| "motion"
	| "placement"
	| "style"
	| "summary";

const tabs: {
	icon: React.JSX.Element;
	id: ElementInspectorTab;
	label: string;
}[] = [
	{ icon: <FileText size={15} />, id: "summary", label: "Summary" },
	{ icon: <PanelsTopLeft size={15} />, id: "content", label: "Content" },
	{ icon: <Move size={15} />, id: "placement", label: "Placement" },
	{ icon: <Waves size={15} />, id: "motion", label: "Motion" },
	{ icon: <Paintbrush size={15} />, id: "style", label: "Style" },
];

/**
 * Renders element-only editor controls and subscriptions.
 *
 * @param props - Element inspector props.
 * @param props.sceneId - Parent scene id.
 * @param props.elementId - Element selected for editing.
 * @param props.initialTab - Optional initially selected tab.
 * @returns Element inspector tabs.
 *
 * @example
 * <ElementInspectorPanel sceneId="scene-1" elementId="element-1" />
 */
export function ElementInspectorPanel({
	sceneId,
	elementId,
	initialTab = "summary",
	returnTarget,
}: {
	sceneId: string;
	elementId: string;
	initialTab?: ElementInspectorTab;
	returnTarget?: TaleInspectorTarget;
}) {
	const scrollApi = useTaleReaderStore((state) => state.scroll.api);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const activeBreakpointId = useTaleAppStore(
		(state) => state.runtime.breakpointId,
	);
	const [activeTab, setActiveTab] = useState<ElementInspectorTab>(initialTab);
	const openInspector = useTaleStudioStore(
		(state) => state.studioSelection.openInspector,
	);
	const rememberInspectorTab = useTaleStudioStore(
		(state) => state.studioSelection.rememberInspectorTab,
	);
	const resolvedTale = useMemo(
		() => resolveTaleBreakpoint(tale, activeBreakpointId),
		[activeBreakpointId, tale],
	);
	const scene = resolvedTale.indexMap.scenesById[sceneId];
	const element = resolvedTale.indexMap.elementsById[elementId];
	if (!scene || !element) {
		return <p className="text-foreground/55 text-sm">Element missing.</p>;
	}

	const commit = (update: (item: ResolvedTaleElement) => TaleElement) => {
		scrollApi?.capturePosition();
		setTale(editElement(tale, element.id, update, activeBreakpointId), {
			reason: "element-inspector",
		});
	};
	const parentFrame = element.frameId
		? resolvedTale.indexMap.framesById[element.frameId]
		: undefined;
	let phaseFrame = parentFrame;
	while (phaseFrame?.kind === "group" && phaseFrame.parentFrameId) {
		phaseFrame = resolvedTale.indexMap.framesById[phaseFrame.parentFrameId];
	}

	return (
		<div
			data-reader-component="ElementInspectorPanel"
			data-reader-role="element-inspector"
			data-studio-component="ElementInspectorPanel"
			data-studio-role="element-inspector"
			className="studio-inspector -m-3 flex h-full min-h-0 flex-col"
		>
			<div className="shrink-0">
				<InspectorHeader
					backLabel={element.frameId ? `Frame ${element.frameId}` : scene.title}
					subtitle={scene.title}
					title={element.label ?? `${element.type} ${element.id}`}
					onBack={() =>
						returnTarget
							? openInspector(returnTarget)
							: element.frameId
								? openInspector({
										id: element.frameId,
										initialTab: "elements",
										sceneId: scene.id,
										type: "frame",
									})
								: openInspector({
										id: scene.id,
										initialTab: "layout",
										type: "scene",
									})
					}
				/>
				<DebugTabs
					active={activeTab}
					studio
					onChange={(tab) => {
						setActiveTab(tab);
						rememberInspectorTab("element", tab);
					}}
					tabs={tabs}
				/>
			</div>
			<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
				{activeTab === "summary" ? <ElementSummary element={element} /> : null}
				{activeTab === "content" ? (
					<ElementContentSettings element={element} onChange={commit} />
				) : null}
				{activeTab === "placement" ? (
					<ElementPlacementSettings
						scene={scene}
						element={element}
						onChange={(placement) =>
							commit((item) => ({
								...item,
								frameId: placement.frameId ?? item.frameId,
								placement,
							}))
						}
					/>
				) : null}
				{activeTab === "motion" ? (
					<ElementMotionSettings
						defaultState={
							parentFrame?.defaultElementStates?.[element.id] ?? "inactive"
						}
						element={element}
						parentFrame={parentFrame}
						phaseFrame={phaseFrame}
						onChange={commit}
						onDefaultStateChange={(defaultState) => {
							if (!parentFrame) return;
							setTale(
								setDraftFrameChildDefaultState(
									tale,
									{ elementId: element.id, type: "element" },
									defaultState,
								),
								{ reason: "element-default-state" },
							);
						}}
					/>
				) : null}
				{activeTab === "style" ? (
					<div className="space-y-3">
						<StyleSettings
							style={element.style}
							title="Element wrapper style"
							onChange={(style) => commit((item) => ({ ...item, style }))}
						/>
						{element.type === "image" ? (
							<StyleSettings
								appearanceDefaultOpen
								showTypographyControls={false}
								style={element.imageStyle}
								title="Image tag style"
								onChange={(imageStyle) =>
									commit((item) => ({ ...item, imageStyle }))
								}
							/>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
}
