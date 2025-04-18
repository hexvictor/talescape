import "server-only";
import { db } from "../";
import type { string } from "zod";
import { books } from "../schema";
import { auth } from "@clerk/nextjs/server";
import type { AddBookProps } from "../types/book";

// Add filters in the future
export async function getMyBooks() {
	const user = await auth();

	if (!user.userId) throw new Error("Unauthorized");
	const books = await db.query.books.findMany({
		where: (model, { eq }) => eq(model.userId, user.userId),
		orderBy: (model, { desc }) => desc(model.id),
	});
	return books;
}

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

// Add filters in the future
export async function getPublishedBooks() {
	const books = await db.query.books.findMany({
		where: (model, { eq }) => eq(model.status, "published"),
		orderBy: (model, { desc }) => desc(model.id),
		with: {
			author: true,
		},
	});
	return books;
}

export async function addBook({
	title,
	userId,
	authorId,
	description,
	coverImageUrl,
	type,
	status,
}: AddBookProps): Promise<void> {
	await db.insert(books).values({
		title,
		userId,
		authorId,
		description,
		coverImageUrl,
		type,
		status,
	});
}
