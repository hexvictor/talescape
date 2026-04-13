import { db } from "~/server/db";
import { entries, type EntrySchema } from "../../schema";
type EntrySeed = Pick<
	EntrySchema,
	"taleId" | "partId" | "title" | "type" | "index"
>;

export const talePartMap = [
	{ taleId: 1, partIds: [1] },
	{ taleId: 2, partIds: [2, 3] },
	{ taleId: 3, partIds: [4, 5] },
	{ taleId: 4, partIds: [6, 7] },
	{ taleId: 5, partIds: [8, 9] },
	{ taleId: 6, partIds: [10, 11] },
	{ taleId: 7, partIds: [12, 13] },
	{ taleId: 8, partIds: [14, 15] },
	{ taleId: 9, partIds: [16, 17] },
];

export async function seedEntries() {
	const allEntries: EntrySeed[] = talePartMap.flatMap(({ taleId, partIds }) =>
		partIds.flatMap((partId) =>
			Array.from({ length: 5 }).map(
				(_, index): EntrySeed => ({
					taleId,
					partId,
					title: `Entry ${index + 1}`,
					type: index === 2 ? "prologue" : "chapter",
					index,
				}),
			),
		),
	);

	await db.insert(entries).values(allEntries);
	console.log(`✅ Seeded ${allEntries.length} entries`);
}
