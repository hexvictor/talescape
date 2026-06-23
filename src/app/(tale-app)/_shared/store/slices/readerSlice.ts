import type { StateCreator } from "zustand/vanilla";
import type { CompiledReader } from "../../types";
import type { TaleReaderState } from "../createTaleReaderStore";

export type ReaderSlice = {
	reader: {
		compiled: CompiledReader | null;
		measurementBlockIds: string[];
		setCompiled: (compiled: CompiledReader | null) => void;
		setMeasurementBlockIds: (blockIds: string[]) => void;
	};
};

/**
 * Creates the compiled reader data slice.
 *
 * @param set - Zustand state setter.
 * @returns Reader data state and actions.
 *
 * @example
 * const slice = createReaderSlice(set, get, api);
 */
export const createReaderSlice: StateCreator<
	TaleReaderState,
	[],
	[],
	ReaderSlice
> = (set) => ({
	reader: {
		compiled: null,
		measurementBlockIds: [],
		setCompiled: (compiled) =>
			set((state) => ({ reader: { ...state.reader, compiled } })),
		setMeasurementBlockIds: (measurementBlockIds) =>
			set((state) => ({ reader: { ...state.reader, measurementBlockIds } })),
	},
});
