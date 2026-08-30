import {
	Bookmark,
	ChevronRight,
	Clock3,
	Compass,
	Eye,
	Flame,
	Globe2,
	Orbit,
	Play,
	Rocket,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
	getFeaturedTales,
	siteImages,
} from "~/app/(site)/_shared/components/landingCodexData";
import { CardGridSkeleton } from "~/app/(site)/_shared/components/skeletons";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { Button } from "~/components/ui/button";
import { TaleCard } from "./TaleCard";

const progressValues = [68, 31, 12] as const;

const worlds = [
	{
		accent: "var(--talescape-cyan)",
		copy: "Worlds of magic and myth.",
		icon: Sparkles,
		name: "Fantasy",
	},
	{
		accent: "var(--talescape-magenta)",
		copy: "Quests, relics, and untold paths.",
		icon: Compass,
		name: "Adventure",
	},
	{
		accent: "var(--talescape-yellow)",
		copy: "Futures, frontiers, and beyond.",
		icon: Rocket,
		name: "Sci-fi",
	},
	{
		accent: "var(--foreground)",
		copy: "Secrets, shadows, and hidden truths.",
		icon: Orbit,
		name: "Mystery",
	},
] as const;

function LandingHero({ signedIn = false }: { signedIn?: boolean }) {
	return (
		<section className="site-landing-hero relative min-h-[min(40rem,calc(100svh-9rem))] overflow-hidden border-foreground border-b-2 bg-background sm:min-h-[min(46rem,calc(100svh-5rem))]">
			<Image
				src={siteImages.emberCity}
				alt="A vast illustrated fantasy world featured on Talescape"
				fill
				priority
				className="object-cover object-[62%_center]"
				sizes="100vw"
			/>
			<div className="site-hero-scrim absolute inset-0" />
			<div className="comic-hero-strikes absolute top-0 right-0 h-52 w-64 bg-primary" />
			<div className="comic-hero-bubbles absolute right-0 bottom-0 h-52 w-64 bg-accent" />
			<div className="relative z-10 mx-auto flex min-h-[min(40rem,calc(100svh-9rem))] w-full max-w-[90rem] items-center px-5 py-10 sm:min-h-[min(46rem,calc(100svh-5rem))] sm:px-8 sm:py-12 lg:px-12">
				<div className="max-w-2xl">
					<ComicRail accent="secondary">
						<Flame size={15} /> Interactive stories, unbound
					</ComicRail>
					<h1 className="mt-6 text-balance font-display text-5xl uppercase leading-[0.88] sm:text-7xl lg:text-[5.75rem]">
						Escape into your next story.
					</h1>
					<p className="mt-5 max-w-lg text-base leading-7 sm:text-lg">
						Discover impossible worlds. Make meaningful choices. Shape the tales
						that remember you.
					</p>
					<div className="mt-7 flex flex-wrap gap-4">
						<Button
							asChild
							comicDecorations={[
								{
									color: "foreground",
									element: "strikes",
									position: "top-right",
								},
							]}
							shape="slant-both"
							size="lg"
							variant="secondary"
						>
							<Link href="/library">
								{signedIn ? "Open library" : "Explore tales"} <ChevronRight />
							</Link>
						</Button>
						<Button asChild shape="corners-right" size="lg" variant="outline">
							<Link href="/library/tale/add">
								Start creating <ChevronRight />
							</Link>
						</Button>
					</div>
				</div>
			</div>
			<div className="absolute right-5 bottom-5 z-10 hidden sm:block lg:right-12 lg:bottom-8">
				<ComicPanel
					accent="secondary"
					className="min-w-72"
					decoration="strikes"
					shape="slant-both"
				>
					<Link
						href="/official/branched"
						className="comic-panel-content flex items-center gap-4 bg-[var(--comic-ink)] text-[var(--comic-cream)]"
					>
						<div>
							<span className="font-black text-[10px] text-secondary uppercase">
								Featured tale
							</span>
							<strong className="mt-1 block font-display text-2xl uppercase">
								The Ember Archive
							</strong>
						</div>
						<ChevronRight className="ml-auto text-secondary" />
					</Link>
				</ComicPanel>
			</div>
		</section>
	);
}

async function TrendingTales() {
	const tales = await getFeaturedTales();
	return (
		<section className="mx-auto w-full max-w-[90rem] px-5 py-12 sm:px-8 lg:px-12">
			<div className="mb-6 flex items-center justify-between gap-4">
				<ComicRail accent="secondary">
					<TrendingUp size={16} /> Trending tales
				</ComicRail>
				<Link
					href="/library"
					className="inline-flex min-h-11 items-center gap-1 font-black text-secondary text-xs uppercase hover:underline"
				>
					View all <ChevronRight size={17} />
				</Link>
			</div>
			<div className="grid gap-6 lg:grid-cols-3">
				{tales.map((tale, index) => (
					<TaleCard
						key={tale.title}
						description={tale.description}
						image={tale.image}
						index={index}
						meta={tale.meta}
						progress={progressValues[index] ?? 0}
						title={tale.title}
					/>
				))}
			</div>
		</section>
	);
}

function DiscoveryBands() {
	return (
		<section className="mx-auto grid w-full max-w-[90rem] gap-10 px-5 pb-14 sm:px-8 lg:grid-cols-[1.35fr_0.9fr] lg:px-12">
			<div>
				<ComicRail accent="primary">
					<Globe2 size={16} /> Explore worlds
				</ComicRail>
				<div className="mt-4 grid sm:grid-cols-2">
					{worlds.map(({ accent, copy, icon: Icon, name }) => (
						<Link
							key={name}
							href="/library"
							className="group flex min-h-28 items-center gap-4 border-2 border-foreground bg-card p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<Icon className="size-10 shrink-0" style={{ color: accent }} />
							<div>
								<strong className="font-display text-xl uppercase">
									{name}
								</strong>
								<p className="mt-1 text-muted-foreground text-xs leading-5 group-hover:text-current/70">
									{copy}
								</p>
							</div>
							<ChevronRight className="ml-auto shrink-0" />
						</Link>
					))}
				</div>
			</div>

			<div>
				<ComicRail accent="accent">
					<Clock3 size={16} /> Continue reading
				</ComicRail>
				<ComicPanel
					accent="secondary"
					className="mt-4"
					decoration="dots"
					shape="corner-bottom-right"
				>
					<div className="comic-panel-content-lg">
						<div className="relative mb-4 aspect-[16/7] overflow-hidden border-2 border-foreground">
							<Image
								alt="The Ember Archive"
								className="object-cover"
								fill
								sizes="(min-width: 1024px) 34vw, 100vw"
								src={siteImages.emberCity}
							/>
						</div>
						<div className="flex items-start gap-3">
							<div className="min-w-0 flex-1">
								<strong className="font-display text-2xl uppercase">
									The Ember Archive
								</strong>
								<p className="text-muted-foreground text-sm">
									Chapter 7: Echoes of the Past
								</p>
							</div>
							<Bookmark className="shrink-0 text-secondary" />
						</div>
						<div className="mt-5 flex items-center gap-3">
							<div className="h-2 flex-1 border border-foreground bg-muted">
								<div className="h-full w-[68%] bg-secondary" />
							</div>
							<span className="font-black text-xs">68%</span>
						</div>
						<div className="mt-4 flex items-center gap-4 text-muted-foreground text-xs">
							<span className="inline-flex items-center gap-1">
								<Eye size={15} /> 12.4K
							</span>
							<span className="inline-flex items-center gap-1">
								<Clock3 size={15} /> 6h
							</span>
							<Button asChild className="ml-auto" size="sm" variant="comic">
								<Link href="/official/branched">
									<Play fill="currentColor" /> Read
								</Link>
							</Button>
						</div>
					</div>
				</ComicPanel>
			</div>
		</section>
	);
}

function HomeExperience({ signedIn = false }: { signedIn?: boolean }) {
	return (
		<div className="overflow-hidden">
			<LandingHero signedIn={signedIn} />
			<Suspense fallback={<CardGridSkeleton count={3} />}>
				<TrendingTales />
			</Suspense>
			<DiscoveryBands />
		</div>
	);
}

export function LandingPageContent() {
	return <HomeExperience />;
}

export function SignedInHomeContent() {
	return <HomeExperience signedIn />;
}
