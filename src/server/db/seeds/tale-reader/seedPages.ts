import { entries, pages } from "~/server/db/schema";
import { db } from "../..";

type PageSeed = {
	taleId: number;
	partId: number;
	entryId: number;
	type: "book";
	isPaginated: boolean;
	index: number;
};

export async function seedPages() {
	const allEntries = await db
		.select({
			id: entries.id,
			taleId: entries.taleId,
			partId: entries.partId,
		})
		.from(entries);

	const pagesData: PageSeed[] = allEntries.flatMap((entry) =>
		Array.from({ length: entry.taleId === 10 ? 2 : 3 }).map((_, pageIndex) => ({
			taleId: entry.taleId,
			partId: entry.partId,
			entryId: entry.id,
			type: "book" as const,
			isPaginated: true,
			index: pageIndex,
		})),
	);

	await db.insert(pages).values(pagesData);
	console.log(
		`✅ Seeded ${pagesData.length} pages for ${allEntries.length} entries.`,
	);
}
