import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createTaleReaderStore";

export type ReaderSlice = {
	reader: {
		isStructureMounted: boolean;
		setIsStructureMounted: (value: boolean) => void;

		isLayoutReady: boolean;
		setIsLayoutReady: (value: boolean) => void;

		isInitialLoadComplete: boolean;
		setIsInitialLoadComplete: (value: boolean) => void;

		hasRestoredInitialPosition: boolean;
		setHasRestoredInitialPosition: (value: boolean) => void;

		isViewportRebuilding: boolean;
		setIsViewportRebuilding: (value: boolean) => void;
	};
};

export const createReaderSlice =
	(): StateCreator<TaleReaderState, [], [], ReaderSlice> => (set) => ({
		reader: {
			isStructureMounted: false,
			setIsStructureMounted: (value) =>
				set((state) => ({
					reader: {
						...state.reader,
						isStructureMounted: value,
					},
				})),

			isLayoutReady: false,
			setIsLayoutReady: (value) =>
				set((state) => ({
					reader: {
						...state.reader,
						isLayoutReady: value,
					},
				})),

			isInitialLoadComplete: false,
			setIsInitialLoadComplete: (value) =>
				set((state) => ({
					reader: {
						...state.reader,
						isInitialLoadComplete: value,
					},
				})),

			hasRestoredInitialPosition: false,
			setHasRestoredInitialPosition: (value) =>
				set((state) => ({
					reader: {
						...state.reader,
						hasRestoredInitialPosition: value,
					},
				})),

			isViewportRebuilding: false,
			setIsViewportRebuilding: (value) =>
				set((state) => ({
					reader: {
						...state.reader,
						isViewportRebuilding: value,
					},
				})),
		},
	});
