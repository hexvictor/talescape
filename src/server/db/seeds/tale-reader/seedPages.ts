import { db } from "../..";
import { pages } from "../../schema";
import { talePartMap } from "./seedEntries";

type PageSeed = {
	taleId: number;
	partId: number;
	entryId: number;
	type: "book";
	isPaginated: boolean;
	index: number;
};

export async function seedPages() {
	const pagesData: PageSeed[] = [];

	let entryId = 1;

	for (const { taleId, partIds } of talePartMap) {
		for (const partId of partIds) {
			for (let entryIndex = 0; entryIndex < 5; entryIndex++) {
				for (let pageIndex = 0; pageIndex < 5; pageIndex++) {
					const isPaginated = ![0, 3].includes(pageIndex); // 0 = first, 3 = fourth page
					pagesData.push({
						taleId,
						partId,
						entryId,
						type: "book",
						isPaginated,
						index: pageIndex,
					});
				}
				entryId++; // next entry
			}
		}
	}

	await db.insert(pages).values(pagesData); // use your actual table name
	console.log(
		`✅ Seeded ${pagesData.length} pages for ${entryId - 1} entries.`,
	);
}
