"use client";

import { useEffect, useRef } from "react";
import { useTaleReaderStoreShallow } from "../../../../contexts/TaleReaderStoreContext";
import type { ResolvedTaleElement } from "../../../../types";

export function AudioElement({ element }: { element: ResolvedTaleElement }) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const hasPlayedRef = useRef(false);
	const muted = useTaleReaderStoreShallow((state) => state.ui.audioMuted);
	const playback = element.mediaPlayback ?? {
		loop: false,
		maxVolume: 1,
		mode: "controls" as const,
		scope: "scene" as const,
	};

	useEffect(() => {
		const audio = audioRef.current;
		const activationTarget = audio?.closest<HTMLElement>(
			playback.scope === "element"
				? "[data-reader-element-id]"
				: playback.scope === "frame"
					? "[data-reader-frame-id]"
					: "[data-reader-scene-id]",
		);
		if (!audio || !activationTarget) return;
		audio.loop = playback.loop;
		audio.volume = clampVolume(playback.maxVolume);
		// Frame audio is controlled by the active keyframe.
		if (element.frameId) return;
		if (playback.mode === "controls") return;
		const play = (): void => {
			if (!playback.loop && hasPlayedRef.current) return;
			hasPlayedRef.current = true;
			void audio.play().catch(() => {
				hasPlayedRef.current = false;
			});
		};
		if (playback.mode === "click") {
			activationTarget.addEventListener("pointerup", play);
			return () => activationTarget.removeEventListener("pointerup", play);
		}

		if (playback.mode === "onEnter") {
			const observer = new IntersectionObserver(
				(entries) => {
					const visible = entries[0]?.isIntersecting ?? false;
					if (visible) play();
					else if (playback.loop) audio.pause();
				},
				{ threshold: 0.35 },
			);
			observer.observe(activationTarget);
			return () => observer.disconnect();
		}

		let frameId = 0;
		const updateVolume = () => {
			const rect = activationTarget.getBoundingClientRect();
			const visibleHeight = Math.max(
				0,
				Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
			);
			const visibleWidth = Math.max(
				0,
				Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
			);
			const visibility = Math.min(
				1,
				(visibleHeight * visibleWidth) / Math.max(rect.width * rect.height, 1),
			);
			audio.volume = clampVolume(playback.maxVolume * visibility);
			if (visibility > 0.08) void audio.play().catch(() => undefined);
			else audio.pause();
			frameId = window.requestAnimationFrame(updateVolume);
		};
		frameId = window.requestAnimationFrame(updateVolume);
		return () => window.cancelAnimationFrame(frameId);
	}, [element.frameId, playback.loop, playback.maxVolume, playback.mode, playback.scope]);

	return (
		<audio
			ref={audioRef}
			muted={muted}
			preload="metadata"
			className="hidden"
			data-reader-role="audio-content"
			data-reader-audio-mode={playback.mode}
			src={element.src ?? undefined}
		/>
	);
}

function clampVolume(value: number): number {
	return Math.min(Math.max(value, 0), 1);
}
