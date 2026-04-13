import "server-only";
import { db } from "~/server/db";

export async function getAllPublishedBooks() {
	return await db.query.books.findMany({
		where: (model, { eq }) => eq(model.status, "published"),
		orderBy: (model, { desc }) => desc(model.id),
		with: {
			author: true,
		},
	});
}
