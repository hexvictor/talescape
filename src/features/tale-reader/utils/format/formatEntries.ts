import { mapByKey } from "~/lib/utils/array";
import type {
  EmbeddedBlock,
  EntryMeta,
  EntryWithRange,
  PartWithRange,
} from "~/features/tale-reader/types/taleStructure";
import type { IdListMap } from "~/types/utils";

export function formatEntriesByPartId(
  entries: EntryWithRange[],
  parts: PartWithRange[]
): IdListMap {
  return Object.fromEntries(
    parts.map((part) => [
      part.id,
      entries
        .filter((entry) => entry.partId === part.id)
        .map((entry) => entry.id),
    ])
  );
}

export function formatChapterNumbersByEntryId(
  chapters: EntryWithRange[]
): Record<string, number> {
  return Object.fromEntries(chapters.map((chapter, i) => [chapter.id, i + 1]));
}

export function formatLocalChapterNumbersByPartId(
  chapters: EntryWithRange[],
  parts: PartWithRange[]
): Record<string, number[]> {
  return Object.fromEntries(
    parts.map((part, i) => [
      part.id,
      chapters
        .filter((chapter) => chapter.partId === part.id)
        .map((chapter) => chapter.id),
    ])
  );
}

export function formatEntriesById(
  entries: EntryWithRange[],
  pagesByEntryId: IdListMap,
  entriesByPartId: IdListMap,
  chapterNumbersByEntryId: Record<string, number>,
  localChaptersByPartId: Record<string, number[]>
): Record<string, EntryMeta> {
  return mapByKey(
    entries.map((entry, i) => {
      const entryNumber = i + 1;

      const isChapter = entry.type === "chapter";

      const chapterNumber = isChapter
        ? chapterNumbersByEntryId[entry.id]
        : undefined;
      const localChapterNumber = isChapter
        ? localChaptersByPartId[entry.partId]?.findIndex(
            (localChapter) => localChapter === entry.id
          )
        : undefined;

      const isFirstEntry = i === 0;
      const isLastEntry = i === entries.length - 1;

      const pageIds = pagesByEntryId[entry.id];
      if (!pageIds) {
        throw new Error(
          `No PagesIds found for entry ID: ${entry.id} with Part ID: ${entry.partId}`
        );
      }
      const firstPageId = pageIds[0];
      const lastPageId = pageIds[pageIds.length - 1];
      const pageCount = pageIds?.length;

      const partEntryIds = entriesByPartId[entry.partId];
      if (!partEntryIds) {
        throw new Error(
          `No EntryIds found for entry ID: ${entry.id} with Part ID: ${entry.partId}`
        );
      }
      const globalIndex = i;
      const isFirstInPart = entry.index === 0;
      const isLastInPart = entry.index === partEntryIds.length - 1;
      return {
        ...entry,
        pageIds,
        firstPageId,
        lastPageId,
        isChapter,
        chapterNumber,
        entryNumber,
        localChapterNumber,
        globalIndex,
        pageCount,
        isFirstEntry,
        isLastEntry,
        isFirstInPart,
        isLastInPart,
      };
    }),
    "id"
  );
}

export function formatEntriesByBlockIds(
  entries: EntryWithRange[],
  blocks: EmbeddedBlock[]
): Record<string, number> {
  const blockIdToIndex = Object.fromEntries(
    blocks.map((block, index) => [block.id, index])
  );

  const pairs = entries.flatMap((entry) => {
    if (entry.firstBlockId === null) {
      return [];
    }
    if (entry.lastBlockId === null) {
      return [];
    }
    const start = blockIdToIndex[entry.firstBlockId];
    const end = blockIdToIndex[entry.lastBlockId];

    if (start === undefined || end === undefined || start > end) {
      throw new Error(`Invalid block range for entry ${entry.id}`);
    }

    return blocks
      .slice(start, end + 1)
      .map((block) => [String(block.id), entry.id]);
  });

  return Object.fromEntries(pairs);
}
