import type { StateCreator } from "zustand/vanilla";
import type {
	Tale,
	BlockMeta,
} from "~/features/tale-reader/types/taleStructure";
import type { TaleReaderState } from "../createTaleReaderStore";

export type TaleSlice = {
	tale: Tale;
	setTale: (tale: Tale) => void;
	getBlocksBySectionId: (sectionId: number) => BlockMeta[];

	isStructureMounted: boolean;
	setIsStructureMounted: (value: boolean) => void;

	isLayoutReady: boolean;
	setIsLayoutReady: (value: boolean) => void;

	hasRestoredInitialPosition: boolean;
	setHasRestoredInitialPosition: (value: boolean) => void;
};

export const createTaleSlice =
	(initialTale: Tale): StateCreator<TaleReaderState, [], [], TaleSlice> =>
	(set, get) => ({
		tale: initialTale,
		setTale: (tale) => set({ tale }),

		getBlocksBySectionId: (sectionId) => {
			const tale = get().tale;
			const section = tale.structure.indexMap.sectionsById[sectionId];
			if (!section) return [];

			const { blocksById } = tale.structure.indexMap;

			return section.blockIds
				.map((id) => blocksById[id])
				.filter((block): block is BlockMeta => !!block);
		},

		isStructureMounted: false,
		setIsStructureMounted: (value) => set({ isStructureMounted: value }),

		isLayoutReady: false,
		setIsLayoutReady: (value) => set({ isLayoutReady: value }),

		hasRestoredInitialPosition: false,
		setHasRestoredInitialPosition: (value) =>
			set({ hasRestoredInitialPosition: value }),
	});
