import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "~/components/ui/button";
import { getCodexEntries, getCodexLinks, getImage } from "./data";
import { CardGridSkeleton, PanelSkeleton } from "./skeletons";

async function CodexHero() {
	return (
		<section className="grid gap-5 lg:grid-cols-[1fr_24rem]">
			<div className="rounded-md border bg-card p-5 shadow-sm sm:p-6">
				<p className="font-semibold text-primary text-sm uppercase tracking-normal">
					World bible
				</p>
				<h1 className="mt-2 text-balance font-bold text-3xl sm:text-4xl">
					Codex of the Ember Archive
				</h1>
				<p className="mt-3 max-w-3xl text-muted-foreground leading-7">
					A fake but fully shaped fantasy reference hub for characters, places,
					factions, art, forums, links, timelines, and odd little trivia that
					makes a book world feel inhabited.
				</p>
				<div className="mt-5 flex flex-wrap gap-2">
					{["Characters", "Factions", "Art", "Forums", "Links", "Trivia"].map(
						(item) => (
							<span
								key={item}
								className="rounded-md border bg-background px-3 py-1.5 font-medium text-sm"
							>
								{item}
							</span>
						),
					)}
				</div>
			</div>
			<div className="relative min-h-64 overflow-hidden rounded-md border bg-card shadow-sm">
				<Image
					src={getImage(6)}
					alt="Codex feature artwork"
					fill
					className="object-cover"
				/>
			</div>
		</section>
	);
}

async function CodexEntryGrid() {
	const codexEntries = await getCodexEntries();

	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{codexEntries.map((entry) => (
				<article
					key={entry.title}
					className="overflow-hidden rounded-md border bg-card shadow-sm"
				>
					<div className="relative aspect-[4/3]">
						<Image
							src={entry.image}
							alt={entry.title}
							fill
							className="object-cover"
						/>
					</div>
					<div className="p-4">
						<p className="font-semibold text-primary text-xs uppercase tracking-normal">
							{entry.type}
						</p>
						<h2 className="mt-2 font-semibold text-lg">{entry.title}</h2>
						<p className="mt-2 text-muted-foreground text-sm leading-6">
							{entry.copy}
						</p>
					</div>
				</article>
			))}
		</section>
	);
}

async function CodexFooterPanels() {
	const links = await getCodexLinks();

	return (
		<section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
			<div className="rounded-md border bg-secondary p-5 text-secondary-foreground">
				<h2 className="font-semibold text-xl">Faction Watch</h2>
				<div className="mt-4 grid gap-3 sm:grid-cols-2">
					{["Lantern Monks", "Glass Cartel", "Ashwardens", "Ochre Choir"].map(
						(faction) => (
							<div key={faction} className="rounded-md bg-background/70 p-3">
								<p className="font-semibold">{faction}</p>
								<p className="mt-1 text-muted-foreground text-sm">
									Influence rising across the latest chapter notes.
								</p>
							</div>
						),
					)}
				</div>
			</div>

			<div className="rounded-md border bg-card p-5 shadow-sm">
				<h2 className="font-semibold text-xl">Forums and external links</h2>
				<div className="mt-4 divide-y">
					{links.map((link) => (
						<Link
							key={link}
							href="#"
							className="flex items-center justify-between gap-4 py-3 text-sm hover:text-primary"
						>
							<span>{link}</span>
							<span aria-hidden="true">Open</span>
						</Link>
					))}
				</div>
				<Button asChild className="mt-5">
					<Link href="/library">Browse connected books</Link>
				</Button>
			</div>
		</section>
	);
}

export function CodexContent() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-2">
			<Suspense fallback={<PanelSkeleton />}>
				<CodexHero />
			</Suspense>
			<Suspense fallback={<CardGridSkeleton count={4} />}>
				<CodexEntryGrid />
			</Suspense>
			<Suspense fallback={<PanelSkeleton />}>
				<CodexFooterPanels />
			</Suspense>
		</div>
	);
}
