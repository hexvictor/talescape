import { getLibraryAuthors } from "~/server/db/data/library/queries";
import { LibraryBrowsePage } from "../../_shared/components/LibraryBrowsePage";
import { AuthorsGrid } from "../../_shared/components/LibraryCards";

export default async function LibraryAuthorsPage() {
	const authors = await getLibraryAuthors();

	return (
		<LibraryBrowsePage
			actionHref="/library/author/add"
			actionLabel="Add author"
			description="Canonical and user-created author records."
			title="Authors"
		>
			<AuthorsGrid authors={authors} />
		</LibraryBrowsePage>
	);
}
