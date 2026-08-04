import "server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export async function getTaleCreateOptions() {
	const { userId } = await auth();
	const user = userId
		? await db.query.users.findFirst({
				where: (model, { eq }) => eq(model.id, userId),
				columns: { role: true },
			})
		: null;
	const books = await db.query.books.findMany({
		orderBy: (model, { asc }) => [asc(model.title)],
		with: {
			author: true,
		},
	});

	return { userId, books, canManageOfficial: user?.role === "administrator" };
}
