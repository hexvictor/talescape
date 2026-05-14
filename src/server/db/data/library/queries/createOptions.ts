import "server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export async function getTaleCreateOptions() {
	const { userId } = await auth();
	const books = await db.query.books.findMany({
		orderBy: (model, { asc }) => [asc(model.title)],
		with: {
			author: true,
		},
	});

	return { userId, books };
}
