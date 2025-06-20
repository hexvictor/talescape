import "server-only";
import { db } from "~/server/db";
import { authors } from "~/server/db/schema";
import type { NewAuthor } from "~/server/db/schema/library/authors";

export async function addAuthor(author: NewAuthor): Promise<void> {
  await db.insert(authors).values(author);
}
