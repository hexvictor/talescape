import { mapByKey } from "~/lib/utils/array";
import type {
	EmbeddedBlock,
	Part,
	PartWithRange,
} from "~/server/db/data/tale-reader/types/tales";
import type { IdListMap } from "~/types/utils";

export function formatPartsByBlockIds(
	parts: PartWithRange[],
	blocks: EmbeddedBlock[],
): Record<string, number> {
	const blockIdToIndex = Object.fromEntries(
		blocks.map((block, index) => [block.id, index]),
	);

	const pairs = parts.flatMap((part) => {
		if (part.firstBlockId === null) {
			return [];
		}
		if (part.lastBlockId === null) {
			return [];
		}
		const start = blockIdToIndex[part.firstBlockId];
		const end = blockIdToIndex[part.lastBlockId];

		if (start === undefined || end === undefined || start > end) {
			throw new Error(`Invalid block range for part ${part.id}`);
		}

		return blocks
			.slice(start, end + 1)
			.map((block) => [String(block.id), part.id]);
	});

	return Object.fromEntries(pairs);
}

export function formatPartsById(
	parts: PartWithRange[],
	entriesByPartId: IdListMap,
	pagesByEntryId: IdListMap,
): Record<string, Part> {
	return mapByKey(
		parts.map((part, i) => {
			const entryIds = entriesByPartId[part.id];
			if (!entryIds) {
				throw new Error(`No entryIds found for part ID: ${part.id}`);
			}
			const firstEntryId = entryIds[0];
			const lastEntryId = entryIds[entryIds.length - 1];

			const entryCount = entryIds.length;

			const pageCount = entryIds.reduce((acc, current, i, array) => {
				const pageIds = pagesByEntryId[current];
				if (pageIds) {
					const currentPageCount = pageIds.length;
					return acc + currentPageCount;
				}
				return acc;
			}, 0);

			const isFirstPart = i === 0;
			const isLastPart = i === parts.length - 1;

			return {
				...part,
				entryIds,
				firstEntryId,
				lastEntryId,
				entryCount,
				pageCount,
				isFirstPart,
				isLastPart,
			};
		}),
		"id",
	);
}
