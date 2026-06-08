import type { StateCreator } from "zustand/vanilla";
import type { LayoutPhase } from "../../types";
import type { TaleReaderState } from "../createReaderStore";

export type EngineStatus = "idle" | "measuring" | "compiling" | "ready";

export type EngineSlice = {
	engine: {
		invalidationReason: string | null;
		phase: LayoutPhase;
		progress: number;
		ready: boolean;
		revision: number;
		status: EngineStatus;
		requestRecompile: (reason?: string) => void;
		setPhase: (phase: LayoutPhase) => void;
		setProgress: (progress: number) => void;
		setReady: (ready: boolean) => void;
		setStatus: (status: EngineStatus) => void;
	};
};

/**
 * Creates the reader engine status slice.
 *
 * @param set - Zustand state setter.
 * @returns Engine state and actions.
 *
 * @example
 * const slice = createEngineSlice(set, get, api);
 */
export const createEngineSlice: StateCreator<
	TaleReaderState,
	[],
	[],
	EngineSlice
> = (set) => ({
	engine: {
		invalidationReason: null,
		phase: "preparing-structure",
		progress: 0,
		ready: false,
		revision: 0,
		status: "idle",
		requestRecompile: (invalidationReason = "manual") =>
			set((state) => ({
				engine: {
					...state.engine,
					invalidationReason,
					revision: state.engine.revision + 1,
					status: "measuring",
				},
			})),
		setPhase: (phase) =>
			set((state) => ({ engine: { ...state.engine, phase } })),
		setProgress: (progress) =>
			set((state) => ({ engine: { ...state.engine, progress } })),
		setReady: (ready) =>
			set((state) => ({ engine: { ...state.engine, ready } })),
		setStatus: (status) =>
			set((state) => ({ engine: { ...state.engine, status } })),
	},
});
