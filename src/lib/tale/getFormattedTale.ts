import { getBlocksWithEmbed } from "~/server/db/queries/taleReader/blocks";
import { getEntriesWithRanges } from "~/server/db/queries/taleReader/entries";
import { getFragmentsWithEmbed } from "~/server/db/queries/taleReader/fragments";
import { getPages } from "~/server/db/queries/taleReader/pages";
import { getPartsWithRanges } from "~/server/db/queries/taleReader/parts";
import { getSectionsWithEmbed } from "~/server/db/queries/taleReader/sections";
import type { TaleSchema } from "~/server/db/schema";
import { formatTaleStructure } from "./format";

export async function getFormattedTale(tale: TaleSchema) {
  const [pages, entries, parts, blocks, sections, fragments] =
    await Promise.all([
      getPages(tale.id),
      getEntriesWithRanges(tale.id),
      getPartsWithRanges(tale.id),
      getBlocksWithEmbed(tale.id),
      getSectionsWithEmbed(tale.id),
      getFragmentsWithEmbed(tale.id),
    ]);

  return formatTaleStructure({
    tale,
    pages,
    entries,
    parts,
    blocks,
    sections,
    fragments,
  });
}
