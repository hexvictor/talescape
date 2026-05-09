import type { TaleEntry } from "../../types/entries";
import type {
	DerivedTaleIndexes,
	FlatTaleRecord,
} from "../tale/formatTaleContext";
import { siblingId } from "../tale/formatTaleContext";

export function formatEntries(
	flat: FlatTaleRecord,
	derived: DerivedTaleIndexes,
): TaleEntry[] {
	let chapterCount = 0;
	const entryIds = flat.entries.map((entry) => entry.id);

	return flat.entries.map((entry, index) => {
		const { blocks, pages, ...baseEntry } = entry;
		const pageIds = derived.pageIdsByEntryId[entry.id] ?? [];
		const blockIds = derived.blockIdsByEntryId[entry.id] ?? [];
		const partEntryIds = derived.entryIdsByPartId[entry.partId] ?? [];
		const isChapter = entry.type === "chapter";
		const localChapterIndex =
			derived.chapterIdsByPartId[entry.partId]?.indexOf(entry.id) ?? -1;

		if (isChapter) chapterCount += 1;

		return {
			...baseEntry,
			children: {
				pageIds,
				blockIds,
			},
			links: {
				previousEntryId: siblingId(entryIds, entry.id, -1),
				nextEntryId: siblingId(entryIds, entry.id, 1),
				previousEntryIdInPart: siblingId(partEntryIds, entry.id, -1),
				nextEntryIdInPart: siblingId(partEntryIds, entry.id, 1),
			},
			bounds: {
				firstPageId: pageIds[0] ?? null,
				lastPageId: pageIds.at(-1) ?? null,
				firstBlockId: blockIds[0] ?? null,
				lastBlockId: blockIds.at(-1) ?? null,
			},
			counts: {
				pages: pageIds.length,
				blocks: blockIds.length,
			},
			position: {
				index,
				entryNumber: index + 1,
				isFirst: index === 0,
				isLast: index === flat.entries.length - 1,
				isFirstInPart: partEntryIds[0] === entry.id,
				isLastInPart: partEntryIds.at(-1) === entry.id,
			},
			chapter: {
				isChapter,
				number: isChapter ? chapterCount : null,
				localNumber:
					isChapter && localChapterIndex >= 0 ? localChapterIndex + 1 : null,
			},
		};
	});
}
