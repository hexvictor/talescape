import type { Tale } from "~/server/db/data/tale-reader/types/tales";
import type { TaleProgressSchema } from "~/server/db/schema";

export function getInitialProgressFromLocalStorage(
	tale: Tale,
): TaleProgressSchema {
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

function createDefaultProgress(tale: Tale): TaleProgressSchema {
	const {
		id: taleId,
		structure: { blockIds },
	} = tale;

	const firstBlockId = blockIds[0] ?? null;

	return {
		id: -1,
		userId: "localStorage",
		taleId,
		updatedAt: new Date(),
		seenBlockIds: firstBlockId ? [firstBlockId] : [],
		lastBlockId: firstBlockId,
		maxBlockIdReached: firstBlockId,
		seenBlockProgress: (1 / blockIds.length).toFixed(4),
		maxReadProgress: (1 / blockIds.length).toFixed(4),
	};
}
