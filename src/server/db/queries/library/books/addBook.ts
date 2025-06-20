import "server-only";
import { db } from "~/server/db";
import { books, type NewBook } from "~/server/db/schema";

export async function addBook(book: NewBook): Promise<void> {
  await db.insert(books).values(book);
}
