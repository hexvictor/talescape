import type { TaleFragment } from "../../types/fragments";
import type {
	DerivedTaleIndexes,
	FlatTaleRecord,
} from "../tale/formatTaleContext";
import { siblingId } from "../tale/formatTaleContext";

export function formatFragments(
	flat: FlatTaleRecord,
	derived: DerivedTaleIndexes,
): TaleFragment[] {
	const fragmentIds = flat.fragments.map((fragment) => fragment.id);

	return flat.fragments.map((fragment, index) => {
		const block = derived.blockById[fragment.blockId];
		const blockFragmentIds =
			derived.fragmentIdsByBlockId[fragment.blockId] ?? [];

		return {
			...fragment,
			sectionId: block?.sectionId ?? -1,
			links: {
				previousFragmentId: siblingId(fragmentIds, fragment.id, -1),
				nextFragmentId: siblingId(fragmentIds, fragment.id, 1),
				previousFragmentIdInBlock: siblingId(blockFragmentIds, fragment.id, -1),
				nextFragmentIdInBlock: siblingId(blockFragmentIds, fragment.id, 1),
			},
			position: {
				index,
				isFirst: index === 0,
				isLast: index === flat.fragments.length - 1,
				isFirstInBlock: blockFragmentIds[0] === fragment.id,
				isLastInBlock: blockFragmentIds.at(-1) === fragment.id,
			},
		};
	});
}
