import "server-only";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export async function getBooksByCurrentUser() {
	const user = await auth();
	if (!user.userId) throw new Error("Unauthorized");

	return await db.query.books.findMany({
		where: (model, { eq }) => eq(model.creatorId, user.userId),
		orderBy: (model, { desc }) => desc(model.id),
	});
}
