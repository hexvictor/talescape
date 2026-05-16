import { db } from "~/server/db";
import { type PartSchema, parts, tales } from "~/server/db/schema";

type PartSeed = Pick<PartSchema, "taleId" | "title" | "index">;

export async function seedParts() {
	const allTales = await db.select({ id: tales.id }).from(tales);

	const allParts: PartSeed[] = allTales.flatMap((tale) =>
		Array.from({ length: 2 }).map(
			(_, partIndex): PartSeed => ({
				taleId: tale.id,
				title: `Part ${partIndex + 1}`,
				index: partIndex,
			}),
		),
	);

	await db.insert(parts).values(allParts);
	console.log(`✅ Seeded ${allParts.length} parts.`);
}
