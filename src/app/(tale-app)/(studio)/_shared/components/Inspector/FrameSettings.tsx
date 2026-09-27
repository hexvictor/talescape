import { useState } from "react";
import { editKeyframe } from "~/app/(tale-app)/(studio)/_shared/services/taleDraftEdits";
import {
	DebugCard,
	DebugField,
	Setting,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { DEFAULT_BLOCK_AUTOPLAY_CONFIG } from "~/app/(tale-app)/_shared/services/readerPlaybackSettings";
import { resolveIds } from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	ResolvedTaleKeyframe,
	ResolvedTaleScene,
	TaleFrame,
	TaleSceneSnapBehavior,
	TaleSceneSnapMode,
	TaleSceneSnapSettings,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import Input from "~/components/ui/input";
import { useTaleStudioStore } from "../../hooks/useTaleStudioStore";
import { AnimationSelectionEditor } from "./AnimationSelectionEditor";
import { FrameHierarchyTree } from "./FrameHierarchyTree";
import { InspectorSelect, NumberSetting } from "./InspectorValueFields";
import {
	LoopingAnimationEditor,
	LoopingAnimationsGroup,
} from "./LoopingAnimationEditor";
import { StyleSettings } from "./StyleSettings";

const snapModeOptions = [
	{ label: "Free", value: "snap-off" },
	{ label: "Scroll snap", value: "scroll-snap" },
	{ label: "Snap", value: "snap" },
] as const;

/**
 * Edits the layout frames owned by a scene.
 *
 * @param props - Component props.
 * @param props.scene - Current scene.
 * @param props.initialFrameId - Optional frame id selected by a preview inspector click.
 * @param props.onChange - Receives updated frames and root id.
 * @returns Frame tree controls.
 */
export function FrameSettings({
	scene,
	initialFrameId,
	onChange,
}: {
	scene: ResolvedTaleScene;
	initialFrameId?: string;
	onChange: (frames: TaleFrame[], rootFrameId: string) => void;
}): React.JSX.Element {
	const { elementsById, framesById, setTale, tale } = useTaleAppStoreShallow(
		(state) => ({
			elementsById: state.document.tale.indexMap.elementsById,
			framesById: state.document.tale.indexMap.framesById,
			setTale: state.document.setTale,
			tale: state.document.tale,
		}),
	);
	const openInspector = useTaleStudioStore(
		(state) => state.studioSelection.openInspector,
	);
	const frames = resolveIds(scene.frameIds, framesById);
	const firstEditableFrame =
		frames.find((frame) => !frame.parentFrameId) ?? frames[0];
	const [selectedFrameId, setSelectedFrameId] = useState(
		initialFrameId ?? firstEditableFrame?.id ?? "",
	);
	const selectedFrame = framesById[selectedFrameId] ?? firstEditableFrame;
	const selectedBaseFrameId = selectedFrame?.id.split(":").at(-1) ?? null;
	const linkedKeyframe = Object.values(tale.indexMap.keyframesById).find(
		(step) => step.sceneId === scene.id && step.frameId === selectedBaseFrameId,
	);

	const updateFrame = (nextFrame: TaleFrame): void => {
		onChange(
			frames.map((frame) => (frame.id === nextFrame.id ? nextFrame : frame)),
			scene.rootFrameId,
		);
	};
	const moveFrame = (frameId: string, parentFrameId: string | null): void => {
		const movedFrames = frames.map((frame) => ({
			...frame,
			children: frame.children.filter(
				(child) => child.type !== "frame" || child.frameId !== frameId,
			),
			parentFrameId: frame.id === frameId ? parentFrameId : frame.parentFrameId,
		})) as TaleFrame[];
		if (parentFrameId) {
			const parentIndex = movedFrames.findIndex(
				(frame) => frame.id === parentFrameId,
			);
			const parent = movedFrames[parentIndex];
			if (parent) {
				movedFrames[parentIndex] = {
					...parent,
					children: [...parent.children, { frameId, type: "frame" }],
				} as TaleFrame;
			}
		}
		onChange(movedFrames, scene.rootFrameId);
	};

	return (
		<div
			data-reader-component="FrameSettings"
			data-reader-role="frame-settings"
			className="space-y-3"
		>
			<DebugCard title="Frame layout">
				<DebugField label="Frames" value={String(frames.length)} />
			</DebugCard>
			<FrameHierarchyTree
				scene={scene}
				elementsById={elementsById}
				frames={frames}
				framesById={framesById}
				selectedFrameId={selectedFrame?.id ?? ""}
				onSelectFrame={(frameId) => {
					setSelectedFrameId(frameId);
					openInspector({
						id: frameId,
						returnTarget: {
							id: scene.id,
							initialTab: "layout",
							type: "scene",
						},
						sceneId: scene.id,
						type: "frame",
					});
				}}
			/>
			{selectedFrame ? (
				<FrameEditor
					key={selectedFrame.id}
					frame={selectedFrame}
					frames={frames}
					rootFrameId={scene.rootFrameId}
					onChange={updateFrame}
					onParentChange={(parentFrameId) =>
						moveFrame(selectedFrame.id, parentFrameId)
					}
				/>
			) : null}
			{selectedFrame ? (
				linkedKeyframe ? (
					<FrameProgressionSettings
						step={linkedKeyframe}
						onChange={(update) =>
							setTale(editKeyframe(tale, linkedKeyframe.id, update), {
								reason: "frame-progression",
							})
						}
					/>
				) : (
					<DebugCard title="Frame progression">
						<p className="col-span-2 text-foreground/55 text-xs">
							This is a layout-only Frame. Assign it to a Keyframe to give it
							reading, pause, snap, action, and Page behavior.
						</p>
					</DebugCard>
				)
			) : null}
		</div>
	);
}

export function FrameProgressionSettings({
	onChange,
	step,
	title = "Frame progression",
}: {
	onChange: (
		update: (step: ResolvedTaleKeyframe) => ResolvedTaleKeyframe,
	) => void;
	step: ResolvedTaleKeyframe;
	title?: string;
}): React.JSX.Element {
	const updateNumber = (
		label: string,
		value: number | null,
		commit: (value: number | null) => void,
	): React.JSX.Element => (
		<Setting label={label}>
			<Input
				aria-label={label}
				density="compact"
				min={0}
				placeholder="Automatic"
				type="number"
				value={value ?? ""}
				onChange={(event) =>
					commit(event.target.value === "" ? null : Number(event.target.value))
				}
			/>
		</Setting>
	);
	const autoplay = step.autoplay ?? DEFAULT_BLOCK_AUTOPLAY_CONFIG;
	const updateAutoplay = (
		update: Partial<typeof DEFAULT_BLOCK_AUTOPLAY_CONFIG>,
	): void =>
		onChange((item) => ({
			...item,
			autoplay: { ...autoplay, ...update },
		}));
	const snapMode =
		typeof step.snap === "boolean"
			? step.snap
				? "scroll-snap"
				: "snap-off"
			: step.snap.mode;
	const snapStrategy =
		typeof step.snap === "boolean"
			? "shared"
			: (step.snap.strategy ?? "shared");
	const behaviorMode = (
		direction: "backward" | "forward",
	): TaleSceneSnapMode =>
		typeof step.snap === "boolean"
			? snapMode
			: (step.snap[direction]?.mode ?? snapMode);
	const behavior = (
		direction?: "backward" | "forward",
	): TaleSceneSnapBehavior => {
		if (typeof step.snap === "boolean") return { mode: snapMode };
		return direction && step.snap.strategy === "separate"
			? (step.snap[direction] ?? { mode: step.snap.mode })
			: { mode: step.snap.mode, settings: step.snap.settings };
	};
	const updateBehavior = (
		next: TaleSceneSnapBehavior,
		direction?: "backward" | "forward",
	): void => {
		onChange((item) => {
			const current =
				typeof item.snap === "boolean" ? { mode: snapMode } : item.snap;
			return {
				...item,
				snap:
					direction && snapStrategy === "separate"
						? { ...current, [direction]: next, strategy: "separate" }
						: { ...current, ...next, strategy: "shared" },
			};
		});
	};

	return (
		<DebugCard title={title}>
			<DebugField label="Page" value={step.pageId ? "Page" : "Not a page"} />
			<DebugField label="Keyframe" value={step.title} />
			{updateNumber(
				"Intro transition length",
				step.transition.introLength,
				(introLength) =>
					onChange((item) => ({
						...item,
						transition: { ...item.transition, introLength },
					})),
			)}
			{updateNumber(
				"Pause after intro",
				step.reading.pauses?.atStart ?? 0,
				(atStart) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							pauses: { ...item.reading.pauses, atStart: atStart ?? 0 },
						},
					})),
			)}
			{updateNumber(
				"Pause before outro",
				step.reading.pauses?.atEnd ?? 0,
				(atEnd) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							pauses: { ...item.reading.pauses, atEnd: atEnd ?? 0 },
						},
					})),
			)}
			{updateNumber(
				"Outro transition length",
				step.transition.outroLength,
				(outroLength) =>
					onChange((item) => ({
						...item,
						transition: { ...item.transition, outroLength },
					})),
			)}
			<Checkbox
				className="col-span-2 flex-row-reverse justify-between gap-3 border border-foreground/10 bg-foreground/[0.025] p-2"
				density="compact"
				isSelected={autoplay.enabled}
				onChange={(enabled) => updateAutoplay({ enabled })}
			>
				Use Keyframe autoplay timing
			</Checkbox>
			{updateNumber("Autoplay enter speed", autoplay.introSpeed, (value) =>
				updateAutoplay({ introSpeed: value }),
			)}
			{updateNumber("Autoplay reading speed", autoplay.activeSpeed, (value) =>
				updateAutoplay({ activeSpeed: value }),
			)}
			{updateNumber("Autoplay leave speed", autoplay.outroSpeed, (value) =>
				updateAutoplay({ outroSpeed: value }),
			)}
			{updateNumber(
				"Autoplay pause after enter (s)",
				autoplay.pauseAfterIntroSeconds,
				(value) => updateAutoplay({ pauseAfterIntroSeconds: value }),
			)}
			{updateNumber(
				"Autoplay pause before leave (s)",
				autoplay.pauseBeforeOutroSeconds,
				(value) => updateAutoplay({ pauseBeforeOutroSeconds: value }),
			)}
			<Setting label="Snap mode">
				<InspectorSelect
					label="Snap mode"
					value={snapMode}
					options={snapModeOptions}
					onChange={(value) =>
						onChange((item) => ({
							...item,
							snap: {
								...(typeof item.snap === "boolean" ? {} : item.snap),
								mode: value as TaleSceneSnapMode,
								strategy: snapStrategy,
							},
						}))
					}
				/>
			</Setting>
			<Setting label="Snap directions">
				<InspectorSelect
					label="Snap directions"
					value={snapStrategy}
					options={[
						{ label: "Both directions", value: "shared" },
						{ label: "Set separately", value: "separate" },
					]}
					onChange={(value) =>
						onChange((item) => ({
							...item,
							snap: {
								mode: snapMode,
								strategy: value as "separate" | "shared",
								...(value === "separate"
									? {
											backward: { mode: behaviorMode("backward") },
											forward: { mode: behaviorMode("forward") },
										}
									: {}),
							},
						}))
					}
				/>
			</Setting>
			{snapStrategy === "separate"
				? (["forward", "backward"] as const).map((direction) => (
						<Setting
							key={direction}
							label={
								direction === "forward" ? "Forward entry" : "Backward entry"
							}
						>
							<InspectorSelect
								label={
									direction === "forward" ? "Forward entry" : "Backward entry"
								}
								value={behaviorMode(direction)}
								options={snapModeOptions}
								onChange={(value) =>
									onChange((item) => ({
										...item,
										snap: {
											...(typeof item.snap === "boolean"
												? { mode: snapMode }
												: item.snap),
											[direction]: {
												...(typeof item.snap === "boolean"
													? {}
													: item.snap[direction]),
												mode: value as TaleSceneSnapMode,
											},
											strategy: "separate",
										},
									}))
								}
							/>
						</Setting>
					))
				: null}
			{snapStrategy === "shared" ? (
				<FrameSnapBehaviorFields
					behavior={behavior()}
					title="Both directions"
					onChange={(next) => updateBehavior(next)}
				/>
			) : (
				(["forward", "backward"] as const).map((direction) => (
					<FrameSnapBehaviorFields
						key={`${direction}-settings`}
						behavior={behavior(direction)}
						title={
							direction === "forward"
								? "Entering from previous"
								: "Entering from next"
						}
						onChange={(next) => updateBehavior(next, direction)}
					/>
				))
			)}
		</DebugCard>
	);
}

function FrameSnapBehaviorFields({
	behavior,
	onChange,
	title,
}: {
	behavior: TaleSceneSnapBehavior;
	onChange: (behavior: TaleSceneSnapBehavior) => void;
	title: string;
}): React.JSX.Element {
	const updateSetting = (
		key: keyof TaleSceneSnapSettings,
		value: number | null,
	): void =>
		onChange({
			...behavior,
			settings: { ...behavior.settings, [key]: value },
		});
	const field = (
		label: string,
		key: keyof TaleSceneSnapSettings,
		step = 1,
	): React.JSX.Element => (
		<Setting label={label}>
			<Input
				aria-label={label}
				density="compact"
				min={0}
				placeholder="Global"
				step={step}
				type="number"
				value={behavior.settings?.[key] ?? ""}
				onChange={(event) =>
					updateSetting(
						key,
						event.target.value === "" ? null : Number(event.target.value),
					)
				}
			/>
		</Setting>
	);
	if (behavior.mode === "snap-off") return <></>;
	return (
		<div className="col-span-2 grid grid-cols-2 gap-2 border border-foreground/10 bg-foreground/[0.025] p-2">
			<p className="col-span-2 font-bold text-[10px] text-foreground/55 uppercase">
				{title}
			</p>
			{behavior.mode === "scroll-snap"
				? field("Capture px", "captureDistancePx")
				: null}
			{behavior.mode === "scroll-snap"
				? field("Viewport fraction", "minViewportFraction", 0.01)
				: null}
			{field("Delay ms", "delayMs")}
			{field("Duration seconds", "durationSeconds", 0.01)}
		</div>
	);
}

/**
 * Edits one frame's hierarchy, layout, and style.
 *
 * @param props - Component props.
 * @param props.frame - Current frame.
 * @param props.frames - Available parent frames.
 * @param props.onChange - Receives the updated frame.
 * @returns Frame editor.
 */
function FrameEditor({
	frame,
	frames,
	onChange,
	onParentChange,
	rootFrameId,
}: {
	frame: TaleFrame;
	frames: TaleFrame[];
	onChange: (frame: TaleFrame) => void;
	onParentChange: (parentFrameId: string | null) => void;
	rootFrameId: string;
}): React.JSX.Element {
	const descendantFrameIds = collectDescendantFrameIds(frames, frame.id);
	const [styleOpen, setStyleOpen] = useState(true);
	const [animationOpen, setAnimationOpen] = useState(false);
	return (
		<section
			data-reader-component="FrameEditor"
			data-reader-role="frame-settings-card"
			className="rounded-md border border-foreground/10 bg-foreground/[0.035] p-3"
		>
			<div className="mb-3 flex items-center justify-between gap-2">
				<h3 className="truncate font-black text-[10px] text-primary uppercase">
					{frame.id}
				</h3>
				<span className="text-foreground/38 text-xs">
					{frame.children.length} children
				</span>
			</div>
			<div className="@container/inspector-group grid min-w-0 @min-[32rem]/inspector-group:grid-cols-2 grid-cols-1 gap-2">
				<Setting label="Display mode">
					<InspectorSelect
						label="Display mode"
						value={frame.mode}
						options={[
							{ label: "Stack", value: "stack" },
							{ label: "Flex", value: "flex" },
							{ label: "Grid", value: "grid" },
							{ label: "Free", value: "free" },
						]}
						onChange={(value) =>
							onChange(changeFrameMode(frame, value as TaleFrame["mode"]))
						}
					/>
				</Setting>
				<Setting label="Parent frame">
					<InspectorSelect
						isDisabled={frame.id === rootFrameId}
						label="Parent frame"
						value={frame.parentFrameId ?? ""}
						options={[
							{ label: "None", value: "" },
							...frames
								.filter(
									(item) =>
										item.id !== frame.id && !descendantFrameIds.has(item.id),
								)
								.map((item) => ({
									label: item.name?.trim() || `Frame ${item.id}`,
									value: item.id,
								})),
						]}
						onChange={(value) => onParentChange(value || null)}
					/>
				</Setting>
				<NumberSetting
					label="Gap"
					value={"gap" in frame ? (frame.gap ?? 0) : 0}
					onChange={(gap) => onChange({ ...frame, gap } as TaleFrame)}
				/>
				<Setting label="Overflow">
					<InspectorSelect
						label="Overflow"
						value={frame.overflow ?? "visible"}
						options={[
							{ label: "Visible", value: "visible" },
							{ label: "Clip", value: "clip" },
						]}
						onChange={(value) =>
							onChange({
								...frame,
								overflow: value as "clip" | "visible",
							} as TaleFrame)
						}
					/>
				</Setting>
			</div>
			<CollapsibleFrameSection
				open={styleOpen}
				title="Frame style"
				onToggle={() => setStyleOpen((open) => !open)}
			>
				<StyleSettings
					className="mt-3"
					layoutMode={frame.mode}
					style={frame.style}
					title="Frame style"
					onChange={(style) => onChange({ ...frame, style } as TaleFrame)}
				/>
			</CollapsibleFrameSection>
			<CollapsibleFrameSection
				open={animationOpen}
				title="Frame animations"
				onToggle={() => setAnimationOpen((open) => !open)}
			>
				<div className="mt-3 space-y-3">
					<AnimationSelectionEditor
						title="Opening transitions"
						selection={frame.animations.sceneIntro ?? { animations: [] }}
						onChange={(sceneIntro) =>
							onChange({
								...frame,
								animations: { ...frame.animations, sceneIntro },
							} as TaleFrame)
						}
					/>
					<AnimationSelectionEditor
						title="Scene outro transitions"
						selection={frame.animations.sceneOutro ?? { animations: [] }}
						onChange={(sceneOutro) =>
							onChange({
								...frame,
								animations: { ...frame.animations, sceneOutro },
							} as TaleFrame)
						}
					/>
					<AnimationSelectionEditor
						title="Intro transitions"
						selection={frame.animations.intro}
						onChange={(intro) =>
							onChange({
								...frame,
								animations: { ...frame.animations, intro },
							} as TaleFrame)
						}
					/>
					<AnimationSelectionEditor
						title="Active transitions"
						inheritsPreviousState={
							frame.animations.intro.carryEndStateForward ?? false
						}
						selection={frame.animations.active}
						onChange={(active) =>
							onChange({
								...frame,
								animations: { ...frame.animations, active },
							} as TaleFrame)
						}
					/>
					<AnimationSelectionEditor
						title="Outro transitions"
						inheritsPreviousState={
							frame.animations.active.carryEndStateForward ?? false
						}
						selection={frame.animations.outro}
						onChange={(outro) =>
							onChange({
								...frame,
								animations: { ...frame.animations, outro },
							} as TaleFrame)
						}
					/>
					<LoopingAnimationsGroup>
						<LoopingAnimationEditor
							selection={frame.animations.ambient}
							onChange={(ambient) =>
								onChange({
									...frame,
									animations: { ...frame.animations, ambient },
								} as TaleFrame)
							}
						/>
					</LoopingAnimationsGroup>
				</div>
			</CollapsibleFrameSection>
		</section>
	);
}

/**
 * Renders a collapsible frame editor group.
 *
 * @param props - Section props.
 * @param props.children - Collapsible content.
 * @param props.onToggle - Toggles the content.
 * @param props.open - Whether content is visible.
 * @param props.title - Section title.
 * @returns Collapsible frame section.
 *
 * @example
 * <CollapsibleFrameSection title="Frame style" open onToggle={toggle}>...</CollapsibleFrameSection>
 */
function CollapsibleFrameSection({
	children,
	onToggle,
	open,
	title,
}: {
	children: React.ReactNode;
	onToggle: () => void;
	open: boolean;
	title: string;
}): React.JSX.Element {
	return (
		<section className="mt-3 rounded border border-foreground/8 bg-background/20 p-2">
			<Button
				className="h-8 w-full justify-between border-0 px-1 text-left text-[10px] text-foreground/56 shadow-none"
				motion="flat"
				size="sm"
				variant="ghost"
				onPress={onToggle}
			>
				{title}
				<span>{open ? "Hide" : "Show"}</span>
			</Button>
			{open ? children : null}
		</section>
	);
}

/**
 * Converts a frame to another display mode while preserving shared fields.
 *
 * @param frame - Current frame.
 * @param mode - Target display mode.
 * @returns Mode-compatible frame.
 */
function changeFrameMode(frame: TaleFrame, mode: TaleFrame["mode"]): TaleFrame {
	const base = {
		animations: frame.animations,
		children: frame.children,
		id: frame.id,
		overflow: frame.overflow,
		parentFrameId: frame.parentFrameId,
		style: frame.style,
	};
	if (mode === "flex") return { ...base, direction: "column", gap: 16, mode };
	if (mode === "grid") return { ...base, columns: 2, gap: 16, mode };
	if (mode === "free") return { ...base, mode };
	return { ...base, align: "center", gap: 16, justify: "center", mode };
}

/**
 * Collects frame descendants that cannot become the frame's parent.
 *
 * @param frames - Frames in the current Scene.
 * @param frameId - Frame whose descendants are collected.
 * @returns Descendant frame ids.
 *
 * @example
 * const descendants = collectDescendantFrameIds(frames, frame.id);
 */
function collectDescendantFrameIds(
	frames: TaleFrame[],
	frameId: string,
): Set<string> {
	const framesById = new Map(frames.map((frame) => [frame.id, frame]));
	const descendants = new Set<string>();
	const visit = (currentFrameId: string): void => {
		for (const child of framesById.get(currentFrameId)?.children ?? []) {
			if (child.type !== "frame" || descendants.has(child.frameId)) continue;
			descendants.add(child.frameId);
			visit(child.frameId);
		}
	};
	visit(frameId);
	return descendants;
}
