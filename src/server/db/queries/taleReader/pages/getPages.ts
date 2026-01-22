import { cache } from "react";
import { db } from "~/server/db";
import type { PageSchema } from "~/server/db/schema";

export async function getPagesQuery(taleId: number): Promise<PageSchema[]> {
  return await db.query.pages.findMany({
    where: (e, { eq }) => eq(e.taleId, taleId),
  });
}

export const getPages = cache(getPagesQuery);
