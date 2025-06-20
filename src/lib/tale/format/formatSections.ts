import { mapByKey } from "~/lib/utils/array";
import type { PageSchema } from "~/server/db/schema";
import type {
  EmbeddedBlock,
  EmbeddedSection,
  SectionMeta,
} from "~/types/tale-reader/taleStructure";
import type { IdListMap } from "~/types/utils";

export function formatSectionsById(
  sections: EmbeddedSection[],
  blocksBySectionId: IdListMap,
  pageByBlockId: Record<string, PageSchema>
): Record<string, SectionMeta> {
  return mapByKey(
    sections.map((section, i) => {
      const blockIds = blocksBySectionId[section.id];
      if (!blockIds) {
        throw new Error(`No blockIds found for section ID: ${section.id}`);
      }
      const firstBlockId = blockIds[0] ?? null;
      const lastBlockId = blockIds[blockIds.length - 1] ?? null;
      const blockCount = blockIds.length;

      const pageCount = blockIds.reduce((acc, current, i, array) => {
        const page = pageByBlockId[current];
        if (page) {
          return acc + 1;
        }
        return acc;
      }, 0);
      const isFirstSection = i === 0;
      const isLastSection = i === sections.length - 1;

      const isReel = section.layout === "reel";
      const isVertical = section.orientation === "vertical";

      return {
        ...section,
        isReel,
        isVertical,
        blockIds,
        firstBlockId,
        lastBlockId,
        blockCount,
        pageCount,
        isFirstSection,
        isLastSection,
      };
    }),
    "id"
  );
}
