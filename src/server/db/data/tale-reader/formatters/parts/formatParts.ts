import type { TalePart } from "../../types/parts";
import type {
	DerivedTaleIndexes,
	FlatTaleRecord,
} from "../tale/formatTaleContext";
import { siblingId } from "../tale/formatTaleContext";

export function formatParts(
	flat: FlatTaleRecord,
	derived: DerivedTaleIndexes,
): TalePart[] {
	const partIds = flat.parts.map((part) => part.id);

	return flat.parts.map((part, index) => {
		const { blocks, entries, ...basePart } = part;
		const entryIds = derived.entryIdsByPartId[part.id] ?? [];
		const pageIds = derived.pageIdsByPartId[part.id] ?? [];
		const blockIds = derived.blockIdsByPartId[part.id] ?? [];

		return {
			...basePart,
			children: {
				entryIds,
				pageIds,
				blockIds,
			},
			links: {
				previousPartId: siblingId(partIds, part.id, -1),
				nextPartId: siblingId(partIds, part.id, 1),
			},
			bounds: {
				firstEntryId: entryIds[0] ?? null,
				lastEntryId: entryIds.at(-1) ?? null,
				firstPageId: pageIds[0] ?? null,
				lastPageId: pageIds.at(-1) ?? null,
				firstBlockId: blockIds[0] ?? null,
				lastBlockId: blockIds.at(-1) ?? null,
			},
			counts: {
				entries: entryIds.length,
				pages: pageIds.length,
				blocks: blockIds.length,
			},
			position: {
				index,
				isFirst: index === 0,
				isLast: index === flat.parts.length - 1,
			},
		};
	});
}
