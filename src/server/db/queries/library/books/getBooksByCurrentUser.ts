import "server-only";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";

export async function getBooksByCurrentUser() {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  return await db.query.books.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });
}
