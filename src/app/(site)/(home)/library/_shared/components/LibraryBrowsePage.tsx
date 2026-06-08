import { Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";

type LibraryBrowsePageProps = {
	actionHref: string;
	actionLabel: string;
	children: ReactNode;
	description: string;
	title: string;
};

/**
 * Renders the shared heading and action used by library browse pages.
 *
 * @param props - Browse page content and action.
 * @returns Library browse layout.
 *
 * @example
 * <LibraryBrowsePage title="Books" actionHref="/library/book/add" actionLabel="Add book" description="Books">
 *   <BooksGrid books={books} />
 * </LibraryBrowsePage>
 */
export function LibraryBrowsePage({
	actionHref,
	actionLabel,
	children,
	description,
	title,
}: LibraryBrowsePageProps) {
	return (
		<div className="grid gap-4">
			<header className="flex flex-col gap-3 rounded-md border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-semibold text-lg">{title}</h2>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
				<Button asChild size="sm">
					<Link href={actionHref}>
						<Plus aria-hidden="true" />
						{actionLabel}
					</Link>
				</Button>
			</header>
			{children}
		</div>
	);
}
