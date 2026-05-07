import type { TalePage } from "../../types/pages";
import type {
	DerivedTaleIndexes,
	FlatTaleRecord,
} from "../tale/formatTaleContext";
import { siblingId } from "../tale/formatTaleContext";

export function formatPages(
	flat: FlatTaleRecord,
	derived: DerivedTaleIndexes,
): TalePage[] {
	let numberedPageCount = 0;
	const pageIds = flat.pages.map((page) => page.id);

	return flat.pages.map((page, index) => {
		const { blocks, ...basePage } = page;
		const blockIds = derived.blockIdsByPageId[page.id] ?? [];
		const entryPageIds = derived.pageIdsByEntryId[page.entryId] ?? [];
		const partPageIds = derived.pageIdsByPartId[page.partId] ?? [];

		if (page.isPaginated) numberedPageCount += 1;

		return {
			...basePage,
			children: {
				blockIds,
			},
			links: {
				previousPageId: siblingId(pageIds, page.id, -1),
				nextPageId: siblingId(pageIds, page.id, 1),
				previousPageIdInEntry: siblingId(entryPageIds, page.id, -1),
				nextPageIdInEntry: siblingId(entryPageIds, page.id, 1),
				previousPageIdInPart: siblingId(partPageIds, page.id, -1),
				nextPageIdInPart: siblingId(partPageIds, page.id, 1),
			},
			bounds: {
				firstBlockId: blockIds[0] ?? null,
				lastBlockId: blockIds.at(-1) ?? null,
			},
			counts: {
				blocks: blockIds.length,
			},
			position: {
				index,
				globalPageNumber: index + 1,
				pageNumber: page.isPaginated ? numberedPageCount : null,
				isFirst: index === 0,
				isLast: index === flat.pages.length - 1,
				isFirstInEntry: entryPageIds[0] === page.id,
				isLastInEntry: entryPageIds.at(-1) === page.id,
				isFirstInPart: partPageIds[0] === page.id,
				isLastInPart: partPageIds.at(-1) === page.id,
			},
		};
	});
}
