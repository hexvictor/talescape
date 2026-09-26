"use client";

import type { TaleInspectorTarget } from "~/app/(tale-app)/_shared/types";
import { ElementInspectorPanel } from "./element/ElementInspectorPanel";
import { FrameInspectorPanel } from "./frame/FrameInspectorPanel";
import { SceneInspectorPanel } from "./scene/SceneInspectorPanel";
import { KeyframeInspectorPanel } from "./keyframe/KeyframeInspectorPanel";

/**
 * Routes an inspector target to its isolated editor panel.
 *
 * @param props - Inspector router props.
 * @param props.target - Scene or Element target selected in the reader.
 * @returns Target-specific inspector panel.
 *
 * @example
 * <TaleInspectorPanel target={target} />
 */
export function TaleInspectorPanel({
	target,
}: {
	target: TaleInspectorTarget;
}) {
	return target.type === "scene" ? (
		<SceneInspectorPanel
			key={`scene:${target.id}:${target.initialTab ?? "summary"}`}
			sceneId={target.id}
			initialTab={target.initialTab}
		/>
	) : target.type === "frame" ? (
		<FrameInspectorPanel
			key={`frame:${target.id}:${target.initialTab ?? "summary"}`}
			sceneId={target.sceneId}
			frameId={target.id}
			initialTab={target.initialTab}
			returnTarget={target.returnTarget}
		/>
	) : target.type === "keyframe" ? (
		<KeyframeInspectorPanel
			key={`keyframe:${target.id}`}
			sceneId={target.sceneId}
			keyframeId={target.id}
			returnTarget={target.returnTarget}
		/>
	) : (
		<ElementInspectorPanel
			key={`element:${target.id}:${target.initialTab ?? "summary"}`}
			sceneId={target.sceneId}
			elementId={target.id}
			initialTab={target.initialTab}
			returnTarget={target.returnTarget}
		/>
	);
}
