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
import Image from "next/image";
import Link from "next/link";
import { siteImages } from "~/app/(site)/_shared/components/landingCodexData";
import { Badge } from "~/components/data-display/badge";
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
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{tales.map((tale, index) => {
				const readerHref = getTaleReaderHref(tale);
				const studioHref = getTaleStudioHref(tale);

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
						className="comic-panel flex min-h-72 flex-col overflow-hidden"
						decoration={index % 2 === 0 ? "dots" : "strikes"}
						shape={index % 2 === 0 ? "corner-top-right" : "corner-bottom-left"}
						slant="22px"
					>
						<div className="comic-panel-bleed relative aspect-[16/7] border-foreground border-b-2">
							<Image
								alt=""
								className="object-cover"
								fill
								sizes="(min-width: 1280px) 30vw, (min-width: 768px) 48vw, 100vw"
								src={
									[
										siteImages.moonlessHarbor,
										siteImages.lastStarbound,
										siteImages.crownOfAsh,
									][index % 3] ?? siteImages.emberCity
								}
							/>
						</div>
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
					shape="corner-top-right"
					slant="22px"
				>
					<div className="comic-panel-bleed flex aspect-[3/4] items-center justify-center bg-secondary p-4 text-secondary-foreground">
						<BookOpen aria-hidden="true" className="size-10" />
					</div>
					<div className="comic-panel-content pt-4">
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
					className="comic-panel-content"
					shape="corners-right"
					shadow={false}
					slant="18px"
				>
					<div className="flex size-12 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground">
						<Feather aria-hidden="true" className="size-5" />
					</div>
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
						<Button asChild size="sm" variant="ghost">
							<Link href={`/library/author/${author.id}/edit`}>Edit</Link>
						</Button>
					</div>
				</ComicPanel>
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
		<ComicPanel
			className="comic-panel-content-lg text-center"
			shape="cut-opposite"
		>
			<h2 className="font-display text-2xl uppercase">{title}</h2>
			<p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm leading-6">
				{description}
			</p>
		</ComicPanel>
	);
}

function NodeCountGrid({ tale }: { tale: TaleItem }) {
	const counts = [
		["Branches", tale.nodeCounts.branches],
		["Scenes", tale.nodeCounts.scenes],
		["Elements", tale.nodeCounts.elements],
		["Parts", tale.nodeCounts.parts],
		["Entries", tale.nodeCounts.entries],
		["Pages", tale.nodeCounts.pages],
		["Paths", tale.nodeCounts.paths],
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
