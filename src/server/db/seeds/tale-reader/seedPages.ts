import { entries, pages, tales } from "~/server/db/schema";
import type { EntryType } from "~/server/db/types/tale-reader/entry";
import type { PageType } from "~/server/db/types/tale-reader/page";
import { db } from "../..";
import { isBranchedTaleSlug } from "./branchedTales";

type PageSeed = {
	taleId: number;
	partId: number;
	entryId: number;
	type: PageType;
	isPaginated: boolean;
	index: number;
};

export async function seedPages() {
	const allEntries = await db
		.select({
			id: entries.id,
			taleId: entries.taleId,
			partId: entries.partId,
			type: entries.type,
		})
		.from(entries);
	const allTales = await db
		.select({
			id: tales.id,
			slug: tales.slug,
		})
		.from(tales);
	const taleSlugById = new Map(
		allTales.map((tale) => [tale.id, tale.slug] as const),
	);

	const pagesData: PageSeed[] = allEntries.flatMap((entry) => {
		const taleSlug = taleSlugById.get(entry.taleId) ?? "";
		const specialPageType = getSpecialPageType(entry.type);
		if (specialPageType) {
			return [
				{
					taleId: entry.taleId,
					partId: entry.partId,
					entryId: entry.id,
					type: specialPageType,
					isPaginated: false,
					index: 0,
				},
			];
		}

		if (isBranchedTaleSlug(taleSlug)) {
			return createBookPages(entry, 2);
		}

		return createBookPages(entry, 3);
	});

	await db.insert(pages).values(pagesData);
	console.log(
		`✅ Seeded ${pagesData.length} pages for ${allEntries.length} entries.`,
	);
}

function createBookPages(
	entry: { id: number; taleId: number; partId: number },
	count: number,
): PageSeed[] {
	return Array.from({ length: count }).map((_, pageIndex) => ({
		taleId: entry.taleId,
		partId: entry.partId,
		entryId: entry.id,
		type: "book",
		isPaginated: true,
		index: pageIndex,
	}));
}

function getSpecialPageType(entryType: EntryType): PageType | null {
	switch (entryType) {
		case "cover":
			return "illustration";
		case "map":
			return "map";
		case "quote":
			return "quote";
		case "table_of_contents":
			return "custom";
		case "timeline":
			return "timeline";
		default:
			return null;
	}
}
