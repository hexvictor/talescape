import "server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { authorAccessCondition, bookAccessCondition } from "./access";

export async function getTaleCreateOptions() {
	const { userId } = await auth();
	const user = userId
		? await db.query.users.findFirst({
				where: (model, { eq }) => eq(model.id, userId),
				columns: { role: true },
			})
		: null;
	const books = await db.query.books.findMany({
		where: bookAccessCondition(userId),
		orderBy: (model, { asc }) => [asc(model.title)],
		with: {
			author: true,
		},
	});

	const authors = await db.query.authors.findMany({
		where: authorAccessCondition(userId),
		orderBy: (model, { asc }) => [asc(model.fullName)],
	});
	return {
		userId,
		books,
		authors,
		canManageOfficial: user?.role === "administrator",
	};
}
