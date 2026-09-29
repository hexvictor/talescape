"use client";

import {
	ArrowDownToLine,
	ArrowLeftRight,
	ArrowUpFromLine,
	MousePointer2,
	Repeat,
} from "lucide-react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type { ResolvedTaleScene } from "~/app/(tale-app)/_shared/types";
import { AnimationSelectionEditor } from "../AnimationSelectionEditor";
import { HoverAnimationEditor } from "../HoverAnimationEditor";
import {
	LoopingAnimationEditor,
	LoopingAnimationsGroup,
} from "../LoopingAnimationEditor";
import type { BlockChangeHandler } from "./sceneMotionTypes";

/**
 * Edits the scene's reading and transition animation tracks.
 *
 * @param props - Component props.
 * @param props.scene - Current resolved scene.
 * @param props.onChange - Applies a scene update.
 * @returns Animation track editors.
 */
export function SceneAnimationSettings({
	scene,
	onChange,
}: {
	scene: ResolvedTaleScene;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	const framesById = useTaleAppStoreShallow(
		(state) => state.document.tale.indexMap.framesById,
	);
	const frameOptions = scene.frameIds
		.filter(
			(id) => id !== scene.rootFrameId && framesById[id]?.kind !== "group",
		)
		.map((id, index) => ({ id, label: `Frame ${index + 1}` }));
	return (
		<>
			<AnimationSelectionEditor
				icon={<MousePointer2 size={15} />}
				title="Scene active transitions"
				selection={scene.reading.animations.sceneActive ?? emptySelection()}
				onChange={(sceneActive) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							animations: { ...item.reading.animations, sceneActive },
						},
					}))
				}
			/>
			<AnimationSelectionEditor
				icon={<MousePointer2 size={15} />}
				title="Keyframe active transitions"
				selection={scene.reading.animations.active}
				onChange={(active) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							animations: { ...item.reading.animations, active },
						},
					}))
				}
			/>
			{scene.transition.introEnabled ? (
				<AnimationSelectionEditor
					icon={<ArrowDownToLine size={15} />}
					title="Intro transitions"
					selection={scene.transition.animations.intro}
					onChange={(intro) =>
						onChange((item) => ({
							...item,
							transition: {
								...item.transition,
								animations: { ...item.transition.animations, intro },
							},
						}))
					}
				/>
			) : null}
			{!scene.position.isFirst ? (
				<AnimationSelectionEditor
					icon={<ArrowLeftRight size={15} />}
					title="Previous bridge transitions"
					selection={
						scene.transition.animations.previousBridge ?? emptySelection()
					}
					onChange={(previousBridge) =>
						onChange((item) => ({
							...item,
							transition: {
								...item.transition,
								animations: {
									...item.transition.animations,
									previousBridge,
								},
							},
						}))
					}
				/>
			) : null}
			{scene.transition.outroEnabled ? (
				<AnimationSelectionEditor
					icon={<ArrowUpFromLine size={15} />}
					inheritsPreviousState={
						scene.reading.animations.active.carryEndStateForward ?? false
					}
					title="Outro transitions"
					selection={scene.transition.animations.outro}
					onChange={(outro) =>
						onChange((item) => ({
							...item,
							transition: {
								...item.transition,
								animations: { ...item.transition.animations, outro },
							},
						}))
					}
				/>
			) : null}
			{!scene.position.isLast ? (
				<AnimationSelectionEditor
					icon={<ArrowLeftRight size={15} />}
					title="Next bridge transitions"
					selection={scene.transition.animations.nextBridge ?? emptySelection()}
					onChange={(nextBridge) =>
						onChange((item) => ({
							...item,
							transition: {
								...item.transition,
								animations: {
									...item.transition.animations,
									nextBridge,
								},
							},
						}))
					}
				/>
			) : null}
			<LoopingAnimationsGroup>
				<LoopingAnimationEditor
					frameOptions={frameOptions}
					title="General looping animation"
					selection={scene.reading.animations.ambient}
					onChange={(ambient) =>
						onChange((item) => ({
							...item,
							reading: {
								...item.reading,
								animations: { ...item.reading.animations, ambient },
							},
						}))
					}
				/>
				<LoopingAnimationEditor
					frameOptions={frameOptions}
					icon={<Repeat size={15} />}
					title="Scene active looping animation"
					selection={scene.reading.animations.sceneActiveLoop ?? emptyLoop()}
					onChange={(sceneActiveLoop) =>
						onChange((item) => ({
							...item,
							reading: {
								...item.reading,
								animations: {
									...item.reading.animations,
									sceneActiveLoop,
								},
							},
						}))
					}
				/>
				{scene.transition.introEnabled ? (
					<LoopingAnimationEditor
						frameOptions={frameOptions}
						icon={<ArrowDownToLine size={15} />}
						title="Intro looping animation"
						selection={scene.transition.animations.introLoop ?? emptyLoop()}
						onChange={(introLoop) =>
							onChange((item) => ({
								...item,
								transition: {
									...item.transition,
									animations: { ...item.transition.animations, introLoop },
								},
							}))
						}
					/>
				) : null}
				{!scene.position.isFirst ? (
					<LoopingAnimationEditor
						frameOptions={frameOptions}
						icon={<ArrowLeftRight size={15} />}
						title="Previous bridge looping animation"
						selection={
							scene.transition.animations.previousBridgeLoop ?? emptyLoop()
						}
						onChange={(previousBridgeLoop) =>
							onChange((item) => ({
								...item,
								transition: {
									...item.transition,
									animations: {
										...item.transition.animations,
										previousBridgeLoop,
									},
								},
							}))
						}
					/>
				) : null}
				<LoopingAnimationEditor
					frameOptions={frameOptions}
					icon={<Repeat size={15} />}
					title="Keyframe active looping animation"
					selection={scene.reading.animations.activeLoop ?? emptyLoop()}
					onChange={(activeLoop) =>
						onChange((item) => ({
							...item,
							reading: {
								...item.reading,
								animations: { ...item.reading.animations, activeLoop },
							},
						}))
					}
				/>
				{scene.transition.outroEnabled ? (
					<LoopingAnimationEditor
						frameOptions={frameOptions}
						icon={<ArrowUpFromLine size={15} />}
						title="Outro looping animation"
						selection={scene.transition.animations.outroLoop ?? emptyLoop()}
						onChange={(outroLoop) =>
							onChange((item) => ({
								...item,
								transition: {
									...item.transition,
									animations: { ...item.transition.animations, outroLoop },
								},
							}))
						}
					/>
				) : null}
				{!scene.position.isLast ? (
					<LoopingAnimationEditor
						frameOptions={frameOptions}
						icon={<ArrowLeftRight size={15} />}
						title="Next bridge looping animation"
						selection={
							scene.transition.animations.nextBridgeLoop ?? emptyLoop()
						}
						onChange={(nextBridgeLoop) =>
							onChange((item) => ({
								...item,
								transition: {
									...item.transition,
									animations: {
										...item.transition.animations,
										nextBridgeLoop,
									},
								},
							}))
						}
					/>
				) : null}
				<HoverAnimationEditor
					selection={
						scene.reading.animations.hover ?? {
							animations: [],
							durationSeconds: 0.2,
						}
					}
					onChange={(hover) =>
						onChange((item) => ({
							...item,
							reading: {
								...item.reading,
								animations: { ...item.reading.animations, hover },
							},
						}))
					}
				/>
			</LoopingAnimationsGroup>
		</>
	);
}

function emptySelection() {
	return { animations: [] };
}

function emptyLoop() {
	return {
		animations: [],
		cycleDurationMs: 2400,
		playback: "alternate" as const,
	};
}
