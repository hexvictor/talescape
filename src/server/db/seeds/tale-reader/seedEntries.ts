import { db } from "~/server/db";
import { type EntrySchema, entries, parts } from "~/server/db/schema";

type EntrySeed = Pick<
	EntrySchema,
	"taleId" | "partId" | "title" | "type" | "index"
>;

export async function seedEntries() {
	const allParts = await db
		.select({
			id: parts.id,
			taleId: parts.taleId,
			index: parts.index,
		})
		.from(parts);

	const seeds: EntrySeed[] = [];

	for (const part of allParts) {
		if (part.taleId === 10) {
			if (part.index === 0) {
				seeds.push(
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Beginning",
						type: "prologue",
						index: 0,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "First Path",
						type: "chapter",
						index: 1,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Third Path",
						type: "chapter",
						index: 2,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Second Path I",
						type: "chapter",
						index: 3,
					},
				);
			} else {
				seeds.push(
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Second Path II",
						type: "chapter",
						index: 0,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Fourth Path I",
						type: "chapter",
						index: 1,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Fourth Path II",
						type: "chapter",
						index: 2,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "The Choice",
						type: "chapter",
						index: 3,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "The Good Choice",
						type: "chapter",
						index: 4,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "The Bad Choice",
						type: "chapter",
						index: 5,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Ending",
						type: "chapter",
						index: 6,
					},
				);
			}

			continue;
		}

		for (let i = 0; i < 3; i++) {
			seeds.push({
				taleId: part.taleId,
				partId: part.id,
				title: `Entry ${part.index * 3 + i + 1}`,
				type: i === 0 && part.index === 0 ? "prologue" : "chapter",
				index: i,
			});
		}
	}

	await db.insert(entries).values(seeds);
	console.log(`✅ Seeded ${seeds.length} entries`);
}
