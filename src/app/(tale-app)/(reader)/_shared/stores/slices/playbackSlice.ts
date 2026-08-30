import type { StateCreator } from "zustand/vanilla";
import { normalizeTalePlaybackConfig } from "../../../../_shared/services/readerPlaybackSettings";
import type { Tale } from "../../../../_shared/types";
import type { TaleReaderState } from "../createTaleReaderStore";

export type ReaderPlaybackStatus = "disabled" | "paused" | "playing";

export type PlaybackSlice = {
	playback: {
		available: boolean;
		configure: (available: boolean) => void;
		pause: () => void;
		resume: () => void;
		status: ReaderPlaybackStatus;
		toggle: () => void;
	};
};

export const createPlaybackSlice =
	(tale: Tale): StateCreator<TaleReaderState, [], [], PlaybackSlice> =>
	(set, get) => {
		const available = normalizeTalePlaybackConfig(tale.playbackConfig).autoplay
			.enabled;
		return {
			playback: {
				available,
				configure: (nextAvailable) => {
					const playback = get().playback;
					if (playback.available === nextAvailable) return;
					set((state) => ({
						playback: {
							...state.playback,
							available: nextAvailable,
							status: nextAvailable ? "playing" : "disabled",
						},
					}));
				},
				pause: () => {
					if (get().playback.status !== "playing") return;
					set((state) => ({
						playback: { ...state.playback, status: "paused" },
					}));
				},
				resume: () => {
					if (!get().playback.available) return;
					set((state) => ({
						playback: { ...state.playback, status: "playing" },
					}));
				},
				status: available ? "playing" : "disabled",
				toggle: () => {
					if (!get().playback.available) return;
					set((state) => ({
						playback: {
							...state.playback,
							status:
								state.playback.status === "playing" ? "paused" : "playing",
						},
					}));
				},
			},
		};
	};
