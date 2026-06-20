import type { StateCreator } from "zustand/vanilla";
import type { Tale } from "../../types";
import type { TaleReaderState } from "../createTaleStore";

export type TaleSlice = {
	tale: {
		data: Tale;
		setData: (
			tale: Tale,
			options?: { reason?: string; recompile?: boolean },
		) => void;
	};
};

export const createTaleSlice =
	(initialTale: Tale): StateCreator<TaleReaderState, [], [], TaleSlice> =>
	(set) => ({
		tale: {
			data: initialTale,
			setData: (data, options = {}) =>
				set((state) => ({
					engine:
						options.recompile === false
							? state.engine
							: {
									...state.engine,
									invalidationReason: options.reason ?? "tale-data-updated",
									ready: false,
									revision: state.engine.revision + 1,
									status: "measuring",
								},
					tale: { ...state.tale, data },
				})),
		},
	});
