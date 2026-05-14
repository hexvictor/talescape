import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getLibraryAuthors } from "~/server/db/data/library/queries";
import { AuthorsGrid } from "../../_shared/components/LibraryCards";

export default async function LibraryAuthorsPage() {
	const authors = await getLibraryAuthors();

	return (
		<div className="grid gap-4">
			<div className="flex flex-col gap-3 rounded-md border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-semibold text-lg">Authors</h2>
					<p className="text-muted-foreground text-sm">
						Canonical and user-created author records.
					</p>
				</div>
				<Button asChild size="sm">
					<Link href="/library/author/add">
						<Plus aria-hidden="true" />
						Add author
					</Link>
				</Button>
			</div>
			<AuthorsGrid authors={authors} />
		</div>
	);
}
