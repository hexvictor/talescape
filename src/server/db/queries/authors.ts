import "server-only";
import { db } from "../";
import { authors } from "../schema";

// Add filters in the future
export async function getAuthors() {
	const authors = await db.query.authors.findMany({
		orderBy: (model, { desc }) => desc(model.id),
	});
	return authors;
}

// Add filters in the future
export async function getAuthorById(id: number) {
	const author = await db.query.authors.findFirst({
		where: (model, { eq }) => eq(model.id, id),
	});
	return author;
}

type addAuthorProps = {
	firstName: string;
	lastName: string;
	name: string;
	biography: string;
	image: string;
};

export async function addAuthor({
	firstName,
	lastName,
	name,
	biography,
	image,
}: addAuthorProps): Promise<void> {
	await db.insert(authors).values({
		firstName,
		lastName,
		name,
		biography,
		image,
	});
}
