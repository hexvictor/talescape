import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getLibraryBooks } from "~/server/db/data/library/queries";
import { BooksGrid } from "../../_shared/components/LibraryCards";

export default async function LibraryBooksPage() {
	const books = await getLibraryBooks();

	return (
		<div className="grid gap-4">
			<div className="flex flex-col gap-3 rounded-md border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-semibold text-lg">Books</h2>
					<p className="text-muted-foreground text-sm">
						Canonical and user-created book records.
					</p>
				</div>
				<Button asChild size="sm">
					<Link href="/library/book/add">
						<Plus aria-hidden="true" />
						Add book
					</Link>
				</Button>
			</div>
			<BooksGrid books={books} />
		</div>
	);
}
