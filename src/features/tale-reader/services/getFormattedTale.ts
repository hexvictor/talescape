import { getBlocks } from "~/server/db/queries/taleReader/blocks";
import { getFragments } from "~/server/db/queries/taleReader/fragments";
import { getPages } from "~/server/db/queries/taleReader/pages";
import { getSections } from "~/server/db/queries/taleReader/sections";
import type { TaleSchema } from "~/server/db/schema";
import { formatTaleStructure } from "../utils/format";
import { getEntries } from "~/server/db/queries/taleReader/entries";
import { getParts } from "~/server/db/queries/taleReader/parts";

export async function getFormattedTale(tale: TaleSchema) {
	const [pages, entries, parts, blocks, sections, fragments] =
		await Promise.all([
			getPages(tale.id),
			getEntries(tale.id),
			getParts(tale.id),
			getBlocks(tale.id),
			getSections(tale.id),
			getFragments(tale.id),
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
