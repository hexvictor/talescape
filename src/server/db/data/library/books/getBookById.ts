import "server-only";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";

export async function getBookById(id: number) {
	const user = await auth();
	if (!user.userId) throw new Error("Unauthorized");

	const book = await db.query.books.findFirst({
		where: (model, { eq }) => eq(model.id, id),
	});

	if (!book) throw new Error("Book not found");
	if (book.userId !== user.userId) throw new Error("Unauthorized");

	return book;
}
