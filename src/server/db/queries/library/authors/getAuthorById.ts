import "server-only";
import { db } from "~/server/db";
import { authors } from "~/server/db/schema";

export async function getAuthorById(id: number) {
  return await db.query.authors.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });
}
