import React from "react";
import { getPublishedBooks } from "~/server/db/queries/books";
import { BookGrid } from "../BookGrid";

export default async function BookLibrary() {
	const books = await getPublishedBooks();
	return (
		<div>
			<BookGrid books={books} />
		</div>
	);
}
