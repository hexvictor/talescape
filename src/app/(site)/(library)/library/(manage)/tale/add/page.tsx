import Link from "next/link";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";
import { Panel, PanelContent, PanelHeading } from "~/components/ui/panel";
import { getTaleCreateOptions } from "~/server/db/data/library/queries";
import { TaleCreationForm } from "../../../_shared/forms/tale/TaleCreationForm";
import { createTaleAction } from "./actions";

export default async function AddTalePage({
	searchParams,
}: { searchParams?: Promise<{ error?: string }> }) {
	const [options, params] = await Promise.all([
		getTaleCreateOptions(),
		searchParams,
	]);
	return (
		<PageShell
			data-reader-component="AddTalePage"
			data-reader-role="creation-page"
			className="mx-auto max-w-3xl py-6"
		>
			<Panel shapes="cut-opposite" decorations="subtle">
				<PanelHeading
					title="Create a tale"
					description="Give your story a title and a place in your library."
				/>
				<PanelContent>
					{options.userId ? (
						<TaleCreationForm
							action={createTaleAction}
							books={options.books.map((book) => ({
								id: String(book.id),
								label: book.title,
							}))}
							authors={options.authors.map((author) => ({
								id: String(author.id),
								label: author.fullName ?? "Unnamed author",
							}))}
							error={params?.error}
						/>
					) : (
						<Button asChild>
							<Link href="/sign-in">Sign in to create a tale</Link>
						</Button>
					)}
				</PanelContent>
			</Panel>
		</PageShell>
	);
}
