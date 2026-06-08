import type { StateCreator } from "zustand/vanilla";
import type { Tale } from "../../types";
import type { TaleReaderState } from "../createReaderStore";

export type TaleSlice = {
	tale: {
		data: Tale;
		setData: (tale: Tale) => void;
	};
};

export const createTaleSlice =
	(initialTale: Tale): StateCreator<TaleReaderState, [], [], TaleSlice> =>
	(set) => ({
		tale: {
			data: initialTale,
			setData: (data) =>
				set((state) => ({
					tale: { ...state.tale, data },
				})),
		},
	});
