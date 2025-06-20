import { db } from "~/server/db";
import type { PartSchema } from "~/server/db/schema";

export async function getParts(taleId: number): Promise<PartSchema[]> {
  return await db.query.parts.findMany({
    where: (p, { eq }) => eq(p.taleId, taleId),
  });
}
