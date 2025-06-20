import type {
  EmbeddedSection,
  SectionEmbedExtra,
} from "~/types/tale-reader/taleStructure";
import { db } from "~/server/db";
import { getSectionsByIds } from "./getSectionsByIds";

export async function getSectionsWithEmbed(
  taleId: number
): Promise<EmbeddedSection[]> {
  const sectionEmbeds = await db.query.sectionEmbeds.findMany({
    where: (e, { eq }) => eq(e.taleId, taleId),
  });

  const embedMap = new Map<string, SectionEmbedExtra>();
  for (const embed of sectionEmbeds) {
    if (embed.sectionId !== null) {
      embedMap.set(String(embed.sectionId), {
        index: embed.index,
      });
    }
  }

  const sectionIds = Array.from(embedMap.keys()).map(Number);
  const baseSections = await getSectionsByIds(sectionIds);

  return baseSections.map((section) => {
    const embed = embedMap.get(String(section.id));
    if (!embed) throw new Error(`Missing embed data for section ${section.id}`);
    return {
      ...section,
      ...embed,
    };
  });
}
