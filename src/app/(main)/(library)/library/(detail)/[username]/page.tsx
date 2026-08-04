import { notFound } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { getUserLibrary } from "~/server/db/data/library/queries";
import { LibraryBreadcrumbs } from "../../_shared/components/LibraryBreadcrumbs";
import { BooksGrid, TalesGrid } from "../../_shared/components/LibraryCards";

type UserLibraryPageProps = {
	params: Promise<{
		username: string;
	}>;
};

export default async function UserLibraryPage({
	params,
}: UserLibraryPageProps) {
	const { username } = await params;
	const library = await getUserLibrary(username);

	if (!library) {
		notFound();
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-5 py-2">
			<LibraryBreadcrumbs
				items={[
					{ label: "Library", href: "/library" },
					{ label: library.owner.username },
				]}
			/>
			<section className="rounded-md border bg-card p-5 shadow-sm sm:p-6">
				<p className="font-semibold text-primary text-sm uppercase tracking-normal">
					{library.isCurrentUser ? "Your library" : "Member library"}
				</p>
				<h1 className="mt-2 text-balance font-bold text-3xl">
					{library.owner.fullName}
				</h1>
				<div className="mt-4 flex flex-wrap gap-2">
					<Badge variant="secondary">{library.counts.tales} tales</Badge>
					<Badge variant="outline">{library.counts.books} books</Badge>
				</div>
			</section>
			<section className="grid gap-4">
				<div>
					<h2 className="font-semibold text-xl">Tales</h2>
					<div className="mt-3">
						<TalesGrid tales={library.tales} />
					</div>
				</div>
				<div>
					<h2 className="font-semibold text-xl">Books</h2>
					<div className="mt-3">
						<BooksGrid books={library.books} />
					</div>
				</div>
			</section>
		</div>
	);
}
