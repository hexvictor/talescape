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
import { Badge, StatusBadge, Tag } from "~/components/data-display/badge";
import { EmptyState } from "~/components/data-display/empty-state";
import { Thumbnail } from "~/components/data-display/thumbnail";
import { ComicPanel } from "~/components/layout/comic-panel";
import { Button } from "~/components/ui/button";
import type {
	LibraryAuthorList,
	LibraryBookList,
	LibraryTaleList,
} from "~/server/db/data/library/queries";
import { getTaleReaderHref, getTaleStudioHref } from "./taleHref";

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
		<section
			data-reader-component="TalesGrid"
			data-reader-role="tale-results"
			className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
		>
			{tales.map((tale, index) => {
				const readerHref = getTaleReaderHref(tale);
				const studioHref = tale.canEdit ? getTaleStudioHref(tale) : null;

				return (
					<ComicPanel
						accent={
							index % 3 === 0
								? "primary"
								: index % 3 === 1
									? "secondary"
									: "accent"
						}
						as="article"
						key={tale.id}
						className="flex min-h-72 flex-col overflow-hidden"
						decorations="subtle"
						shapes="cut-opposite"
						slant="22px"
					>
						<div className="comic-panel-content flex flex-1 flex-col pt-4">
							<div className="flex items-start justify-between gap-3">
								<div className="flex size-11 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground">
									<FileText aria-hidden="true" className="size-5" />
								</div>
								<AccessBadge
									label={tale.accessLabel}
									visibility={tale.visibility}
								/>
							</div>
							<h2 className="mt-4 text-balance font-display text-2xl uppercase">
								{tale.title}
							</h2>
							<p className="mt-2 line-clamp-3 text-muted-foreground text-sm leading-6">
								{tale.description}
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								<Tag>{tale.type}</Tag>
								<StatusBadge status={tale.status} />
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
									<Link href={`/library/tale/${tale.id}`}>Details</Link>
								</Button>
								{studioHref ? (
									<Button
										asChild
										size="sm"
										variant="outline"
										className="w-full"
									>
										<Link href={studioHref}>Edit tale</Link>
									</Button>
								) : null}
							</div>
						</div>
					</ComicPanel>
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
			{books.map((book, index) => (
				<ComicPanel
					accent={index % 2 === 0 ? "accent" : "secondary"}
					as="article"
					key={book.id}
					className="flex flex-col overflow-hidden"
					shapes="corner-top-right"
					slant="22px"
				>
					<Thumbnail
						src={book.coverImage?.url}
						alt={`${book.title} cover`}
						className="aspect-[3/4] w-full"
						fallback={<BookOpen aria-hidden="true" className="size-10" />}
					/>
					<div className="comic-panel-content pt-4">
						<div className="flex flex-wrap gap-2">
							<StatusBadge status={book.status} />
							<Tag>{book.type}</Tag>
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
						<h2 className="mt-3 font-display text-2xl uppercase">
							{book.title}
						</h2>
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
							{book.canEdit && (
								<Button asChild size="sm" variant="ghost">
									<Link href={`/library/book/${book.id}/edit`}>Edit</Link>
								</Button>
							)}
							{book.author ? (
								<Button asChild size="sm" variant="ghost">
									<Link href={`/library/author/${book.author.id}`}>Author</Link>
								</Button>
							) : null}
						</div>
					</div>
				</ComicPanel>
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
			{authors.map((author, index) => (
				<ComicPanel
					accent={index % 2 === 0 ? "secondary" : "primary"}
					as="article"
					key={author.id}
					surfaceClassName="comic-panel-content"
					shapes="corners-right"
					shadow={false}
					slant="18px"
				>
					<Thumbnail
						src={author.image?.url}
						alt={author.fullName ?? "Author"}
						className="size-12"
						fallback={<Feather aria-hidden="true" className="size-5" />}
					/>
					<h2 className="mt-4 font-display text-2xl uppercase">
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
						{author.canEdit && (
							<Button asChild size="sm" variant="ghost">
								<Link href={`/library/author/${author.id}/edit`}>Edit</Link>
							</Button>
						)}
					</div>
				</ComicPanel>
			))}
		</section>
	);
}

function NodeCountGrid({ tale }: { tale: TaleItem }) {
	const counts = [
		["Scenes", tale.nodeCounts.scenes],
		["Elements", tale.nodeCounts.elements],
	];

	return (
		<div className="mt-5 grid grid-cols-2 border-foreground border-t-2 text-sm">
			{counts.map(([label, value]) => (
				<div
					key={label}
					className="border-foreground border-b border-l px-3 py-2 even:border-r"
				>
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
