import { mapByKey } from "~/lib/utils/array";
import type { PageSchema } from "~/server/db/schema";
import type {
  EmbeddedBlock,
  EntryWithRange,
  PageMeta,
  PartWithRange,
} from "~/features/tale-reader/types/taleStructure";
import type { IdListMap } from "~/types/utils";

export function formatPageByBlockId(
  pages: PageSchema[],
  blocks: EmbeddedBlock[]
): Record<string, PageSchema> {
  return Object.fromEntries(
    blocks.flatMap((block) => {
      const page = pages.find((page) => page.id === block.pageId);
      if (!page) return []; // skip if no page found
      return [[block.id, page]];
    })
  );
}

export function formatPagesByEntryId(
  pages: PageSchema[],
  entries: EntryWithRange[]
): IdListMap {
  return Object.fromEntries(
    entries.map((entry) => [
      entry.id,
      pages.filter((page) => page.entryId === entry.id).map((page) => page.id),
    ])
  );
}

export function formatPagesByPartId(
  pages: PageSchema[],
  parts: PartWithRange[]
): IdListMap {
  return Object.fromEntries(
    parts.map((part) => [
      part.id,
      pages.filter((page) => page.partId === part.id).map((page) => page.id),
    ])
  );
}

export function formatPagesById(
  pages: PageSchema[],
  numberedPageIds: number[],
  blocksByPageId: Record<string, number>,
  pagesByEntryId: IdListMap,
  pagesByPartId: IdListMap
): Record<string, PageMeta> {
  return mapByKey(
    pages.map((page, i) => {
      const blockId = blocksByPageId[page.id];
      if (!blockId) {
        // console.log(blocksByPageId);
        // console.log(page.id);
        throw new Error(`No block found for page ID: ${page.id}`);
      }
      const numberedPageIndex = numberedPageIds.findIndex(
        (pageId) => pageId === page.id
      );
      const pageNumber =
        numberedPageIndex === -1 ? null : numberedPageIndex + 1;
      const globalPageNumber = i + 1;

      const isFirst = i === 0;
      const isLast = i === pages.length - 1;

      const entryPageIds = pagesByEntryId[page.entryId];
      if (!entryPageIds) {
        throw new Error(
          `No Entry found for page ID: ${page.id} with Entry ID: ${page.entryId}`
        );
      }
      const isFirstInEntry = page.id === entryPageIds[0];
      const isLastInEntry = page.id === entryPageIds[entryPageIds.length - 1];
      const globalIndex = i;

      const partPageIds = pagesByPartId[page.partId];
      if (!partPageIds) {
        throw new Error(
          `No PageIds found for page ID: ${page.id} with Part ID: ${page.partId}`
        );
      }
      const isFirstInPart = page.id === partPageIds[0];
      const isLastInPart = page.id === partPageIds[partPageIds.length - 1];
      return {
        ...page,
        blockId,
        pageNumber,
        globalPageNumber,
        globalIndex,
        isFirst,
        isLast,
        isFirstInEntry,
        isLastInEntry,
        isFirstInPart,
        isLastInPart,
      };
    }),
    "id"
  );
}
