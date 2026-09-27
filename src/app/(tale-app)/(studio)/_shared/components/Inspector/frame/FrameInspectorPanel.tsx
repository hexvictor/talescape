"use client";

import {
	ArrowLeftRight,
	Boxes,
	FileText,
	FolderPlus,
	GripVertical,
	ListVideo,
	Paintbrush,
	Plus,
	Repeat,
	Repeat2,
	Trash2,
	Waves,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	type DraftElementInput,
	addDraftElement,
	addDraftGroup,
	addDraftKeyframe,
	editSceneFrames,
	moveDraftFrameChild,
	removeDraftElement,
	removeDraftFrame,
	reorderDraftKeyframes,
	setDraftFrameChildDefaultState,
} from "~/app/(tale-app)/(studio)/_shared/services/taleDraftEdits";
import {
	DebugCard,
	DebugTabs,
	Setting,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { resolveTaleBreakpoint } from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";
import type {
	FrameChild,
	ResolvedTaleKeyframe,
	Tale,
	TaleFrame,
	TaleInspectorTarget,
} from "~/app/(tale-app)/_shared/types";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/overlay/dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import Textarea from "~/components/ui/textarea";
import { useTaleStudio } from "../../../contexts/TaleStudioProvider";
import { useTaleStudioStore } from "../../../hooks/useTaleStudioStore";
import { AnimationSelectionEditor } from "../AnimationSelectionEditor";
import { HoverAnimationEditor } from "../HoverAnimationEditor";
import { ImageUploadSetting } from "../ImageUploadSetting";
import { InspectorHeader, StyleSettings } from "../InspectorFields";
import { NumberSetting } from "../InspectorValueFields";
import {
	LoopingAnimationEditor,
	LoopingAnimationsGroup,
} from "../LoopingAnimationEditor";
import { NarrativePanel } from "../NarrativePanel";
import { ElementThumbnail } from "../element/ElementThumbnail";
import { FrameKeyframeLengthSettings } from "./FrameKeyframeLengthSettings";

type FrameInspectorTab =
	| "narrative"
	| "elements"
	| "motion"
	| "keyframes"
	| "style"
	| "summary";

const tabs = [
	{ icon: <FileText size={15} />, id: "summary", label: "Details" },
	{ icon: <FileText size={15} />, id: "narrative", label: "Narrative" },
	{ icon: <ListVideo size={15} />, id: "keyframes", label: "Keyframes" },
	{ icon: <Boxes size={15} />, id: "elements", label: "Elements" },
	{ icon: <Waves size={15} />, id: "motion", label: "Motion" },
	{ icon: <Paintbrush size={15} />, id: "style", label: "Style" },
] satisfies { icon: React.JSX.Element; id: FrameInspectorTab; label: string }[];

export function FrameInspectorPanel({
	frameId,
	initialTab = "summary",
	returnTarget,
	sceneId,
}: {
	frameId: string;
	initialTab?: FrameInspectorTab;
	returnTarget?: TaleInspectorTarget;
	sceneId: string;
}): React.JSX.Element {
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const breakpointId = useTaleAppStore((state) => state.runtime.breakpointId);
	const { dialogs } = useTaleStudio();
	const openInspector = useTaleStudioStore(
		(state) => state.studioSelection.openInspector,
	);
	const rememberInspectorTab = useTaleStudioStore(
		(state) => state.studioSelection.rememberInspectorTab,
	);
	const [activeTab, setActiveTab] = useState<FrameInspectorTab>(initialTab);
	const [addElementOpen, setAddElementOpen] = useState(false);
	const [draggedChild, setDraggedChild] = useState<FrameChild | null>(null);
	const [draggedKeyframeId, setDraggedKeyframeId] = useState<string | null>(
		null,
	);
	const resolvedTale = useMemo(
		() => resolveTaleBreakpoint(tale, breakpointId),
		[breakpointId, tale],
	);
	const scene = resolvedTale.indexMap.scenesById[sceneId];
	const frame = resolvedTale.indexMap.framesById[frameId];
	if (!scene || !frame)
		return <p className="text-foreground/55 text-sm">Frame missing.</p>;
	const currentTab =
		frame.kind === "group" && activeTab === "keyframes"
			? "elements"
			: activeTab;
	const previousBridgeAvailable = !scene.position.isFirst;
	const nextBridgeAvailable = !scene.position.isLast;

	const frames = scene.frameIds.flatMap((id) => {
		const item = resolvedTale.indexMap.framesById[id];
		return item ? [item] : [];
	});
	const sourceFrameId = frame.id.split(":").at(-1) ?? frame.id;
	const frameKeyframes = scene.keyframeIds
		.flatMap((id): ResolvedTaleKeyframe[] => {
			const item = tale.indexMap.keyframesById[id];
			return item &&
				(item.frameId === frame.id || item.frameId === sourceFrameId)
				? [item]
				: [];
		})
		.sort((left, right) => left.order - right.order);
	const progressionFrameIds = [
		...new Set(
			scene.keyframeIds.flatMap((id) => {
				const keyframe = resolvedTale.indexMap.keyframesById[id];
				return keyframe?.frameId ? [keyframe.frameId] : [];
			}),
		),
	];
	const progressionFrameIndex = progressionFrameIds.findIndex(
		(id) => id === frame.id || id === sourceFrameId,
	);
	const previousFrameBridgeAvailable = progressionFrameIndex > 0;
	const nextFrameBridgeAvailable =
		progressionFrameIndex >= 0 &&
		progressionFrameIndex < progressionFrameIds.length - 1;
	let owningProgressionFrame = frame;
	while (
		owningProgressionFrame.kind === "group" &&
		owningProgressionFrame.parentFrameId
	) {
		const parent =
			resolvedTale.indexMap.framesById[owningProgressionFrame.parentFrameId];
		if (!parent) break;
		owningProgressionFrame = parent;
	}
	const step = frameKeyframes[0];
	const elementIds = collectFrameElementIds(
		frame.id,
		resolvedTale.indexMap.framesById,
	);
	for (const elementId of scene.elementIds) {
		const element = resolvedTale.indexMap.elementsById[elementId];
		if (
			element &&
			isFrameDescendant(
				element.frameId,
				frame.id,
				resolvedTale.indexMap.framesById,
			)
		) {
			elementIds.push(element.id);
		}
	}
	const uniqueElementIds = [...new Set(elementIds)];

	const commitFrame = (next: TaleFrame): void => {
		setTale(
			editSceneFrames(
				tale,
				scene.id,
				frames.map((item) => (item.id === frame.id ? next : item)),
				scene.rootFrameId,
				breakpointId,
			),
			{ reason: "frame-inspector" },
		);
	};
	const addLocalKeyframe = (): void => {
		dialogs.prompt({
			defaultValue: `Keyframe ${frameKeyframes.length + 1}`,
			onConfirm: (title) =>
				setTale(addDraftKeyframe(tale, scene.id, sourceFrameId, title), {
					reason: "keyframe-draft-add",
				}),
			title: "Name this Keyframe",
		});
	};
	const reorderKeyframes = (targetId: string): void => {
		if (!draggedKeyframeId || draggedKeyframeId === targetId) return;
		const orderedIds = frameKeyframes.map((item) => item.id);
		const from = orderedIds.indexOf(draggedKeyframeId);
		const to = orderedIds.indexOf(targetId);
		if (from < 0 || to < 0) return;
		orderedIds.splice(from, 1);
		orderedIds.splice(to, 0, draggedKeyframeId);
		setTale(reorderDraftKeyframes(tale, orderedIds, breakpointId), {
			reason: "keyframe-draft-reorder",
		});
		setDraggedKeyframeId(null);
	};
	const frameTarget: TaleInspectorTarget = {
		id: frame.id,
		initialTab: currentTab,
		returnTarget: returnTarget ?? {
			id: scene.id,
			initialTab: "layout",
			type: "scene",
		},
		sceneId: scene.id,
		type: "frame",
	};
	const frameName = frame.name?.trim() || `Frame ${sourceFrameId}`;
	const changeTab = (tab: FrameInspectorTab): void => {
		setActiveTab(tab);
		rememberInspectorTab("frame", tab);
	};

	return (
		<div
			data-reader-component="FrameInspectorPanel"
			data-reader-role="frame-inspector"
			data-studio-component="FrameInspectorPanel"
			data-studio-role="frame-inspector"
			className="studio-inspector -m-3 flex h-full min-h-0 flex-col"
		>
			<div className="shrink-0">
				<InspectorHeader
					backLabel={`Scene: ${scene.title}`}
					subtitle={`${frameKeyframes.length} Keyframe${frameKeyframes.length === 1 ? "" : "s"}`}
					title={frameName}
					onBack={() =>
						openInspector(
							returnTarget ?? {
								id: scene.id,
								initialTab: "layout",
								type: "scene",
							},
						)
					}
				/>
				<DebugTabs
					active={currentTab}
					studio
					onChange={changeTab}
					tabs={
						frame.kind === "group"
							? tabs.filter((tab) => tab.id !== "keyframes")
							: tabs
					}
				/>
			</div>
			<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
				{currentTab === "narrative" ? (
					<NarrativePanel sceneId={sceneId} frameId={frameId} />
				) : null}
				{currentTab === "summary" ? (
					<section className="tale-ui-panel grid gap-3 p-3">
						<Field label="Frame name">
							<Input
								aria-label="Frame name"
								density="compact"
								value={frame.name ?? ""}
								onChange={(event) =>
									commitFrame({
										...frame,
										name: event.target.value,
									} as TaleFrame)
								}
							/>
						</Field>
						<div className="grid grid-cols-2 gap-2">
							<FrameFact
								label="Children"
								value={String(frame.children.length)}
							/>
							<FrameFact
								label="Elements"
								value={String(uniqueElementIds.length)}
							/>
							<FrameFact
								label="Parent"
								value={frame.parentFrameId ?? "Scene root"}
							/>
							<FrameFact
								label="Keyframes"
								value={String(frameKeyframes.length)}
							/>
						</div>
					</section>
				) : null}
				{currentTab === "keyframes" ? (
					<section className="tale-ui-panel grid gap-2 p-3">
						<div className="flex items-center justify-between gap-2">
							<div>
								<p className="font-black text-xs uppercase">Frame Keyframes</p>
								<p className="text-[10px] text-foreground/45">
									Ordered progression and action points inside this Frame.
								</p>
							</div>
							<Button
								aria-label="Add Keyframe"
								size="icon"
								variant="outline"
								onClick={addLocalKeyframe}
							>
								<Plus size={14} />
							</Button>
						</div>
						{frameKeyframes.map((item, index) => (
							<button
								key={item.id}
								type="button"
								draggable
								data-reader-component="FrameKeyframeRow"
								data-reader-role="frame-keyframe-row"
								data-studio-component="FrameKeyframeRow"
								data-studio-role="frame-keyframe-row"
								className="grid min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-foreground/14 bg-background px-3 text-left transition hover:border-primary hover:bg-primary/8"
								onDragEnd={() => setDraggedKeyframeId(null)}
								onDragOver={(event) => event.preventDefault()}
								onDragStart={() => setDraggedKeyframeId(item.id)}
								onDrop={() => reorderKeyframes(item.id)}
								onClick={() =>
									openInspector({
										id: item.id,
										returnTarget: frameTarget,
										sceneId: scene.id,
										type: "keyframe",
									})
								}
							>
								<span className="grid size-7 place-items-center border border-primary/35 bg-primary/10 font-black text-primary text-xs">
									{index + 1}
								</span>
								<span className="min-w-0">
									<span className="block truncate font-bold text-xs">
										{item.title}
									</span>
									<span className="block truncate text-[10px] text-foreground/45">
										{item.actions.length} actions ·{" "}
										{item.pageId ? "Page" : "Not a page"}
									</span>
								</span>
								<ListVideo size={14} className="text-primary" />
							</button>
						))}
						{frameKeyframes.length === 0 ? (
							<p className="py-5 text-center text-foreground/45 text-xs">
								This Frame has no progression Keyframe yet.
							</p>
						) : null}
						<FrameKeyframeLengthSettings
							keyframes={frameKeyframes}
							progression={frame.progression}
							onChange={(progression) =>
								commitFrame({ ...frame, progression } as TaleFrame)
							}
						/>
					</section>
				) : null}
				{currentTab === "elements" ? (
					<section className="tale-ui-panel grid gap-2 p-3">
						<div className="flex items-center justify-between gap-2">
							<p className="font-black text-xs uppercase">
								{frame.kind === "group" ? "Group contents" : "Frame contents"}
							</p>
							<div className="flex gap-1">
								<Button
									size="icon"
									title="Add group"
									variant="outline"
									onClick={() =>
										dialogs.prompt({
											defaultValue: "Group",
											onConfirm: (name) =>
												setTale(addDraftGroup(tale, scene.id, frame.id, name), {
													reason: "group-draft-add",
												}),
											title: "Name this Group",
										})
									}
								>
									<FolderPlus size={14} />
								</Button>
								<Button
									size="icon"
									title="Add element"
									variant="outline"
									onClick={() => setAddElementOpen(true)}
								>
									<Plus size={14} />
								</Button>
							</div>
						</div>
						<AddElementDialog
							open={addElementOpen}
							onClose={() => setAddElementOpen(false)}
							onCreate={(input) => {
								setTale(addDraftElement(tale, scene.id, frame.id, input), {
									reason: "element-draft-add",
								});
								setAddElementOpen(false);
							}}
						/>
						<FrameContentsTree
							frame={frame}
							framesById={resolvedTale.indexMap.framesById}
							elementsById={resolvedTale.indexMap.elementsById}
							draggedChild={draggedChild}
							onDrag={setDraggedChild}
							onDrop={(targetFrameId) => {
								if (!draggedChild) return;
								setTale(
									moveDraftFrameChild(
										tale,
										scene.id,
										draggedChild,
										targetFrameId,
									),
									{ reason: "frame-child-move" },
								);
								setDraggedChild(null);
							}}
							onOpen={(target) => openInspector(target)}
							onRemove={(child) =>
								dialogs.confirm({
									confirmLabel: "Remove",
									description:
										child.type === "element"
											? "Remove this Element?"
											: "Remove this Group and all of its contents?",
									onConfirm: () =>
										setTale(
											child.type === "element"
												? removeDraftElement(tale, child.elementId)
												: removeDraftFrame(tale, scene.id, child.frameId),
											{ reason: "frame-child-remove" },
										),
									title:
										child.type === "element"
											? "Remove Element"
											: "Remove Group",
								})
							}
							onStateChange={(child, state) =>
								setTale(setDraftFrameChildDefaultState(tale, child, state), {
									reason: "frame-child-default-state",
								})
							}
							returnTarget={frameTarget}
							sceneId={scene.id}
						/>
						{frame.children.length === 0 ? (
							<p className="py-6 text-center text-foreground/45 text-xs">
								No Elements in this Frame.
							</p>
						) : null}
					</section>
				) : null}
				{currentTab === "motion" ? (
					<>
						{frame.kind !== "group" ? (
							<DebugCard title="Frame phases">
								<FramePhaseToggle
									checked={frame.transition?.introEnabled ?? false}
									label="Frame intro transition"
									onChange={(introEnabled) =>
										commitFrame({
											...frame,
											transition: { ...frame.transition, introEnabled },
										} as TaleFrame)
									}
								/>
								{frame.transition?.introEnabled ? (
									<NumberSetting
										label="Frame intro length"
										value={frame.transition.introLength ?? 0}
										onChange={(introLength) =>
											commitFrame({
												...frame,
												transition: { ...frame.transition, introLength },
											} as TaleFrame)
										}
									/>
								) : null}
								<FramePhaseToggle
									checked={frame.transition?.outroEnabled ?? false}
									label="Frame outro transition"
									onChange={(outroEnabled) =>
										commitFrame({
											...frame,
											transition: { ...frame.transition, outroEnabled },
										} as TaleFrame)
									}
								/>
								{frame.transition?.outroEnabled ? (
									<NumberSetting
										label="Frame outro length"
										value={frame.transition.outroLength ?? 0}
										onChange={(outroLength) =>
											commitFrame({
												...frame,
												transition: { ...frame.transition, outroLength },
											} as TaleFrame)
										}
									/>
								) : null}
								{previousFrameBridgeAvailable ? (
									<FrameBridgePhaseFields
										direction="previous"
										frame={frame}
										onChange={commitFrame}
									/>
								) : null}
								{nextFrameBridgeAvailable ? (
									<FrameBridgePhaseFields
										direction="next"
										frame={frame}
										onChange={commitFrame}
									/>
								) : null}
							</DebugCard>
						) : null}
						{frame.kind === "group" && frame.parentFrameId ? (
							<div className="flex items-center justify-between gap-3 border border-foreground/20 p-3 text-xs">
								<span>Default state</span>
								<Select
									aria-label="Group default state"
									value={
										resolvedTale.indexMap.framesById[frame.parentFrameId]
											?.defaultElementStates?.[frame.id] ?? "inactive"
									}
									onValueChange={(value) =>
										setTale(
											setDraftFrameChildDefaultState(
												tale,
												{ frameId: frame.id, type: "frame" },
												value as "active" | "inactive",
											),
											{ reason: "group-default-state" },
										)
									}
								>
									<SelectTrigger density="compact">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="active">Active</SelectItem>
									</SelectContent>
								</Select>
							</div>
						) : null}
						{frame.kind === "group" ? (
							<GroupFramePhaseSettings
								frame={frame}
								ownerFrame={owningProgressionFrame}
								onChange={commitFrame}
							/>
						) : null}
						{previousBridgeAvailable ? (
							<Checkbox
								className="w-full flex-row-reverse justify-between gap-3 border border-foreground/20 p-3 font-normal"
								density="compact"
								isSelected={frame.visibleDuringPreviousBridge ?? false}
								onChange={(visibleDuringPreviousBridge) =>
									commitFrame({ ...frame, visibleDuringPreviousBridge })
								}
							>
								Show during previous Scene bridge transition
							</Checkbox>
						) : null}
						{scene.transition.introEnabled ? (
							<Checkbox
								className="w-full flex-row-reverse justify-between gap-3 border border-foreground/20 p-3 font-normal"
								density="compact"
								isSelected={
									frame.visibleDuringSceneIntro ??
									frame.visibleBeforeIntro ??
									false
								}
								onChange={(visibleDuringSceneIntro) =>
									commitFrame({ ...frame, visibleDuringSceneIntro })
								}
							>
								Show during opening transition
							</Checkbox>
						) : null}
						{nextBridgeAvailable ? (
							<Checkbox
								className="w-full flex-row-reverse justify-between gap-3 border border-foreground/20 p-3 font-normal"
								density="compact"
								isSelected={frame.visibleDuringNextBridge ?? false}
								onChange={(visibleDuringNextBridge) =>
									commitFrame({ ...frame, visibleDuringNextBridge })
								}
							>
								Show during next Scene bridge transition
							</Checkbox>
						) : null}
						{previousBridgeAvailable && frame.visibleDuringPreviousBridge ? (
							<AnimationSelectionEditor
								icon={<ArrowLeftRight size={15} />}
								selection={
									frame.animations.previousBridge ?? { animations: [] }
								}
								title="Previous Scene bridge transitions"
								onChange={(previousBridge) =>
									commitFrame({
										...frame,
										animations: { ...frame.animations, previousBridge },
									} as TaleFrame)
								}
							/>
						) : null}
						{scene.transition.outroEnabled ? (
							<Checkbox
								className="w-full flex-row-reverse justify-between gap-3 border border-foreground/20 p-3 font-normal"
								density="compact"
								isSelected={frame.visibleDuringSceneOutro ?? false}
								onChange={(visibleDuringSceneOutro) =>
									commitFrame({ ...frame, visibleDuringSceneOutro })
								}
							>
								Show during Scene outro transition
							</Checkbox>
						) : null}
						{scene.transition.introEnabled &&
						(frame.visibleDuringSceneIntro ?? frame.visibleBeforeIntro) ? (
							<AnimationSelectionEditor
								defaultOpen
								selection={frame.animations.sceneIntro ?? { animations: [] }}
								title="Opening transitions"
								onChange={(sceneIntro) =>
									commitFrame({
										...frame,
										animations: { ...frame.animations, sceneIntro },
									} as TaleFrame)
								}
							/>
						) : null}
						{scene.transition.outroEnabled && frame.visibleDuringSceneOutro ? (
							<AnimationSelectionEditor
								selection={frame.animations.sceneOutro ?? { animations: [] }}
								title="Scene outro transitions"
								onChange={(sceneOutro) =>
									commitFrame({
										...frame,
										animations: { ...frame.animations, sceneOutro },
									} as TaleFrame)
								}
							/>
						) : null}
						{nextBridgeAvailable && frame.visibleDuringNextBridge ? (
							<AnimationSelectionEditor
								icon={<ArrowLeftRight size={15} />}
								selection={frame.animations.nextBridge ?? { animations: [] }}
								title="Next Scene bridge transitions"
								onChange={(nextBridge) =>
									commitFrame({
										...frame,
										animations: { ...frame.animations, nextBridge },
									} as TaleFrame)
								}
							/>
						) : null}
						{frame.transition?.introEnabled ? (
							<AnimationSelectionEditor
								selection={frame.animations.intro}
								title="Frame intro transitions"
								onChange={(intro) =>
									commitFrame({
										...frame,
										animations: { ...frame.animations, intro },
									} as TaleFrame)
								}
							/>
						) : null}
						<AnimationSelectionEditor
							inheritsPreviousState={
								frame.animations.intro.carryEndStateForward ?? false
							}
							selection={frame.animations.active}
							title="Active transitions"
							onChange={(active) =>
								commitFrame({
									...frame,
									animations: { ...frame.animations, active },
								} as TaleFrame)
							}
						/>
						{previousFrameBridgeAvailable &&
						frame.transition?.previousBridgeEnabled ? (
							<AnimationSelectionEditor
								icon={<ArrowLeftRight size={15} />}
								selection={
									frame.animations.previousFrameBridge ?? { animations: [] }
								}
								title="Previous Frame bridge transitions"
								onChange={(previousFrameBridge) =>
									commitFrame({
										...frame,
										animations: {
											...frame.animations,
											previousFrameBridge,
										},
									} as TaleFrame)
								}
							/>
						) : null}
						{nextFrameBridgeAvailable && frame.transition?.nextBridgeEnabled ? (
							<AnimationSelectionEditor
								icon={<ArrowLeftRight size={15} />}
								selection={
									frame.animations.nextFrameBridge ?? { animations: [] }
								}
								title="Next Frame bridge transitions"
								onChange={(nextFrameBridge) =>
									commitFrame({
										...frame,
										animations: {
											...frame.animations,
											nextFrameBridge,
										},
									} as TaleFrame)
								}
							/>
						) : null}
						{frame.transition?.outroEnabled ? (
							<AnimationSelectionEditor
								inheritsPreviousState={
									frame.animations.active.carryEndStateForward ?? false
								}
								selection={frame.animations.outro}
								title="Frame outro transitions"
								onChange={(outro) =>
									commitFrame({
										...frame,
										animations: { ...frame.animations, outro },
									} as TaleFrame)
								}
							/>
						) : null}
						<LoopingAnimationsGroup>
							<LoopingAnimationEditor
								icon={<Repeat2 size={15} />}
								title="General looping animation"
								selection={frame.animations.ambient}
								onChange={(ambient) =>
									commitFrame({
										...frame,
										animations: { ...frame.animations, ambient },
									} as TaleFrame)
								}
							/>
							{previousBridgeAvailable && frame.visibleDuringPreviousBridge ? (
								<LoopingAnimationEditor
									icon={<ArrowLeftRight size={15} />}
									title="Previous Scene bridge looping animation"
									selection={frame.animations.previousBridgeLoop ?? emptyLoop()}
									onChange={(previousBridgeLoop) =>
										commitFrame({
											...frame,
											animations: { ...frame.animations, previousBridgeLoop },
										} as TaleFrame)
									}
								/>
							) : null}
							{previousFrameBridgeAvailable &&
							frame.transition?.previousBridgeEnabled ? (
								<LoopingAnimationEditor
									icon={<ArrowLeftRight size={15} />}
									title="Previous Frame bridge looping animation"
									selection={
										frame.animations.previousFrameBridgeLoop ?? emptyLoop()
									}
									onChange={(previousFrameBridgeLoop) =>
										commitFrame({
											...frame,
											animations: {
												...frame.animations,
												previousFrameBridgeLoop,
											},
										} as TaleFrame)
									}
								/>
							) : null}
							{frame.transition?.introEnabled ? (
								<LoopingAnimationEditor
									title="Frame intro looping animation"
									selection={frame.animations.introLoop ?? emptyLoop()}
									onChange={(introLoop) =>
										commitFrame({
											...frame,
											animations: { ...frame.animations, introLoop },
										} as TaleFrame)
									}
								/>
							) : null}
							{nextBridgeAvailable && frame.visibleDuringNextBridge ? (
								<LoopingAnimationEditor
									icon={<ArrowLeftRight size={15} />}
									title="Next Scene bridge looping animation"
									selection={frame.animations.nextBridgeLoop ?? emptyLoop()}
									onChange={(nextBridgeLoop) =>
										commitFrame({
											...frame,
											animations: { ...frame.animations, nextBridgeLoop },
										} as TaleFrame)
									}
								/>
							) : null}
							{nextFrameBridgeAvailable &&
							frame.transition?.nextBridgeEnabled ? (
								<LoopingAnimationEditor
									icon={<ArrowLeftRight size={15} />}
									title="Next Frame bridge looping animation"
									selection={
										frame.animations.nextFrameBridgeLoop ?? emptyLoop()
									}
									onChange={(nextFrameBridgeLoop) =>
										commitFrame({
											...frame,
											animations: {
												...frame.animations,
												nextFrameBridgeLoop,
											},
										} as TaleFrame)
									}
								/>
							) : null}
							<LoopingAnimationEditor
								icon={<Repeat size={15} />}
								title="Active looping animation"
								selection={frame.animations.activeLoop ?? emptyLoop()}
								onChange={(activeLoop) =>
									commitFrame({
										...frame,
										animations: { ...frame.animations, activeLoop },
									} as TaleFrame)
								}
							/>
							{frame.transition?.outroEnabled ? (
								<LoopingAnimationEditor
									title="Frame outro looping animation"
									selection={frame.animations.outroLoop ?? emptyLoop()}
									onChange={(outroLoop) =>
										commitFrame({
											...frame,
											animations: { ...frame.animations, outroLoop },
										} as TaleFrame)
									}
								/>
							) : null}
							<HoverAnimationEditor
								selection={
									frame.animations.hover ?? {
										animations: [],
										durationSeconds: 0.2,
									}
								}
								onChange={(hover) =>
									commitFrame({
										...frame,
										animations: { ...frame.animations, hover },
									} as TaleFrame)
								}
							/>
						</LoopingAnimationsGroup>
					</>
				) : null}
				{currentTab === "style" ? (
					<div className="space-y-3">
						<section className="tale-ui-panel grid gap-3 p-3 text-xs">
							<div>
								<p className="font-black text-xs uppercase">Frame container</p>
								<p className="mt-1 text-[10px] text-foreground/48">
									Controls how this Frame arranges its child Frames and
									Elements.
								</p>
							</div>
							<div className="grid min-w-0 grid-cols-1 gap-3">
								<FrameSelect
									label="Display"
									options={[
										{ label: "Stack", value: "stack" },
										{ label: "Flex", value: "flex" },
										{ label: "Grid", value: "grid" },
										{ label: "Free", value: "free" },
									]}
									value={frame.mode}
									onChange={(mode) =>
										commitFrame(
											changeFrameMode(frame, mode as TaleFrame["mode"]),
										)
									}
								/>
								<FrameSelect
									label="Overflow"
									options={[
										{ label: "Visible", value: "visible" },
										{ label: "Clip", value: "clip" },
									]}
									value={frame.overflow ?? "visible"}
									onChange={(overflow) =>
										commitFrame({ ...frame, overflow } as TaleFrame)
									}
								/>
								{frame.mode === "flex" ? (
									<>
										<FrameSelect
											label="Direction"
											options={[
												{ label: "Row", value: "row" },
												{ label: "Column", value: "column" },
											]}
											value={frame.direction ?? "row"}
											onChange={(direction) =>
												commitFrame({ ...frame, direction } as TaleFrame)
											}
										/>
										<FrameNumberInput
											label="Gap"
											value={frame.gap ?? 0}
											onChange={(gap) =>
												commitFrame({ ...frame, gap } as TaleFrame)
											}
										/>
									</>
								) : null}
								{frame.mode === "grid" ? (
									<>
										<FrameNumberInput
											label="Columns"
											value={frame.columns ?? 2}
											min={1}
											onChange={(columns) =>
												commitFrame({
													...frame,
													columns: Math.max(1, columns),
												} as TaleFrame)
											}
										/>
										<FrameNumberInput
											label="Gap"
											value={frame.gap ?? 0}
											onChange={(gap) =>
												commitFrame({ ...frame, gap } as TaleFrame)
											}
										/>
									</>
								) : null}
							</div>
						</section>
						<StyleSettings
							layoutMode={frame.mode}
							style={frame.style}
							title="Frame style"
							onChange={(style) =>
								commitFrame({ ...frame, style } as TaleFrame)
							}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}

function FrameContentsTree({
	draggedChild,
	elementsById,
	frame,
	framesById,
	onDrag,
	onDrop,
	onOpen,
	onRemove,
	onStateChange,
	returnTarget,
	sceneId,
}: {
	draggedChild: FrameChild | null;
	elementsById: Tale["indexMap"]["elementsById"];
	frame: TaleFrame;
	framesById: Tale["indexMap"]["framesById"];
	onDrag: (child: FrameChild | null) => void;
	onDrop: (frameId: string) => void;
	onOpen: (target: TaleInspectorTarget) => void;
	onRemove: (child: FrameChild) => void;
	onStateChange: (child: FrameChild, state: "active" | "inactive") => void;
	returnTarget: TaleInspectorTarget;
	sceneId: string;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="FrameContentsTree"
			data-reader-role="frame-contents-tree"
			data-studio-component="FrameContentsTree"
			data-studio-role="frame-contents-tree"
			className="grid min-h-8 gap-2"
			onDragOver={(event) => event.preventDefault()}
			onDrop={(event) => {
				event.preventDefault();
				event.stopPropagation();
				if (draggedChild) onDrop(frame.id);
			}}
		>
			{frame.children.map((child) => {
				const id = child.type === "element" ? child.elementId : child.frameId;
				const group =
					child.type === "frame" ? framesById[child.frameId] : undefined;
				const element =
					child.type === "element" ? elementsById[child.elementId] : undefined;
				if (!group && !element) return null;
				const state = frame.defaultElementStates?.[id] ?? "inactive";
				return (
					<div
						key={`${child.type}:${id}`}
						draggable
						className="grid gap-2 border border-foreground/14 bg-background p-2 text-xs"
						onDragEnd={() => onDrag(null)}
						onDragStart={(event) => {
							event.stopPropagation();
							onDrag(child);
						}}
					>
						<div className="flex min-w-0 items-center gap-2">
							<GripVertical size={14} className="shrink-0 text-foreground/35" />
							{element ? (
								<ElementThumbnail element={element} />
							) : (
								<Boxes size={18} />
							)}
							<Button
								className="h-auto min-w-0 flex-1 justify-start border-0 p-0 text-left font-normal normal-case hover:text-primary"
								motion="flat"
								variant="ghost"
								onClick={() =>
									onOpen({
										id,
										returnTarget,
										sceneId,
										type: element ? "element" : "frame",
									})
								}
							>
								<span className="min-w-0 flex-1">
									<span className="block truncate font-bold">
										{element?.label ?? group?.name ?? "Group"}
									</span>
									<span className="block text-[9px] text-foreground/42 uppercase">
										{element?.type ?? "group"}
									</span>
								</span>
							</Button>
							<Select
								aria-label={`${element?.label ?? group?.name ?? "Group"} default state`}
								value={state}
								onValueChange={(value) =>
									onStateChange(child, value as "active" | "inactive")
								}
							>
								<SelectTrigger density="compact">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="active">Active</SelectItem>
								</SelectContent>
							</Select>
							<Button
								size="icon"
								title={`Remove ${element ? "element" : "group"}`}
								variant="ghost"
								onClick={() => onRemove(child)}
							>
								<Trash2 size={14} />
							</Button>
						</div>
						{group ? (
							<div className="ml-5 border-foreground/15 border-l pl-2">
								<FrameContentsTree
									draggedChild={draggedChild}
									elementsById={elementsById}
									frame={group}
									framesById={framesById}
									onDrag={onDrag}
									onDrop={onDrop}
									onOpen={onOpen}
									onRemove={onRemove}
									onStateChange={onStateChange}
									returnTarget={returnTarget}
									sceneId={sceneId}
								/>
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
}

function AddElementDialog({
	onClose,
	onCreate,
	open,
}: {
	onClose: () => void;
	onCreate: (input: DraftElementInput) => void;
	open: boolean;
}): React.JSX.Element | null {
	const [type, setType] = useState<DraftElementInput["type"]>("text");
	const [label, setLabel] = useState("Text element");
	const [text, setText] = useState("Text element");
	const [imageUrl, setImageUrl] = useState("");
	const [fallbackUrl, setFallbackUrl] = useState("");
	const [alt, setAlt] = useState("");
	const [caption, setCaption] = useState("");
	const [audioUrl, setAudioUrl] = useState("");

	const changeType = (nextType: DraftElementInput["type"]): void => {
		setType(nextType);
		const defaultLabel =
			nextType === "image"
				? "Image element"
				: nextType === "audio"
					? "Audio element"
					: "Text element";
		setLabel(defaultLabel);
		if (nextType === "text" && !text.trim()) setText(defaultLabel);
	};
	const submit = (): void => {
		if (type === "image") {
			onCreate({
				alt,
				caption,
				fallbackSrc: fallbackUrl,
				label,
				src: imageUrl,
				type,
			});
			return;
		}
		if (type === "audio") {
			onCreate({ label, src: audioUrl, type });
			return;
		}
		onCreate({ label, text, type });
	};
	const canCreate =
		label.trim().length > 0 &&
		(type === "text" ? text.trim().length > 0 : true);

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="max-h-[min(720px,calc(100dvh-2rem))] max-w-lg overflow-y-auto p-5 shadow-[9px_9px_0_var(--comic-teal)]"
			>
				<DialogHeader>
					<DialogTitle>Add Element</DialogTitle>
				</DialogHeader>
				<div className="mt-4 grid gap-3">
					<Field label="Element type">
						<Select
							aria-label="Element type"
							value={type}
							onValueChange={(value) =>
								changeType(value as DraftElementInput["type"])
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="text">Text</SelectItem>
								<SelectItem value="image">Image</SelectItem>
								<SelectItem value="audio">Audio</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<Field label="Element name">
						<Input
							aria-label="Element name"
							value={label}
							onChange={(event) => setLabel(event.target.value)}
						/>
					</Field>
					{type === "text" ? (
						<Field label="Text">
							<Textarea
								aria-label="Text"
								className="min-h-28 resize-y"
								value={text}
								onChange={(event) => setText(event.target.value)}
							/>
						</Field>
					) : null}
					{type === "image" ? (
						<>
							<ImageUploadSetting
								label="Image URL"
								value={imageUrl}
								onChange={setImageUrl}
							/>
							<Field label="Fallback URL">
								<Input
									aria-label="Fallback URL"
									value={fallbackUrl}
									onChange={(event) => setFallbackUrl(event.target.value)}
								/>
							</Field>
							<Field label="Alt text">
								<Input
									aria-label="Alt text"
									value={alt}
									onChange={(event) => setAlt(event.target.value)}
								/>
							</Field>
							<Field label="Caption">
								<Textarea
									aria-label="Caption"
									className="min-h-20 resize-y"
									value={caption}
									onChange={(event) => setCaption(event.target.value)}
								/>
							</Field>
						</>
					) : null}
					{type === "audio" ? (
						<Field label="Audio URL">
							<Input
								aria-label="Audio URL"
								value={audioUrl}
								onChange={(event) => setAudioUrl(event.target.value)}
							/>
						</Field>
					) : null}
				</div>
				<DialogFooter className="mt-5">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button disabled={!canCreate} type="button" onClick={submit}>
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function emptyLoop() {
	return {
		animations: [],
		cycleDurationMs: 2400,
		playback: "alternate" as const,
	};
}

function FramePhaseToggle({
	checked,
	label,
	onChange,
}: {
	checked: boolean;
	label: string;
	onChange: (checked: boolean) => void;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<Checkbox
				aria-label={label}
				density="compact"
				isSelected={checked}
				onChange={onChange}
			/>
		</Setting>
	);
}

function FrameBridgePhaseFields({
	direction,
	frame,
	onChange,
}: {
	direction: "next" | "previous";
	frame: TaleFrame;
	onChange: (frame: TaleFrame) => void;
}): React.JSX.Element {
	const enabledKey =
		direction === "previous" ? "previousBridgeEnabled" : "nextBridgeEnabled";
	const lengthKey =
		direction === "previous" ? "previousBridgeLength" : "nextBridgeLength";
	const enabled = frame.transition?.[enabledKey] ?? false;
	const label = direction === "previous" ? "Previous" : "Next";
	return (
		<>
			<FramePhaseToggle
				checked={enabled}
				label={`${label} Frame bridge transition`}
				onChange={(checked) =>
					onChange({
						...frame,
						transition: { ...frame.transition, [enabledKey]: checked },
					} as TaleFrame)
				}
			/>
			{enabled ? (
				<NumberSetting
					label={`${label} Frame bridge length`}
					value={frame.transition?.[lengthKey] ?? 0}
					onChange={(length) =>
						onChange({
							...frame,
							transition: { ...frame.transition, [lengthKey]: length },
						} as TaleFrame)
					}
				/>
			) : null}
		</>
	);
}

function GroupFramePhaseSettings({
	frame,
	onChange,
	ownerFrame,
}: {
	frame: TaleFrame;
	onChange: (frame: TaleFrame) => void;
	ownerFrame: TaleFrame;
}): React.JSX.Element | null {
	const phases = [
		{
			enabled: ownerFrame.transition?.introEnabled === true,
			label: "Frame intro",
			selectionKey: "frameIntro",
			visibilityKey: "visibleDuringFrameIntro",
		},
		{
			enabled: ownerFrame.transition?.previousBridgeEnabled === true,
			label: "Previous Frame bridge",
			selectionKey: "previousFrameBridge",
			visibilityKey: "visibleDuringPreviousFrameBridge",
		},
		{
			enabled: ownerFrame.transition?.outroEnabled === true,
			label: "Frame outro",
			selectionKey: "frameOutro",
			visibilityKey: "visibleDuringFrameOutro",
		},
		{
			enabled: ownerFrame.transition?.nextBridgeEnabled === true,
			label: "Next Frame bridge",
			selectionKey: "nextFrameBridge",
			visibilityKey: "visibleDuringNextFrameBridge",
		},
	] as const;
	const available = phases.filter((phase) => phase.enabled);
	if (available.length === 0) return null;
	return (
		<DebugCard title="Parent Frame phases">
			{available.map((phase) => {
				const visible = frame[phase.visibilityKey] === true;
				return (
					<div key={phase.visibilityKey} className="contents">
						<FramePhaseToggle
							checked={visible}
							label={`Show during ${phase.label}`}
							onChange={(checked) =>
								onChange({
									...frame,
									[phase.visibilityKey]: checked,
								} as TaleFrame)
							}
						/>
						{visible ? (
							<AnimationSelectionEditor
								icon={<ArrowLeftRight size={15} />}
								selection={
									frame.animations[phase.selectionKey] ?? { animations: [] }
								}
								title={`${phase.label} transitions`}
								onChange={(selection) =>
									onChange({
										...frame,
										animations: {
											...frame.animations,
											[phase.selectionKey]: selection,
										},
									} as TaleFrame)
								}
							/>
						) : null}
					</div>
				);
			})}
		</DebugCard>
	);
}

function FrameFact({ label, value }: { label: string; value: string }) {
	return (
		<div className="border border-foreground/10 bg-foreground/[0.025] p-2">
			<p className="font-bold text-[9px] text-foreground/42 uppercase">
				{label}
			</p>
			<p className="mt-1 truncate text-foreground text-xs">{value}</p>
		</div>
	);
}

function FrameSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: readonly { label: string; value: string }[];
	value: string;
}) {
	return (
		<Field label={label}>
			<Select aria-label={label} value={value} onValueChange={onChange}>
				<SelectTrigger density="compact" className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Field>
	);
}

function FrameNumberInput({
	label,
	min = 0,
	onChange,
	value,
}: {
	label: string;
	min?: number;
	onChange: (value: number) => void;
	value: number;
}) {
	return (
		<Field label={label}>
			<Input
				aria-label={label}
				density="compact"
				min={min}
				type="number"
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</Field>
	);
}

function collectFrameElementIds(
	frameId: string,
	framesById: Record<string, TaleFrame>,
): string[] {
	const ids: string[] = [];
	const visited = new Set<string>();
	const visit = (id: string): void => {
		if (visited.has(id)) return;
		visited.add(id);
		for (const child of framesById[id]?.children ?? []) {
			if (child.type === "element") ids.push(child.elementId);
			else visit(child.frameId);
		}
	};
	visit(frameId);
	return [...new Set(ids)];
}

function isFrameDescendant(
	frameId: string | null,
	ancestorId: string,
	framesById: Record<string, TaleFrame>,
): boolean {
	let currentId = frameId;
	const visited = new Set<string>();
	while (currentId && !visited.has(currentId)) {
		if (currentId === ancestorId) return true;
		visited.add(currentId);
		currentId = framesById[currentId]?.parentFrameId ?? null;
	}
	return false;
}

function changeFrameMode(frame: TaleFrame, mode: TaleFrame["mode"]): TaleFrame {
	const base = {
		animations: frame.animations,
		children: frame.children,
		defaultElementStates: frame.defaultElementStates,
		id: frame.id,
		kind: frame.kind,
		name: frame.name,
		overflow: frame.overflow,
		parentFrameId: frame.parentFrameId,
		style: frame.style,
		transition: frame.transition,
		visibleBeforeIntro: frame.visibleBeforeIntro,
		visibleBeforeFrameIntro: frame.visibleBeforeFrameIntro,
		visibleDuringFrameIntro: frame.visibleDuringFrameIntro,
		visibleDuringFrameOutro: frame.visibleDuringFrameOutro,
		visibleDuringPreviousFrameBridge: frame.visibleDuringPreviousFrameBridge,
		visibleDuringNextFrameBridge: frame.visibleDuringNextFrameBridge,
		visibleDuringSceneIntro: frame.visibleDuringSceneIntro,
		visibleDuringSceneOutro: frame.visibleDuringSceneOutro,
		visibleDuringPreviousBridge: frame.visibleDuringPreviousBridge,
		visibleDuringNextBridge: frame.visibleDuringNextBridge,
	};
	if (mode === "flex") return { ...base, direction: "column", gap: 16, mode };
	if (mode === "grid") return { ...base, columns: 2, gap: 16, mode };
	if (mode === "free") return { ...base, mode };
	return { ...base, align: "center", gap: 16, justify: "center", mode };
}
