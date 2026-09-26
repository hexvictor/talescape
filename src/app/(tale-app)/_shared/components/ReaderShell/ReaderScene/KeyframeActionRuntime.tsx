"use client";

import { useEffect, useRef } from "react";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "../../../contexts/TaleReaderStoreContext";
import { resolveTaleBreakpoint } from "../../../services/resolveTaleBreakpoint";
import type { TaleTrigger, TriggerEffect } from "../../../types";

export function KeyframeActionRuntime({
	root,
	sceneId,
}: { root: HTMLElement | null; sceneId: string }): null {
	const location = useTaleReaderStore((state) => state.navigation.current);
	const compiled = useTaleReaderStore((state) => state.reader.compiled);
	const base = useTaleAppStore((state) => state.document.tale);
	const breakpointId = useTaleAppStore((state) => state.runtime.breakpointId);
	const previous = useRef<{
		active: boolean;
		frameId: string | null;
		keyframeId: string | null;
	}>({ active: false, frameId: null, keyframeId: null });
	const firedOnce = useRef(new Set<string>());
	const triggerProgress = useRef(new Map<string, number>());
	useEffect(() => {
		if (!root) return;
		const tale = resolveTaleBreakpoint(base, breakpointId);
		const segment = location
			? compiled?.segments[location.segmentIndex]
			: undefined;
		const keyframe =
			segment && segment.type !== "transition" && segment.sceneId === sceneId
				? tale.indexMap.keyframesById[segment.keyframeId]
				: undefined;
		for (const media of root.querySelectorAll<HTMLMediaElement>(
			"audio,video",
		)) {
			const id = media.closest<HTMLElement>("[data-reader-element-id]")?.dataset
				.readerElementId;
			const action = keyframe?.actions.find(
				(item) => item.targetType === "element" && item.targetId === id,
			);
			if (action?.type === "play") {
				media.currentTime = 0;
				void media.play().catch(() => undefined);
			} else if (action?.type === "continue") {
				if (media.paused && !media.ended)
					void media.play().catch(() => undefined);
			} else {
				media.pause();
				if (action?.type === "stop" || !action || action.type === "inactive")
					media.currentTime = 0;
			}
		}
	}, [base, breakpointId, compiled, location, root, sceneId]);
	useEffect(() => {
		const stage = root?.parentElement;
		if (!root || !stage) return;
		const tale = resolveTaleBreakpoint(base, breakpointId);
		const onProgress = (rawEvent: Event) => {
			const event = rawEvent as CustomEvent<{
				cameraProgress: number;
				keyframeId: string;
				sceneId: string;
				segmentProgress: number;
			}>;
			if (event.detail.sceneId !== sceneId) return;
			const keyframe = tale.indexMap.keyframesById[event.detail.keyframeId];
			const frame = keyframe?.frameId
				? tale.indexMap.framesById[keyframe.frameId]
				: undefined;
			const candidates = [
				...(tale.indexMap.scenesById[sceneId]?.triggers ?? []),
				...(frame?.triggers ?? []),
				...(keyframe?.triggers ?? []),
			];
			for (const trigger of candidates) {
				if (trigger.trigger.type !== "progress") continue;
				const current = event.detail.segmentProgress;
				const prior = triggerProgress.current.get(trigger.id) ?? 0;
				if (
					prior < trigger.trigger.progress &&
					current >= trigger.trigger.progress &&
					(!trigger.once || !firedOnce.current.has(trigger.id))
				) {
					for (const effect of trigger.effects)
						executeTriggerEffect(root, effect);
					if (trigger.once) firedOnce.current.add(trigger.id);
				}
				triggerProgress.current.set(trigger.id, current);
			}
		};
		stage.addEventListener("talescape:reader-progress", onProgress);
		return () =>
			stage.removeEventListener("talescape:reader-progress", onProgress);
	}, [base, breakpointId, root, sceneId]);
	useEffect(() => {
		if (!root) return;
		const tale = resolveTaleBreakpoint(base, breakpointId);
		const segment = location
			? compiled?.segments[location.segmentIndex]
			: undefined;
		const active =
			segment?.type !== "transition" && segment?.sceneId === sceneId;
		const keyframe = active
			? tale.indexMap.keyframesById[segment.keyframeId]
			: undefined;
		const frameId = keyframe?.frameId ?? null;
		const scene = tale.indexMap.scenesById[sceneId];
		const run = (triggers: TaleTrigger[] | undefined, event: string) => {
			for (const trigger of triggers ?? []) {
				if (trigger.trigger.type !== event) continue;
				if (trigger.once && firedOnce.current.has(trigger.id)) continue;
				for (const effect of trigger.effects)
					executeTriggerEffect(root, effect);
				if (trigger.once) firedOnce.current.add(trigger.id);
			}
		};
		if (active && !previous.current.active) run(scene?.triggers, "scene-enter");
		if (!active && previous.current.active) run(scene?.triggers, "scene-leave");
		if (active && frameId !== previous.current.frameId) {
			const oldFrame = previous.current.frameId
				? tale.indexMap.framesById[previous.current.frameId]
				: undefined;
			run(oldFrame?.triggers, "frame-leave");
			run(
				frameId ? tale.indexMap.framesById[frameId]?.triggers : undefined,
				"frame-enter",
			);
		}
		if (active && keyframe?.id !== previous.current.keyframeId) {
			const oldKeyframe = previous.current.keyframeId
				? tale.indexMap.keyframesById[previous.current.keyframeId]
				: undefined;
			run(oldKeyframe?.triggers, "keyframe-leave");
			run(keyframe?.triggers, "keyframe-enter");
		}
		previous.current = { active, frameId, keyframeId: keyframe?.id ?? null };
	}, [base, breakpointId, compiled, location, root, sceneId]);
	useEffect(
		() => () => {
			for (const media of root?.querySelectorAll<HTMLMediaElement>(
				"audio,video",
			) ?? [])
				media.pause();
		},
		[root],
	);
	return null;
}

function executeTriggerEffect(root: HTMLElement, effect: TriggerEffect): void {
	if (effect.type === "set-element-state") {
		const target = root.querySelector<HTMLElement>(
			`[data-reader-element-id="${CSS.escape(effect.elementId)}"]`,
		);
		if (target) {
			target.dataset.triggerState = effect.state;
			target.style.opacity = effect.state === "active" ? "1" : "0";
		}
		return;
	}
	if (effect.type === "audio") {
		const media = root
			.querySelector<HTMLElement>(
				`[data-reader-element-id="${CSS.escape(effect.elementId)}"]`,
			)
			?.querySelector<HTMLMediaElement>("audio,video");
		if (!media) return;
		if (effect.action === "play") void media.play().catch(() => undefined);
		else {
			media.pause();
			if (effect.action === "stop") media.currentTime = 0;
		}
		return;
	}
	if (effect.type === "set-layer-state") {
		for (const layer of root.querySelectorAll<HTMLElement>(
			`[data-reader-layer="${effect.layer}"]`,
		)) {
			layer.style.opacity = effect.state === "active" ? "1" : "0";
			layer.style.pointerEvents = effect.state === "active" ? "" : "none";
		}
		return;
	}
	const target =
		root.closest<HTMLElement>('[data-reader-role="viewport"]') ?? root;
	const duration = Math.max(effect.durationMs ?? 300, 1);
	const amount = effect.amount ?? 8;
	if (effect.effect === "shake")
		target.animate(
			[
				{ transform: "translate(0, 0)" },
				{ transform: `translate(${amount}px, 0)` },
				{ transform: `translate(${-amount}px, 0)` },
				{ transform: "translate(0, 0)" },
			],
			{ duration },
		);
	else if (effect.effect === "zoom")
		target.animate(
			[{ scale: "1" }, { scale: String(1 + amount / 100) }, { scale: "1" }],
			{ duration },
		);
	else
		target.animate(
			[
				{ filter: "brightness(1)" },
				{ filter: `brightness(${1 + amount / 10})` },
				{ filter: "brightness(1)" },
			],
			{ duration },
		);
}
