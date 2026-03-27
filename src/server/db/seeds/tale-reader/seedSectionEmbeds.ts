import { db } from "~/server/db";
import { sectionEmbeds, type SectionEmbedSchema } from "../../schema";

// Cada tale possui 4 seções (index 0 a 3), com taleId de 1 a 9
export async function seedSectionEmbeds() {
  const embeds: Pick<SectionEmbedSchema, "sectionId" | "taleId" | "isSnap" |"index">[] =
    [];

  for (let taleId = 1; taleId <= 9; taleId++) {
    for (let index = 0; index < 4; index++) {
      const sectionId = (taleId - 1) * 4 + index + 1;

      embeds.push({
        sectionId,
        taleId,
        isSnap: false,
        index,
      });
    }
  }

  await db.insert(sectionEmbeds).values(embeds);
  console.log(`✅ Seeded ${embeds.length} sectionEmbeds.`);
}
