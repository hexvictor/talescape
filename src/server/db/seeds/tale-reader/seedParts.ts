import { db } from "~/server/db";
import { type PartSchema, parts } from "~/server/db/schema";

type PartSeed = Pick<PartSchema, "taleId" | "title" | "index">;

export async function seedParts() {
	const allParts: PartSeed[] = Array.from({ length: 10 }).flatMap(
		(_, taleIndex) =>
			Array.from({ length: 2 }).map(
				(_, partIndex): PartSeed => ({
					taleId: taleIndex + 1,
					title: `Part ${partIndex + 1}`,
					index: partIndex,
				}),
			),
	);

	await db.insert(parts).values(allParts);
	console.log(`✅ Seeded ${allParts.length} parts.`);
}
