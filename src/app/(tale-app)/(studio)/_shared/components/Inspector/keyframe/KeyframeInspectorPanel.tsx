"use client";

import {
	ArrowDownToLine,
	ArrowUpFromLine,
	Boxes,
	Layers,
	MousePointer2,
	Plus,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { DebugTabs } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { resolveTaleBreakpoint } from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";
import type {
	KeyframeAction,
	ResolvedTaleElement,
	ResolvedTaleKeyframe,
	Tale,
	TaleInspectorTarget,
	TaleKeyframe,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import { SearchField } from "~/components/ui/search-field";
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
import {
	editKeyframe,
	removeDraftKeyframe,
} from "../../../services/taleDraftEdits";
import { AnimationSelectionEditor } from "../AnimationSelectionEditor";
import { FrameProgressionSettings } from "../FrameSettings";
import { InspectorHeader } from "../InspectorFields";
import { NarrativePanel } from "../NarrativePanel";
import { ElementThumbnail } from "../element/ElementThumbnail";

const CONTINUE_PAGE_VALUE = "__continue_page__";

type KeyframeActionTarget = {
	element?: ResolvedTaleElement;
	id: string;
	kind: "element" | "group";
	label: string;
	type: "element" | "frame";
};

export function KeyframeInspectorPanel({
	sceneId,
	keyframeId,
	returnTarget,
}: {
	sceneId: string;
	keyframeId: string;
	returnTarget?: TaleInspectorTarget;
}): React.JSX.Element {
	const { dialogs } = useTaleStudio();
	const { setTale, tale, breakpointId } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
		breakpointId: state.runtime.breakpointId,
	}));
	const openInspector = useTaleStudioStore(
		(state) => state.studioSelection.openInspector,
	);
	const [activeTab, setActiveTab] = useState<
		"actions" | "details" | "motion" | "progression" | "narrative"
	>("actions");
	const [actionType, setActionType] =
		useState<KeyframeAction["type"]>("active");
	const [filter, setFilter] = useState<"all" | "element" | "group">("all");
	const [query, setQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
	const resolved = resolveTaleBreakpoint(tale, breakpointId);
	const keyframe = resolved.indexMap.keyframesById[keyframeId];
	const scene = resolved.indexMap.scenesById[sceneId];
	if (!keyframe || !scene) return <p>Keyframe unavailable.</p>;
	const frameId = keyframe.frameId;
	const keyframeTarget: TaleInspectorTarget = {
		id: keyframe.id,
		returnTarget,
		sceneId,
		type: "keyframe",
	};
	const siblings = scene.keyframeIds.filter(
		(id) => resolved.indexMap.keyframesById[id]?.frameId === frameId,
	);
	const commit = (update: (item: ResolvedTaleKeyframe) => TaleKeyframe) =>
		setTale(editKeyframe(tale, keyframeId, update, breakpointId), {
			reason: "keyframe-inspector",
		});
	const elements = scene.elementIds.flatMap((id) => {
		const item = resolved.indexMap.elementsById[id];
		return item &&
			(item.frameId === frameId ||
				item.placement.frameId === frameId ||
				(item.frameId &&
					isFrameInside(item.frameId, frameId, resolved.indexMap.framesById)))
			? [item]
			: [];
	});
	const groups = scene.frameIds.flatMap((id) => {
		const item = resolved.indexMap.framesById[id];
		return item?.kind === "group" &&
			isFrameInside(item.id, frameId, resolved.indexMap.framesById)
			? [item]
			: [];
	});
	const targets: KeyframeActionTarget[] = [
		...groups.map((group) => ({
			id: group.id,
			label: group.name?.trim() || "Group",
			type: "frame" as const,
			kind: "group" as const,
		})),
		...elements.map((element) => ({
			id: element.id,
			label: element.label ?? `${element.type} ${element.id}`,
			type: "element" as const,
			kind: "element" as const,
			element,
		})),
	];
	const actionFor = (id: string, targetType: KeyframeAction["targetType"]) =>
		keyframe.actions.find(
			(action) => action.targetType === targetType && action.targetId === id,
		);
	const updateAction = (
		id: string,
		targetType: KeyframeAction["targetType"],
		changes: Partial<KeyframeAction>,
	) =>
		commit((item) => {
			const previous = item.actions.find(
				(action) => action.targetId === id && action.targetType === targetType,
			);
			const next: KeyframeAction = {
				id: previous?.id ?? `${keyframeId}:${id}`,
				targetId: id,
				targetType,
				type: "inactive",
				...previous,
				...changes,
			};
			return {
				...item,
				actions: [
					...item.actions.filter(
						(action) =>
							action.targetId !== id || action.targetType !== targetType,
					),
					next,
				],
			};
		});
	const removeAction = (action: KeyframeAction) =>
		commit((item) => ({
			...item,
			actions: item.actions.filter((candidate) => candidate.id !== action.id),
		}));
	const visibleTargets = targets.filter(
		(target) =>
			(filter === "all" || target.kind === filter) &&
			target.label.toLowerCase().includes(query.trim().toLowerCase()) &&
			!actionFor(target.id, target.type),
	);
	return (
		<div
			data-reader-component="KeyframeInspectorPanel"
			data-reader-role="keyframe-inspector"
			data-studio-component="KeyframeInspectorPanel"
			data-studio-role="keyframe-inspector"
			className="studio-inspector -m-3 flex h-full min-h-0 flex-col"
		>
			<InspectorHeader
				title={keyframe.title}
				subtitle={`Keyframe ${siblings.indexOf(keyframeId) + 1} of ${siblings.length}`}
				backLabel="Frame"
				onBack={() =>
					openInspector(
						returnTarget ??
							(frameId
								? {
										id: frameId,
										initialTab: "keyframes",
										sceneId,
										type: "frame",
									}
								: { id: sceneId, initialTab: "layout", type: "scene" }),
					)
				}
			/>
			<DebugTabs
				active={activeTab}
				studio
				onChange={setActiveTab}
				tabs={[
					{ id: "narrative", label: "Narrative", icon: <Layers size={14} /> },
					{ id: "actions", label: "Actions", icon: <Sparkles size={14} /> },
					{ id: "motion", label: "Motion", icon: <MousePointer2 size={14} /> },
					{
						id: "progression",
						label: "Progression",
						icon: <Layers size={14} />,
					},
					{ id: "details", label: "Details", icon: <Boxes size={14} /> },
				]}
			/>
			<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
				{activeTab === "narrative" ? (
					<NarrativePanel keyframeId={keyframeId} />
				) : null}
				{activeTab === "details" ? (
					<>
						<Section title="Details">
							<Field label="Name">
								<Input
									aria-label="Name"
									density="compact"
									className="w-full"
									value={keyframe.title}
									onChange={(e) =>
										commit((item) => ({ ...item, title: e.target.value }))
									}
								/>
							</Field>
							<Field label="Description">
								<Textarea
									aria-label="Description"
									density="compact"
									className="min-h-16 w-full"
									value={keyframe.description ?? ""}
									onChange={(e) =>
										commit((item) => ({ ...item, description: e.target.value }))
									}
								/>
							</Field>
							<Field label="Branch">
								<Select
									aria-label="Branch"
									value={keyframe.branchId}
									onValueChange={(branchId) =>
										commit((item) => ({ ...item, branchId }))
									}
								>
									<SelectTrigger density="compact" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{tale.order.branchIds.map((id) => (
											<SelectItem key={id} value={id}>
												{tale.indexMap.branchesById[id]?.title ??
													`Branch ${id}`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</Section>
						<Section title="Page marker">
							<Select
								aria-label="Page marker"
								value={keyframe.pageId ?? CONTINUE_PAGE_VALUE}
								onValueChange={(pageId) =>
									commit((item) => ({
										...item,
										pageId: pageId === CONTINUE_PAGE_VALUE ? null : pageId,
									}))
								}
							>
								<SelectTrigger density="compact" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={CONTINUE_PAGE_VALUE}>
										Continue current page
									</SelectItem>
									{tale.order.pageIds.map((id) => {
										const page = tale.indexMap.pagesById[id];
										return (
											<SelectItem key={id} value={id}>
												{page?.title ?? `Page ${id}`} /{" "}
												{page
													? tale.indexMap.entriesById[page.entryId]?.title
													: ""}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</Section>
						<div className="grid gap-2">
							<Button
								variant="destructive"
								disabled={siblings.length <= 1}
								onClick={() => {
									dialogs.confirm({
										confirmLabel: "Remove",
										description: `Remove ${keyframe.title}?`,
										onConfirm: () =>
											setTale(removeDraftKeyframe(tale, sceneId, keyframeId), {
												reason: "keyframe-draft-remove",
											}),
										title: "Remove Keyframe",
									});
								}}
							>
								<Trash2 size={14} />
								Remove
							</Button>
						</div>
					</>
				) : null}
				{activeTab === "progression" ? (
					<FrameProgressionSettings
						step={keyframe}
						title="Keyframe progression"
						onChange={commit}
					/>
				) : null}
				{activeTab === "motion" ? (
					<KeyframeActionMotionSettings
						actions={keyframe.actions}
						onOpenTarget={(target) =>
							onOpenActionTarget(openInspector, target, sceneId, keyframeTarget)
						}
						onRemoveAction={removeAction}
						onUpdateAction={updateAction}
						targets={targets}
					/>
				) : null}
				{activeTab === "actions" ? (
					<>
						<section className="tale-ui-panel grid gap-3 p-3">
							<div>
								<p className="font-black text-xs uppercase">Add actions</p>
								<p className="text-[10px] text-foreground/45">
									Entities without an action continue their previous state.
								</p>
							</div>
							<div className="grid grid-cols-4 gap-1">
								{(["active", "intro", "outro", "inactive"] as const).map(
									(type) => (
										<Button
											key={type}
											size="sm"
											variant={actionType === type ? "default" : "outline"}
											onClick={() => setActionType(type)}
										>
											{type === "active"
												? "Activate"
												: type === "inactive"
													? "Deactivate"
													: type}
										</Button>
									),
								)}
							</div>
							<div className="flex gap-2">
								<SearchField
									aria-label="Search elements and groups"
									className="min-w-0 flex-1"
									density="compact"
									placeholder="Search"
									value={query}
									onChange={setQuery}
								/>
								<Select
									aria-label="Filter action targets"
									value={filter}
									onValueChange={(value) => setFilter(value as typeof filter)}
								>
									<SelectTrigger density="compact">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="element">Elements</SelectItem>
										<SelectItem value="group">Groups</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="max-h-52 overflow-y-auto border">
								{visibleTargets.map((target) => (
									<Checkbox
										key={`${target.type}:${target.id}`}
										className="flex w-full items-center gap-2 border-foreground/10 border-b p-2 last:border-0"
										density="compact"
										isSelected={selectedIds.includes(target.id)}
										onChange={(selected) =>
											setSelectedIds((current) =>
												selected
													? [...current, target.id]
													: current.filter((id) => id !== target.id),
											)
										}
									>
										{"element" in target && target.element ? (
											<ElementThumbnail element={target.element} />
										) : (
											<Boxes size={18} />
										)}
										<span className="min-w-0 flex-1 truncate">
											{target.label}
										</span>
										<span className="text-[9px] text-foreground/45 uppercase">
											{target.kind}
										</span>
									</Checkbox>
								))}
								{visibleTargets.length === 0 ? (
									<p className="p-4 text-center text-foreground/45">
										No matching entities.
									</p>
								) : null}
							</div>
							<Button
								disabled={selectedIds.length === 0}
								onClick={() => {
									commit((item) => ({
										...item,
										actions: [
											...item.actions,
											...selectedIds.flatMap((id) => {
												const target = targets.find(
													(candidate) => candidate.id === id,
												);
												return target
													? [
															{
																id: `${keyframeId}:${target.type}:${id}`,
																targetId: id,
																targetType: target.type,
																type: actionType,
															} satisfies KeyframeAction,
														]
													: [];
											}),
										],
									}));
									setSelectedIds([]);
								}}
							>
								<Plus size={14} /> Add {selectedIds.length || "selected"} action
								{selectedIds.length === 1 ? "" : "s"}
							</Button>
						</section>
						<section className="grid gap-2">
							{keyframe.actions.map((action) => {
								const target = targets.find(
									(candidate) =>
										candidate.id === action.targetId &&
										candidate.type === action.targetType,
								);
								if (!target) return null;
								const audio =
									"element" in target &&
									target.element !== undefined &&
									(target.element.type === "audio" ||
										target.element.type === "soundCue");
								const options = audio
									? ["inactive", "play", "pause", "stop"]
									: getActionTypeOptions(action.type);
								const expandable = isActionAnimationEditable(
									action.type,
									audio,
								);
								return (
									<div key={action.id} className="tale-ui-panel grid gap-2 p-3">
										<div className="flex items-center gap-2">
											{"element" in target && target.element ? (
												<ElementThumbnail element={target.element} />
											) : (
												<Boxes size={18} />
											)}
											<Button
												className="h-auto min-w-0 flex-1 justify-start border-0 p-0 text-left font-normal normal-case"
												motion="flat"
												variant="ghost"
												onClick={() =>
													onOpenActionTarget(
														openInspector,
														target,
														sceneId,
														keyframeTarget,
													)
												}
											>
												<span className="min-w-0 flex-1">
													<span className="block truncate font-bold">
														{target.label}
													</span>
													<span className="block text-[9px] text-foreground/45 uppercase">
														{target.kind}
													</span>
												</span>
											</Button>
											<Select
												aria-label={`Action type for ${target.label}`}
												value={action.type}
												onValueChange={(type) =>
													updateAction(action.targetId, action.targetType, {
														type: type as KeyframeAction["type"],
													})
												}
											>
												<SelectTrigger density="compact">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{options.map((option) => (
														<SelectItem key={option} value={option}>
															{option}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{expandable ? (
												<Button
													size="icon"
													title="Edit animation"
													variant="outline"
													onClick={() =>
														setExpandedActionId(
															expandedActionId === action.id ? null : action.id,
														)
													}
												>
													<Sparkles size={14} />
												</Button>
											) : null}
											<Button
												size="icon"
												title="Remove action"
												variant="ghost"
												onClick={() => removeAction(action)}
											>
												<X size={14} />
											</Button>
										</div>
										{action.targetType === "frame" && expandable ? (
											<div className="flex items-center justify-between gap-2 text-[10px] uppercase">
												<span>Animate</span>
												<Select
													aria-label={`Animation target for ${target.label}`}
													value={action.animationTarget ?? "self"}
													onValueChange={(animationTarget) =>
														updateAction(action.targetId, action.targetType, {
															animationTarget: animationTarget as
																| "self"
																| "children",
														})
													}
												>
													<SelectTrigger density="compact">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="self">Group wrapper</SelectItem>
														<SelectItem value="children">
															All children
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										) : null}
										{expandedActionId === action.id && expandable ? (
											<AnimationSelectionEditor
												icon={getActionTransitionIcon(action.type)}
												title={getActionTransitionTitle(action.type)}
												selection={action.animation ?? { animations: [] }}
												onChange={(animation) =>
													updateAction(action.targetId, action.targetType, {
														animation,
													})
												}
											/>
										) : null}
									</div>
								);
							})}
							{keyframe.actions.length === 0 ? (
								<p className="py-8 text-center text-foreground/45 text-xs">
									No actions. Every Element and Group continues from the
									previous Keyframe.
								</p>
							) : null}
						</section>
					</>
				) : null}
			</div>
		</div>
	);
}

function isFrameInside(
	frameId: string,
	ancestorId: string | null,
	framesById: Tale["indexMap"]["framesById"],
): boolean {
	if (!ancestorId) return false;
	let currentId: string | null = frameId;
	const visited = new Set<string>();
	while (currentId && !visited.has(currentId)) {
		if (currentId === ancestorId) return true;
		visited.add(currentId);
		currentId = framesById[currentId]?.parentFrameId ?? null;
	}
	return false;
}

function onOpenActionTarget(
	openInspector: (target: TaleInspectorTarget) => void,
	target: { id: string; type: "element" | "frame" },
	sceneId: string,
	returnTarget: TaleInspectorTarget,
): void {
	openInspector({
		id: target.id,
		returnTarget,
		sceneId,
		type: target.type,
	});
}

function KeyframeActionMotionSettings({
	actions,
	onOpenTarget,
	onRemoveAction,
	onUpdateAction,
	targets,
}: {
	actions: KeyframeAction[];
	onOpenTarget: (target: { id: string; type: "element" | "frame" }) => void;
	onRemoveAction: (action: KeyframeAction) => void;
	onUpdateAction: (
		id: string,
		targetType: KeyframeAction["targetType"],
		changes: Partial<KeyframeAction>,
	) => void;
	targets: KeyframeActionTarget[];
}): React.JSX.Element {
	const editableActions = actions.filter((action) =>
		isActionAnimationEditable(action.type, false),
	);
	return (
		<section
			className="grid gap-3"
			data-reader-component="KeyframeActionMotionSettings"
			data-reader-role="keyframe-action-motion-settings"
			data-studio-component="KeyframeActionMotionSettings"
			data-studio-role="keyframe-action-motion-settings"
		>
			{editableActions.map((action) => {
				const target = targets.find(
					(candidate) =>
						candidate.id === action.targetId &&
						candidate.type === action.targetType,
				);
				const label =
					target?.label ??
					`${action.targetType === "frame" ? "Group" : "Element"} ${action.targetId}`;
				return (
					<div key={action.id} className="tale-ui-panel grid gap-2 p-3">
						<div className="flex min-w-0 items-center gap-2">
							<Sparkles size={15} className="shrink-0 text-primary" />
							<Button
								className="h-auto min-w-0 flex-1 justify-start border-0 p-0 text-left font-normal normal-case"
								motion="flat"
								variant="ghost"
								onClick={() =>
									onOpenTarget({
										id: action.targetId,
										type: action.targetType,
									})
								}
							>
								<span className="min-w-0 flex-1">
									<span className="block truncate font-bold text-xs">
										{label}
									</span>
									<span className="block text-[9px] text-foreground/45 uppercase">
										{action.targetType} /{" "}
										{getActionTransitionTitle(action.type)}
									</span>
								</span>
							</Button>
							<Button
								aria-label={`Remove ${label} action`}
								className="size-8 border border-foreground/15 text-foreground/55 hover:bg-foreground/8 hover:text-foreground"
								motion="flat"
								size="icon"
								title="Remove action"
								variant="ghost"
								onClick={() => onRemoveAction(action)}
							>
								<X size={14} />
							</Button>
						</div>
						{action.targetType === "frame" ? (
							<div className="flex items-center justify-between gap-2 text-[10px] uppercase">
								<span>Animate</span>
								<Select
									aria-label={`Animation target for ${label}`}
									value={action.animationTarget ?? "self"}
									onValueChange={(animationTarget) =>
										onUpdateAction(action.targetId, action.targetType, {
											animationTarget: animationTarget as "self" | "children",
										})
									}
								>
									<SelectTrigger density="compact">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="self">Group wrapper</SelectItem>
										<SelectItem value="children">All children</SelectItem>
									</SelectContent>
								</Select>
							</div>
						) : null}
						<AnimationSelectionEditor
							defaultOpen
							icon={getActionTransitionIcon(action.type)}
							title={getActionTransitionTitle(action.type)}
							selection={action.animation ?? { animations: [] }}
							onChange={(animation) =>
								onUpdateAction(action.targetId, action.targetType, {
									animation,
								})
							}
						/>
					</div>
				);
			})}
			{editableActions.length === 0 ? (
				<p className="py-8 text-center text-foreground/45 text-xs">
					No keyframe actions have editable motion yet. Add an intro, show,
					active, or outro action first.
				</p>
			) : null}
		</section>
	);
}

function getActionTypeOptions(
	current: KeyframeAction["type"],
): KeyframeAction["type"][] {
	const options: KeyframeAction["type"][] = [
		"inactive",
		"active",
		"intro",
		"outro",
	];
	return options.includes(current) ? options : [...options, current];
}

function isActionAnimationEditable(
	type: KeyframeAction["type"],
	audio: boolean,
): boolean {
	return !audio && ["active", "intro", "outro", "show"].includes(type);
}

function getActionTransitionTitle(type: KeyframeAction["type"]): string {
	if (type === "show") return "Show / intro transitions";
	if (type === "intro") return "Intro transitions";
	if (type === "outro") return "Outro transitions";
	return "Active transitions";
}

function getActionTransitionIcon(
	type: KeyframeAction["type"],
): React.JSX.Element {
	if (type === "outro") return <ArrowUpFromLine size={15} />;
	if (type === "active") return <MousePointer2 size={15} />;
	return <ArrowDownToLine size={15} />;
}

function Section({
	title,
	children,
}: { title: string; children: React.ReactNode }) {
	return (
		<details open className="border-foreground/20 border-b pb-3">
			<summary className="flex cursor-pointer items-center gap-2 py-2 font-bold text-xs uppercase">
				<Layers size={14} />
				{title}
			</summary>
			<div className="grid gap-3 text-xs">{children}</div>
		</details>
	);
}
