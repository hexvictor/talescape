import { getLibraryBooks } from "~/server/db/data/library/queries";
import { LibraryBrowsePage } from "../../_shared/components/LibraryBrowsePage";
import { BooksGrid } from "../../_shared/components/LibraryCards";

export default async function LibraryBooksPage() {
	const books = await getLibraryBooks();

	return (
		<LibraryBrowsePage
			actionHref="/library/book/add"
			actionLabel="Add book"
			description="Canonical and user-created book records."
			title="Books"
		>
			<BooksGrid books={books} />
		</LibraryBrowsePage>
	);
}
