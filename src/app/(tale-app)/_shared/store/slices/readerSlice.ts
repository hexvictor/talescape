import type { StateCreator } from "zustand/vanilla";
import type { CompiledReader } from "../../types";
import type { TaleReaderState } from "../createTaleReaderStore";

/**
 * Checks whether two block id lists represent the same measurement request.
 *
 * @param left - First block id list.
 * @param right - Second block id list.
 * @returns Whether both lists contain the same ids in the same order.
 *
 * @example
 * const unchanged = blockIdListsMatch(previousIds, nextIds);
 */
function blockIdListsMatch(left: string[], right: string[]): boolean {
	if (left.length !== right.length) return false;
	return left.every((id, index) => id === right[index]);
}

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
			set((state) => {
				if (
					blockIdListsMatch(state.reader.measurementBlockIds, measurementBlockIds)
				) {
					return state;
				}
				return { reader: { ...state.reader, measurementBlockIds } };
			}),
	},
});
