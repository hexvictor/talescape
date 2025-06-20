import { db } from "~/server/db";

export async function getSectionsByIds(sectionIds: number[]) {
  return await db.query.sections.findMany({
    where: (section, { inArray }) => inArray(section.id, sectionIds),
  });
}
