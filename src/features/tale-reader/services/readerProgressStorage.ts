import type { Tale } from "~/server/db/data/tale-reader/types/tales";
import type { ReaderProgressSchema } from "~/server/db/schema";

export function getInitialProgressFromLocalStorage(
	tale: Tale,
): ReaderProgressSchema {
	const defaultProgress = createDefaultProgress(tale);

	if (typeof window === "undefined") {
		return defaultProgress;
	}

	const lsProgressKey = `tale_progress_${tale.id}`;
	const lsProgress = window.localStorage.getItem(lsProgressKey);

	try {
		const lsParsedProgress = lsProgress ? JSON.parse(lsProgress) : null;
		if (lsParsedProgress) return lsParsedProgress;
	} catch {}

	window.localStorage.setItem(lsProgressKey, JSON.stringify(defaultProgress));
	return defaultProgress;
}

function createDefaultProgress(tale: Tale): ReaderProgressSchema {
	const { id: taleId } = tale;
	const { blockIds } = tale.content.order;

	const firstBlockId = blockIds[0] ?? null;
	const initialProgress =
		blockIds.length > 0 ? (1 / blockIds.length).toFixed(4) : "0";

	return {
		id: -1,
		userId: "localStorage",
		taleId,
		updatedAt: new Date(),
		seenBlockIds: firstBlockId ? [firstBlockId] : [],
		lastBlockId: firstBlockId,
		maxBlockIdReached: firstBlockId,
		activePathIds: [],
		seenPathIds: [],
		seenBlockProgress: initialProgress,
		maxReadProgress: initialProgress,
	};
}
