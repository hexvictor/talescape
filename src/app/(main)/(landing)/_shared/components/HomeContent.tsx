import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
	CardGridSkeleton,
	HeroSkeleton,
	PanelSkeleton,
} from "~/app/(main)/_shared/components/skeletons";
import {
	getFeaturedTales,
	getImage,
	getRecentCodexEntries,
} from "~/app/(main)/_shared/components/landingCodexData";
import { Button } from "~/components/ui/button";

async function LandingHero() {
	return (
		<section className="grid min-h-[calc(100dvh-9rem)] items-center gap-8 py-6 md:grid-cols-[1.05fr_0.95fr]">
			<div className="max-w-2xl">
				<p className="mb-3 font-semibold text-primary text-sm uppercase tracking-normal">
					Interactive fantasy libraries
				</p>
				<h1 className="text-balance font-bold text-4xl leading-tight sm:text-5xl lg:text-6xl">
					Talescape
				</h1>
				<p className="mt-4 max-w-xl text-lg text-muted-foreground leading-8">
					Build beautiful book worlds with readable lore, character dossiers,
					art references, timelines, forums, and external links that feel like
					part of the same enchanted shelf.
				</p>
				<div className="mt-7 flex flex-wrap gap-3">
					<Button asChild size="lg">
						<Link href="/sign-up">Start your archive</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link href="/codex">Browse the codex</Link>
					</Button>
				</div>
			</div>

			<div className="relative min-h-[420px] overflow-hidden rounded-md border bg-card shadow-sm">
				<Image
					src={getImage(20)}
					alt="Fantasy codex artwork"
					fill
					priority
					className="object-cover"
				/>
				<div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background via-background/80 to-transparent p-5">
					<p className="font-semibold text-sm">Featured codex</p>
					<h2 className="mt-1 font-bold text-2xl">The Knights of Emberfall</h2>
					<p className="mt-2 max-w-md text-muted-foreground text-sm">
						Characters, factions, symbols, forum theories, and field notes woven
						into one browsable world bible.
					</p>
				</div>
			</div>
		</section>
	);
}

async function FeaturedTalesGrid({ compact = false }: { compact?: boolean }) {
	const featuredTales = await getFeaturedTales();

	return (
		<section className="grid gap-4 md:grid-cols-3">
			{featuredTales.map((tale) => (
				<article
					key={tale.title}
					className="overflow-hidden rounded-md border bg-card shadow-sm"
				>
					<div
						className={`relative ${compact ? "aspect-[3/2]" : "aspect-[4/3]"}`}
					>
						<Image
							src={tale.image}
							alt={tale.title}
							fill
							className="object-cover"
						/>
					</div>
					<div className="p-4">
						<p className="font-medium text-primary text-xs uppercase tracking-normal">
							{tale.meta}
						</p>
						{compact ? (
							<h3 className="mt-2 font-semibold">{tale.title}</h3>
						) : (
							<>
								<h2 className="mt-2 font-semibold text-xl">{tale.title}</h2>
								<p className="mt-2 text-muted-foreground text-sm leading-6">
									{tale.description}
								</p>
							</>
						)}
					</div>
				</article>
			))}
		</section>
	);
}

async function SignedInSummary() {
	return (
		<section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
			<div className="rounded-md border bg-card p-5 shadow-sm sm:p-6">
				<p className="font-semibold text-primary text-sm uppercase tracking-normal">
					Your reading desk
				</p>
				<h1 className="mt-2 text-balance font-bold text-3xl sm:text-4xl">
					Pick up the worlds you were shaping.
				</h1>
				<p className="mt-3 max-w-2xl text-muted-foreground leading-7">
					Recent books, codex notes, factions, and discussion sparks are
					gathered here so the next session starts with momentum.
				</p>
			</div>
			<div className="rounded-md border bg-secondary p-5 text-secondary-foreground">
				<p className="font-semibold text-sm">Codex pulse</p>
				<p className="mt-3 font-bold text-4xl">67</p>
				<p className="mt-1 text-sm">
					new entries, theories, and art pins this week
				</p>
			</div>
		</section>
	);
}

async function RecentCodexEntries() {
	const recentEntries = await getRecentCodexEntries();

	return (
		<aside className="rounded-md border bg-card p-5 shadow-sm">
			<h2 className="font-semibold text-xl">Recent codex entries</h2>
			<div className="mt-4 divide-y">
				{recentEntries.map((entry) => (
					<Link
						key={entry}
						href="/codex"
						className="block py-3 text-sm transition-colors hover:text-primary"
					>
						{entry}
					</Link>
				))}
			</div>
		</aside>
	);
}

export function LandingPageContent() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
			<Suspense fallback={<HeroSkeleton />}>
				<LandingHero />
			</Suspense>
			<Suspense fallback={<CardGridSkeleton count={3} />}>
				<FeaturedTalesGrid />
			</Suspense>
		</div>
	);
}

export function SignedInHomeContent() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-2">
			<Suspense fallback={<PanelSkeleton />}>
				<SignedInSummary />
			</Suspense>

			<section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
				<div>
					<div className="mb-3 flex items-center justify-between gap-3">
						<h2 className="font-semibold text-2xl">Continue exploring</h2>
						<Button asChild variant="outline">
							<Link href="/library">Open library</Link>
						</Button>
					</div>
					<Suspense
						fallback={<CardGridSkeleton count={3} aspect="aspect-[3/2]" />}
					>
						<FeaturedTalesGrid compact />
					</Suspense>
				</div>

				<Suspense fallback={<PanelSkeleton />}>
					<RecentCodexEntries />
				</Suspense>
			</section>
		</div>
	);
}
