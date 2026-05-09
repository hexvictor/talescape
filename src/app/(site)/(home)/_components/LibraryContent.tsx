import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "~/components/ui/button";
import { getLibraryBooks } from "./data";
import {
	CardGridSkeleton,
	DetailPageSkeleton,
	LibraryHeaderSkeleton,
} from "./skeletons";

async function LibraryHeader() {
	return (
		<section className="flex flex-col justify-between gap-5 rounded-md border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-end">
			<div>
				<p className="font-semibold text-primary text-sm uppercase tracking-normal">
					Fake library
				</p>
				<h1 className="mt-2 text-balance font-bold text-3xl sm:text-4xl">
					Story shelves for active worlds
				</h1>
				<p className="mt-3 max-w-2xl text-muted-foreground leading-7">
					Books, tales, fragments, and linked codex material styled like the
					rest of the warm Talescape interface.
				</p>
			</div>
			<div className="flex flex-wrap gap-2">
				<Button asChild>
					<Link href="/library/book/add">Add Book</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/library/book/2/edit">Edit Book</Link>
				</Button>
			</div>
		</section>
	);
}

async function LibraryBookGrid() {
	const books = await getLibraryBooks();

	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{books.map((book) => (
				<article
					key={book.title}
					className="overflow-hidden rounded-md border bg-card shadow-sm"
				>
					<div className="relative aspect-[3/4]">
						<Image
							src={book.image}
							alt={`${book.title} cover`}
							fill
							className="object-cover"
						/>
					</div>
					<div className="p-4">
						<div className="flex items-center justify-between gap-3">
							<p className="font-medium text-primary text-xs uppercase tracking-normal">
								{book.status}
							</p>
							<span className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground text-xs">
								Book
							</span>
						</div>
						<h2 className="mt-3 font-semibold text-xl">{book.title}</h2>
						<p className="mt-1 text-muted-foreground text-sm">{book.author}</p>
						<p className="mt-3 line-clamp-3 text-muted-foreground text-sm leading-6">
							{book.description}
						</p>
					</div>
				</article>
			))}
		</section>
	);
}

async function LibraryCollections() {
	return (
		<section className="grid gap-4 lg:grid-cols-3">
			{["Tales", "Fragments", "Reading Lists"].map((section, index) => (
				<div key={section} className="rounded-md border bg-card p-5 shadow-sm">
					<p className="font-semibold text-primary text-sm uppercase tracking-normal">
						{section}
					</p>
					<h2 className="mt-2 font-semibold text-xl">
						{index === 0 && "Serial arcs and branching paths"}
						{index === 1 && "Loose scenes worth saving"}
						{index === 2 && "Curated journeys through lore"}
					</h2>
					<p className="mt-2 text-muted-foreground text-sm leading-6">
						{index === 0 &&
							"Keep long-form tales close to their world notes and reader progress."}
						{index === 1 &&
							"Collect myths, songs, scenes, letters, and strange discoveries."}
						{index === 2 &&
							"Bundle books and codex entries into guided reading shelves."}
					</p>
				</div>
			))}
		</section>
	);
}

export function LibraryContent() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-2">
			<Suspense fallback={<LibraryHeaderSkeleton />}>
				<LibraryHeader />
			</Suspense>
			<Suspense fallback={<CardGridSkeleton count={4} aspect="aspect-[3/4]" />}>
				<LibraryBookGrid />
			</Suspense>
			<Suspense fallback={<CardGridSkeleton count={3} />}>
				<LibraryCollections />
			</Suspense>
		</div>
	);
}

export function LibraryDetailPlaceholder({
	label,
	title,
	description,
}: {
	label: string;
	title: string;
	description: string;
}) {
	return (
		<Suspense fallback={<DetailPageSkeleton />}>
			<div className="mx-auto grid w-full max-w-5xl gap-5 py-2 md:grid-cols-[14rem_1fr]">
				<div className="aspect-[3/4] rounded-md border bg-secondary" />
				<div className="rounded-md border bg-card p-5 shadow-sm">
					<p className="font-semibold text-primary text-sm uppercase tracking-normal">
						{label}
					</p>
					<h1 className="mt-2 text-balance font-bold text-3xl">{title}</h1>
					<p className="mt-3 max-w-2xl text-muted-foreground leading-7">
						{description}
					</p>
				</div>
			</div>
		</Suspense>
	);
}
