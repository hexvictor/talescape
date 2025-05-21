import React from "react";
import type { BookWithAuthor } from "~/server/db/schema";
import BookCard from "../BookCard";

const BookGrid = ({ books }: { books: BookWithAuthor[] }) => {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{books.map((book) => (
				<BookCard key={book.id} {...book} />
			))}
		</div>
	);
};

export default BookGrid;
