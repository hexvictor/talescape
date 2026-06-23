import "server-only";

import { db } from "~/server/db";
import { getSignedInLibraryUser } from "./access";
import { getLibraryBooks, getLibraryTales } from "./lists";

export async function getUserLibrary(username: string) {
	const [{ userId }, owner] = await Promise.all([
		getSignedInLibraryUser(),
		db.query.users.findFirst({
			where: (model, { eq }) => eq(model.username, username),
			columns: {
				id: true,
				username: true,
				fullName: true,
				firstName: true,
				lastName: true,
				imageUrl: true,
			},
		}),
	]);

	if (!owner) {
		return null;
	}

	const [tales, books] = await Promise.all([
		getLibraryTales({ creatorId: owner.id }),
		getLibraryBooks({ creatorId: owner.id }),
	]);

	return {
		owner,
		isCurrentUser: userId === owner.id,
		tales,
		books,
		counts: {
			tales: tales.length,
			books: books.length,
		},
	};
}
