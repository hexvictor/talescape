import type { StateCreator } from "zustand/vanilla";
import type {
	Anchor,
	ReaderLocation,
	SavedReaderProgress,
	Tale,
} from "../../types";
import type { TaleReaderState } from "../createTaleReaderStore";

export type NavigationSlice = {
	navigation: {
		currentAnchor: Anchor | null;
		current: ReaderLocation | null;
		selectedBranchIds: string[];
		setCurrent: (location: ReaderLocation, anchor: Anchor) => void;
		setSelectedBranchIds: (ids: string[]) => void;
	};
};

export const createNavigationSlice =
	(
		_tale: Tale,
		progress: SavedReaderProgress,
	): StateCreator<TaleReaderState, [], [], NavigationSlice> =>
	(set) => ({
		navigation: {
			currentAnchor: null,
			current: null,
			selectedBranchIds: progress.selectedBranchIds,
			setCurrent: (current, currentAnchor) =>
				set((state) => ({
					navigation: { ...state.navigation, current, currentAnchor },
				})),
			setSelectedBranchIds: (selectedBranchIds) =>
				set((state) => ({
					navigation: { ...state.navigation, selectedBranchIds },
				})),
		},
	});
