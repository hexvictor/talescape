import type { StateCreator } from "zustand/vanilla";
import type { NavigationTargetType } from "~/features/tale-reader/types/taleStructure";
import type { TaleReaderState } from "../createTaleReaderStore";

export type CommandsSlice = {
	goToBlock: (
		blockId: number,
		opts?: {
			scroll?: boolean;
			duration?: number;
		},
	) => void;
	goToTarget: (
		type: NavigationTargetType,
		id: number,
		opts?: {
			scroll?: boolean;
			duration?: number;
		},
	) => void;
	goToNextBlock: (opts?: { scroll?: boolean; duration?: number }) => void;
	goToPreviousBlock: (opts?: { scroll?: boolean; duration?: number }) => void;
	onActiveBlockChanged: (blockId: number) => void;
};

export const createCommandsSlice =
	(): StateCreator<TaleReaderState, [], [], CommandsSlice> => (set, get) => ({
		goToBlock: (blockId, opts) => {
			const state = get();
			const block = state.tale.structure.indexMap.blocksById[blockId];
			if (!block) return;

			state.setActiveBlockId(blockId);
			state.setNavigationByBlock(block);
			state.updateProgressByBlockId(blockId);

			if (opts?.scroll) {
				state.scrollApi?.scrollToBlockId(blockId, {
					duration: opts.duration,
				});
			}
		},

		goToTarget: (type, id, opts) => {
			const targetBlock = get().getTargetBlock(id, type);
			if (!targetBlock) return;
			get().goToBlock(targetBlock.id, opts);
		},

		goToNextBlock: (opts) => {
			const next = get().getNext("block");
			if (!next) return;
			get().goToBlock(next.id, opts);
		},

		goToPreviousBlock: (opts) => {
			const prev = get().getPrevious("block");
			if (!prev) return;
			get().goToBlock(prev.id, opts);
		},

		onActiveBlockChanged: (blockId) => {
			const state = get();
			const block = state.tale.structure.indexMap.blocksById[blockId];
			if (!block) return;

			state.setActiveBlockId(blockId);
			state.setNavigationByBlock(block);
			state.updateProgressByBlockId(blockId);
		},
	});
