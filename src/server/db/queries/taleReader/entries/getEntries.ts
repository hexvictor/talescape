import { db } from "~/server/db";
import type { EntrySchema } from "~/server/db/schema";

export async function getEntries(taleId: number): Promise<EntrySchema[]> {
  return await db.query.entries.findMany({
    where: (e, { eq }) => eq(e.taleId, taleId),
  });
}
