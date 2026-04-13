import "server-only";
import { db } from "~/server/db";
import { authors } from "~/server/db/schema";

export async function getAuthors() {
	return await db.query.authors.findMany({
		orderBy: (model, { desc }) => desc(model.id),
	});
}
