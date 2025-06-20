import { db } from "~/server/db";

export async function getFragmentsByIds(fragmentIds: number[]) {
  return await db.query.fragments.findMany({
    where: (f, { inArray }) => inArray(f.id, fragmentIds),
  });
}
