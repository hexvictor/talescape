import { db } from "~/server/db";
import { parts, type PartSchema } from "../../schema";

type PartSeed = Pick<PartSchema, "taleId" | "title" | "index">;

export async function seedParts() {
  const allParts: PartSeed[] = Array.from({ length: 9 }).flatMap(
    (_, taleIndex) =>
      Array.from({ length: taleIndex === 0 ? 1 : 2 }).map(
        (_, partIndex): PartSeed => ({
          taleId: taleIndex + 1, // 1 to 9
          title: `Part ${partIndex + 1}`,
          index: partIndex,
        })
      )
  );

  await db.insert(parts).values(allParts);
  console.log(`✅ Seeded ${allParts.length} parts.`);
}
