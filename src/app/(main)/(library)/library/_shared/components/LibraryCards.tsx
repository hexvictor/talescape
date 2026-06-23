"use client";

import {
	ArrowUpRight,
	BookOpen,
	Feather,
	FileText,
	Globe2,
	Lock,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type {
	LibraryAuthorList,
	LibraryBookList,
	LibraryTaleList,
} from "~/server/db/data/library/queries";
import { getTaleEditorHref, getTaleReaderHref } from "./taleReaderHref";

type TaleItem = LibraryTaleList[number];

export function TalesGrid({ tales }: { tales: LibraryTaleList }) {
	if (!tales.length) {
		return (
			<EmptyState
				title="No tales yet"
				description="Public, official, owned, and shared tales will appear here."
			/>
		);
	}

	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{tales.map((tale) => {
				const readerHref = getTaleReaderHref(tale);
				const editorHref = getTaleEditorHref(tale);

				return (
					<article
						key={tale.id}
						className="flex min-h-72 flex-col rounded-md border bg-card p-5 shadow-sm"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="flex size-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
								<FileText aria-hidden="true" className="size-5" />
							</div>
							<AccessBadge
								label={tale.accessLabel}
								visibility={tale.visibility}
							/>
						</div>
						<h2 className="mt-4 text-balance font-semibold text-xl">
							{tale.title}
						</h2>
						<p className="mt-2 line-clamp-3 text-muted-foreground text-sm leading-6">
							{tale.description}
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<Badge variant="secondary">{tale.type}</Badge>
							<Badge variant="outline">{tale.status}</Badge>
							{tale.isVerified ? (
								<Badge variant="outline">
									<ShieldCheck aria-hidden="true" />
									Verified
								</Badge>
							) : null}
							{tale.book ? (
								<Badge asChild variant="outline">
									<Link href={`/library/book/${tale.book.id}`}>
										{tale.book.title}
									</Link>
								</Badge>
							) : null}
						</div>
						<NodeCountGrid tale={tale} />
						<div className="mt-auto grid gap-2 pt-5">
							{readerHref ? (
								<Button asChild size="lg" className="w-full">
									<Link href={readerHref}>
										<ArrowUpRight aria-hidden="true" />
										View tale
									</Link>
								</Button>
							) : null}
							<Button asChild size="sm" variant="ghost" className="w-full">
								<Link href={`/library/tale/${tale.id}`}>Open structure</Link>
							</Button>
							{editorHref ? (
								<Button asChild size="sm" variant="outline" className="w-full">
									<Link href={editorHref}>Edit tale</Link>
								</Button>
							) : null}
						</div>
					</article>
				);
			})}
		</section>
	);
}

export function BooksGrid({ books }: { books: LibraryBookList }) {
	if (!books.length) {
		return (
			<EmptyState
				title="No books found"
				description="Books will appear after they are seeded or created."
			/>
		);
	}

	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{books.map((book) => (
				<article
					key={book.id}
					className="overflow-hidden rounded-md border bg-card shadow-sm"
				>
					<div className="flex aspect-[3/4] items-center justify-center bg-secondary p-4 text-secondary-foreground">
						<BookOpen aria-hidden="true" className="size-10" />
					</div>
					<div className="p-4">
						<div className="flex flex-wrap gap-2">
							<Badge variant="secondary">{book.status}</Badge>
							<Badge variant="outline">{book.type}</Badge>
							<Badge variant={book.isOfficial ? "default" : "outline"}>
								{book.isOfficial ? "Official" : book.visibility}
							</Badge>
							{book.isVerified ? (
								<Badge variant="outline">
									<ShieldCheck aria-hidden="true" />
									Verified
								</Badge>
							) : null}
						</div>
						<h2 className="mt-3 font-semibold text-xl">{book.title}</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							{book.author?.fullName ?? "Unknown author"}
						</p>
						<p className="mt-3 line-clamp-3 text-muted-foreground text-sm leading-6">
							{book.description ?? "No description yet."}
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<Button asChild size="sm" variant="outline">
								<Link href={`/library/book/${book.id}`}>Book</Link>
							</Button>
							<Button asChild size="sm" variant="ghost">
								<Link href={`/library/book/${book.id}/edit`}>Edit</Link>
							</Button>
							{book.author ? (
								<Button asChild size="sm" variant="ghost">
									<Link href={`/library/author/${book.author.id}`}>Author</Link>
								</Button>
							) : null}
						</div>
					</div>
				</article>
			))}
		</section>
	);
}

export function AuthorsGrid({ authors }: { authors: LibraryAuthorList }) {
	if (!authors.length) {
		return (
			<EmptyState
				title="No authors found"
				description="Authors will appear after they are seeded or created."
			/>
		);
	}

	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{authors.map((author) => (
				<article
					key={author.id}
					className="rounded-md border bg-card p-5 shadow-sm"
				>
					<div className="flex size-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
						<Feather aria-hidden="true" className="size-5" />
					</div>
					<h2 className="mt-4 font-semibold text-xl">
						{author.fullName ?? "Unnamed author"}
					</h2>
					<div className="mt-3 flex flex-wrap gap-2">
						<Badge variant={author.isOfficial ? "default" : "outline"}>
							{author.isOfficial ? "Official" : author.visibility}
						</Badge>
						{author.isVerified ? (
							<Badge variant="outline">
								<ShieldCheck aria-hidden="true" />
								Verified
							</Badge>
						) : null}
					</div>
					<p className="mt-3 line-clamp-4 text-muted-foreground text-sm leading-6">
						{author.biography ?? "No biography yet."}
					</p>
					<div className="mt-4 flex flex-wrap gap-2">
						<Button asChild size="sm" variant="outline">
							<Link href={`/library/author/${author.id}`}>Author</Link>
						</Button>
						<Button asChild size="sm" variant="ghost">
							<Link href={`/library/author/${author.id}/edit`}>Edit</Link>
						</Button>
					</div>
				</article>
			))}
		</section>
	);
}

export function EmptyState({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<section className="rounded-md border bg-card p-8 text-center shadow-sm">
			<h2 className="font-semibold text-xl">{title}</h2>
			<p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm leading-6">
				{description}
			</p>
		</section>
	);
}

function NodeCountGrid({ tale }: { tale: TaleItem }) {
	const counts = [
		["Branches", tale.nodeCounts.branches],
		["Blocks", tale.nodeCounts.blocks],
		["Fragments", tale.nodeCounts.fragments],
		["Parts", tale.nodeCounts.parts],
		["Entries", tale.nodeCounts.entries],
		["Pages", tale.nodeCounts.pages],
		["Paths", tale.nodeCounts.paths],
	];

	return (
		<div className="mt-5 grid grid-cols-2 gap-2 text-sm">
			{counts.map(([label, value]) => (
				<div key={label} className="rounded-md bg-muted px-3 py-2">
					<p className="text-muted-foreground text-xs">{label}</p>
					<p className="font-semibold">{value}</p>
				</div>
			))}
		</div>
	);
}

function AccessBadge({
	label,
	visibility,
}: {
	label: string;
	visibility: string;
}) {
	const Icon =
		label === "Official"
			? ShieldCheck
			: visibility === "public"
				? Globe2
				: Lock;

	return (
		<Badge variant={label === "Official" ? "default" : "secondary"}>
			<Icon aria-hidden="true" />
			{label}
		</Badge>
	);
}
