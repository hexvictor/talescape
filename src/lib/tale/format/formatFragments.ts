import { mapByKey } from "~/lib/utils/array";
import type {
  EmbeddedBlock,
  EmbeddedFragment,
  FragmentMeta,
} from "~/types/tale-reader/taleStructure";
import type { IdListMap } from "~/types/utils";

export function formatFragmentsByBlockId(
  blocks: EmbeddedBlock[],
  fragments: EmbeddedFragment[]
): IdListMap {
  return Object.fromEntries(
    blocks.map((block) => [
      block.id,
      fragments
        .filter((fragment) => fragment.blockId === block.id)
        .map((fragment) => fragment.id),
    ])
  );
}

export function formatFragmentsById(
  fragments: EmbeddedFragment[],
  blocks: EmbeddedBlock[],
  fragmentsByBlockId: IdListMap
): Record<string, FragmentMeta> {
  return mapByKey(
    fragments.map((fragment, i) => {
      const block = blocks.find((block) => block.id === fragment.blockId);
      if (!block) {
        throw new Error(`No block found for fragment ID: ${fragment.id}`);
      }
      const sectionId = block.sectionId;
      const fragmentIds = fragmentsByBlockId[fragment.blockId];
      if (!fragmentIds) {
        throw new Error(
          `No fragmentIds found for block ID: ${block.id} from fragment ID: ${fragment.id}`
        );
      }
      const globalIndex = i;
      const isFirstFragment = fragment.index === 0;
      const isLastFragment = fragment.index === fragmentIds.length - 1;
      return {
        ...fragment,
        isFirstFragment,
        isLastFragment,
        sectionId,
        globalIndex,
      };
    }),
    "id"
  );
}
