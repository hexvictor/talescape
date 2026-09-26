"use client";

import { FileText, Maximize2, Network, Paintbrush, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import {
	editScene,
	removeDraftScene,
} from "~/app/(tale-app)/(studio)/_shared/services/taleDraftEdits";
import { DebugTabs } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { resolveTaleBreakpoint } from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";
import { getSceneProgressionFrameIds } from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	ResolvedTaleScene,
	TaleScene,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import { Panel } from "~/components/ui/panel";
import { SectionHeader } from "~/components/ui/section-header";
import { useTaleStudio } from "../../../contexts/TaleStudioProvider";
import { useTaleStudioStore } from "../../../hooks/useTaleStudioStore";
import {
	InspectorHeader,
	SceneSizeSettings,
	StyleSettings,
} from "../InspectorFields";
import { NarrativePanel } from "../NarrativePanel";
import { SceneContainerSettings } from "./SceneContainerSettings";
import { SceneDetailsSettings } from "./SceneDetailsSettings";
import { SceneMotionSettings } from "./SceneMotionSettings";
import { SceneTransitionSettings } from "./SceneTransitionSettings";

type SceneInspectorTab =
	| "layout"
	| "motion"
	| "size"
	| "style"
	| "summary"
	| "narrative";

const tabs: {
	icon: React.JSX.Element;
	id: SceneInspectorTab;
	label: string;
}[] = [
	{ icon: <FileText size={15} />, id: "summary", label: "Details" },
	{ icon: <FileText size={15} />, id: "narrative", label: "Narrative" },
	{ icon: <Maximize2 size={15} />, id: "size", label: "Size & placement" },
	{ icon: <Network size={15} />, id: "layout", label: "Frames" },
	{ icon: <Waves size={15} />, id: "motion", label: "Motion" },
	{ icon: <Paintbrush size={15} />, id: "style", label: "Style" },
];

/**
 * Renders scene-only editor controls and subscriptions.
 *
 * @param props - Scene inspector props.
 * @param props.sceneId - Scene selected for editing.
 * @param props.initialFrameId - Optional node to focus when opening the Nodes tab.
 * @param props.initialTab - Optional initial inspector tab.
 * @returns Scene inspector tabs.
 *
 * @example
 * <SceneInspectorPanel sceneId="scene-1" />
 */
export function SceneInspectorPanel({
	sceneId,
	initialFrameId,
	initialTab = "summary",
}: {
	sceneId: string;
	initialFrameId?: string;
	initialTab?: SceneInspectorTab;
}) {
	const { dialogs } = useTaleStudio();
	const scrollApi = useTaleReaderStore((state) => state.scroll.api);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const activeBreakpointId = useTaleAppStore(
		(state) => state.runtime.breakpointId,
	);
	const rememberInspectorTab = useTaleStudioStore(
		(state) => state.studioSelection.rememberInspectorTab,
	);
	const [activeTab, setActiveTab] = useState<SceneInspectorTab>(initialTab);
	const resolvedTale = useMemo(
		() => resolveTaleBreakpoint(tale, activeBreakpointId),
		[activeBreakpointId, tale],
	);
	const scene = resolvedTale.indexMap.scenesById[sceneId];
	if (!scene)
		return <p className="text-foreground/55 text-sm">Scene missing.</p>;

	const commit = (update: (item: ResolvedTaleScene) => TaleScene) => {
		scrollApi?.capturePosition();
		setTale(editScene(tale, scene.id, update, activeBreakpointId), {
			reason: "scene-inspector",
		});
	};

	return (
		<div
			data-reader-component="SceneInspectorPanel"
			data-reader-role="scene-inspector"
			data-studio-component="SceneInspectorPanel"
			data-studio-role="scene-inspector"
			className="studio-inspector -m-3 flex h-full min-h-0 flex-col"
		>
			<div className="shrink-0">
				<InspectorHeader
					subtitle={
						Number(scene.id) < 0 ? "Unsaved scene" : `Scene ${scene.id}`
					}
					title={scene.title}
				/>
				<DebugTabs
					active={activeTab}
					onChange={(tab) => {
						setActiveTab(tab);
						rememberInspectorTab("scene", tab);
					}}
					tabs={tabs}
				/>
			</div>
			<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
				{activeTab === "narrative" ? (
					<NarrativePanel sceneId={sceneId} />
				) : null}
				{activeTab === "summary" ? (
					<>
						<SceneDetailsSettings
							scene={scene}
							onChange={commit}
							onRemove={() =>
								dialogs.confirm({
									confirmLabel: "Remove",
									description: `Remove ${scene.title}? This will be saved when you click Save.`,
									onConfirm: () =>
										setTale(removeDraftScene(tale, scene.id), {
											reason: "scene-draft-remove",
										}),
									title: "Remove Scene",
								})
							}
						/>
						<Panel
							appearance="comic"
							data-studio-component="SceneStructureSection"
							data-studio-role="inspector-section"
							className="mt-3 grid gap-2 p-3"
						>
							<SectionHeader
								title="Scene structure"
								description="Open a Frame to edit its ordered Keyframes, progression, and actions."
								actions={
									<Button
										size="sm"
										variant="ghost"
										onClick={() => {
											setActiveTab("layout");
											rememberInspectorTab("scene", "layout");
										}}
									>
										{getSceneProgressionFrameIds(resolvedTale, scene).length}{" "}
										Frames · {scene.elementIds.length} Elements
									</Button>
								}
							/>
						</Panel>
					</>
				) : null}
				{activeTab === "size" ? (
					<div className="space-y-3">
						<SceneSizeSettings
							size={scene.size}
							onChange={(size) => commit((item) => ({ ...item, size }))}
						/>
						<SceneTransitionSettings scene={scene} onChange={commit} />
					</div>
				) : null}
				{activeTab === "layout" ? (
					<SceneContainerSettings
						scene={scene}
						onChange={(container) => commit((item) => ({ ...item, container }))}
					/>
				) : null}
				{activeTab === "motion" ? (
					<SceneMotionSettings scene={scene} onChange={commit} />
				) : null}
				{activeTab === "style" ? (
					<div className="space-y-4">
						<StyleSettings
							showDisplayControls={false}
							showPositionControls={false}
							style={scene.style}
							title="Scene container style"
							onChange={(style) => commit((item) => ({ ...item, style }))}
						/>
						<SceneContainerSettings
							scene={scene}
							variant="style"
							onChange={(container) =>
								commit((item) => ({ ...item, container }))
							}
						/>
						<details className="border-2 border-foreground bg-card p-3 shadow-[3px_3px_0_var(--comic-teal)]">
							<summary className="cursor-pointer font-black text-[10px] text-primary uppercase tracking-[0.17em]">
								Advanced article wrapper style
							</summary>
							<StyleSettings
								className="mt-3"
								showBoxControls={false}
								showDisplayControls={false}
								showPositionControls={false}
								style={scene.articleStyle}
								title="Article wrapper style"
								onChange={(articleStyle) =>
									commit((item) => ({ ...item, articleStyle }))
								}
							/>
						</details>
					</div>
				) : null}
			</div>
		</div>
	);
}
