import { getBlocks } from "~/server/db/data/tale-reader/queries/blocks";
import { getEntries } from "~/server/db/data/tale-reader/queries/entries";
import { getFragments } from "~/server/db/data/tale-reader/queries/fragments";
import { getPages } from "~/server/db/data/tale-reader/queries/pages";
import { getParts } from "~/server/db/data/tale-reader/queries/parts";
import { getSections } from "~/server/db/data/tale-reader/queries/sections";
import type { TaleSchema } from "~/server/db/schema";
import { getUserInfo } from "../../../users/queries/getUserInfo";
import type { PublicUserInfo } from "../../../users/queries/users.types";
import { formatTaleStructure } from "../../formatters/tale/formatTaleStructure";
import type { Tale } from "../../types/tales";

export async function getTale(
	tale: TaleSchema,
	creator?: PublicUserInfo | null,
): Promise<Tale> {
	const [pages, entries, parts, blocks, sections, fragments] =
		await Promise.all([
			getPages(tale.id),
			getEntries(tale.id),
			getParts(tale.id),
			getBlocks(tale.id),
			getSections(tale.id),
			getFragments(tale.id),
		]);
	const creatorInfo = tale.creatorId ? await getUserInfo(tale.creatorId) : null;

	const formattedStructure = formatTaleStructure({
		pages,
		entries,
		parts,
		blocks,
		sections,
		fragments,
	});

	return {
		...tale,
		creator: creator ?? creatorInfo,
		structure: formattedStructure,
	};
}
