import type { StateCreator } from "zustand/vanilla";
import type { Tale } from "~/server/db/data/tale-reader/types/tales";
import type { TaleReaderState } from "../createTaleReaderStore";

export type TaleSlice = {
	tale: {
		data: Tale;
		set: (tale: Tale) => void;
	};
};

export const createTaleSlice =
	(initialTale: Tale): StateCreator<TaleReaderState, [], [], TaleSlice> =>
	(set) => ({
		tale: {
			data: initialTale,
			set: (tale) =>
				set((state) => ({
					tale: {
						...state.tale,
						data: tale,
					},
				})),
		},
	});
