import { getPublishedBooks } from "~/server/db/queries/books";
import { Button } from "~/components/ui/Button";
import Link from "next/link";
import { BookGrid } from "../../../../features/books/components/BookGrid";

async function Library() {
	const books = await getPublishedBooks();
	return (
		<div>
			<Button asChild>
				<Link href="/library/book/add">Add Book</Link>
			</Button>
			<Button asChild>
				<Link href="/library/book/2/edit">Edit Book</Link>
			</Button>
			<BookGrid books={books} />
		</div>
	);
}

export default Library;
