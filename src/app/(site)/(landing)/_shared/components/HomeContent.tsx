import {
	Bookmark,
	ChevronRight,
	Clock3,
	Compass,
	Eye,
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
import { ProgressBar } from "~/components/data-display/progress-bar";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { PageShell } from "~/components/layout/page-shell";
import { TaleImage } from "~/components/media/tale-image";
import { Button } from "~/components/ui/button";
import { TaleCard } from "./TaleCard";

const worlds = [
	{
		accent: "var(--talescape-cyan)",
		copy: "Worlds of magic and myth.",
		icon: Sparkles,
		image: siteImages.emberCity,
		name: "Fantasy",
	},
	{
		accent: "var(--talescape-magenta)",
		copy: "Quests, relics, and untold paths.",
		icon: Compass,
		image: siteImages.crownOfAsh,
		name: "Adventure",
	},
	{
		accent: "var(--talescape-yellow)",
		copy: "Futures, frontiers, and beyond.",
		icon: Rocket,
		image: siteImages.lastStarbound,
		name: "Sci-fi",
	},
	{
		accent: "var(--talescape-green)",
		copy: "Secrets, shadows, and hidden truths.",
		icon: Orbit,
		image: siteImages.moonlessHarbor,
		name: "Mystery",
	},
] as const;

function LandingHero({ signedIn = false }: { signedIn?: boolean }) {
	return (
		<section
			data-reader-component="LandingHero"
			data-reader-role="hero-section"
			className="relative mx-auto grid min-h-[34rem] w-full max-w-[var(--ts-content-max)] overflow-hidden border-foreground border-b-2 bg-background lg:min-h-[25rem] lg:grid-cols-[0.44fr_0.56fr] lg:border-x-2"
		>
			<div
				data-reader-component="LandingHero"
				data-reader-role="featured-media"
				className="absolute inset-0 lg:relative lg:order-2"
			>
				<TaleImage
					shapes="slant-left-step-bottom-right"
					stepPosition="45%"
					stepDepth="88px"
					slant="32px"
					edgeSlant="14%"
					frameClassName="absolute inset-0"
					src={siteImages.emberCity}
					alt="A luminous fantasy city featured on Talescape"
					fill
					priority
					className="object-cover object-[68%_center]"
					sizes="(min-width: 1024px) 58vw, 100vw"
					decorations="image-home"
				>
					<div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/15 lg:hidden" />
				</TaleImage>
				<Button
					asChild
					variant="ink"
					shapes="slant-both"
					className="absolute right-3 bottom-3 z-10 w-[45%] lg:w-[min(90%,24rem)]"
					data-reader-component="LandingHero"
					data-reader-role="featured-tale-action"
				>
					<Link
						href="/official/branched"
						className="!h-auto !gap-2 !px-3 !py-3 !whitespace-normal lg:!gap-3 lg:!px-7"
					>
						<span className="min-w-0 lg:pl-5">
							<span className="block font-black text-secondary text-xs uppercase">
								Featured tale
							</span>
							<strong className="block font-display text-xl uppercase leading-none lg:text-2xl">
								Forked Fates
							</strong>
						</span>
						<ChevronRight className="ml-auto size-4 shrink-0 text-secondary lg:size-6" />
					</Link>
				</Button>
			</div>

			<div className="relative z-10 flex flex-col justify-center px-[var(--ts-page-gutter)] py-10 lg:order-1 lg:py-12">
				<p className="flex items-center gap-2 font-black text-sm uppercase italic">
					<span className="-skew-x-12 h-3 w-7 bg-secondary" />
					Interactive stories, unbound
				</p>
				<h1 className="mt-4 max-w-xl font-display text-5xl uppercase leading-[0.88] sm:text-6xl xl:text-7xl">
					Escape into <span className="text-primary">your next story.</span>
				</h1>
				<p className="mt-5 max-w-md text-base leading-7 sm:text-lg">
					Discover impossible worlds. Make meaningful choices. Shape the tales
					that remember you.
				</p>
				<div className="mt-7 flex flex-wrap gap-3">
					<Button asChild shapes="slant-both" size="lg" variant="default">
						<Link href="/library">
							{signedIn ? "Open library" : "Explore tales"} <ChevronRight />
						</Link>
					</Button>
					<Button asChild shapes="corners-right" size="lg" variant="outline">
						<Link href="/library/tale/add">
							Start creating <ChevronRight />
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}

async function TrendingTales() {
	const tales = await getFeaturedTales();
	return (
		<section className="mx-auto w-full max-w-[var(--ts-content-max)] px-[var(--ts-page-gutter)] py-9">
			<div className="mb-4 flex items-center justify-between gap-3">
				<ComicRail accent="secondary">
					<TrendingUp size={16} /> Trending tales
				</ComicRail>
				<Button asChild motion="underline" variant="link">
					<Link href="/library" className="text-primary">
						View all <ChevronRight size={17} />
					</Link>
				</Button>
			</div>
			<div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
				{tales.map((tale, index) => (
					<TaleCard key={tale.title} {...tale} index={index} />
				))}
			</div>
		</section>
	);
}

function DiscoveryBands() {
	return (
		<section className="mx-auto grid w-full max-w-[var(--ts-content-max)] gap-8 px-[var(--ts-page-gutter)] pb-12 lg:grid-cols-[1.7fr_0.9fr]">
			<div>
				<div className="flex items-center justify-between gap-3">
					<ComicRail accent="primary">
						<Globe2 size={16} /> Explore worlds
					</ComicRail>
					<Button asChild motion="underline" variant="link">
						<Link href="/library">
							View all <ChevronRight />
						</Link>
					</Button>
				</div>
				<div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
					{worlds.map(({ accent, copy, icon: Icon, image, name }) => (
						<Link
							key={name}
							href="/library"
							className="group grid min-h-28 grid-cols-[4.5rem_1fr] overflow-hidden border-2 border-foreground bg-card"
						>
							<div className="relative overflow-hidden">
								<Image src={image} alt="" fill className="object-cover" />
								<div
									className="absolute inset-x-0 bottom-0 h-2"
									style={{ background: accent }}
								/>
							</div>
							<div className="flex min-w-0 items-center gap-2 p-3">
								<Icon
									className="hidden size-7 shrink-0 sm:block"
									style={{ color: accent }}
								/>
								<div className="min-w-0">
									<strong className="font-display text-base uppercase sm:text-lg">
										{name}
									</strong>
									<p className="mt-1 line-clamp-3 text-muted-foreground text-xs leading-4">
										{copy}
									</p>
								</div>
								<ChevronRight className="ml-auto size-4 shrink-0" />
							</div>
						</Link>
					))}
				</div>
			</div>

			<div>
				<ComicRail accent="accent">
					<Clock3 size={16} /> Continue reading
				</ComicRail>
				<ComicPanel
					className="mt-3 overflow-hidden"
					shapes="corners-right"
					shadow={false}
				>
					<div className="comic-panel-content grid min-h-28 grid-cols-[7rem_1fr] gap-4">
						<div className="relative border-2 border-foreground">
							<Image
								alt="The Ember Archive"
								fill
								className="object-cover"
								src={siteImages.emberCity}
							/>
						</div>
						<div className="min-w-0">
							<div className="flex gap-2">
								<div className="min-w-0 flex-1">
									<strong className="font-display text-xl uppercase">
										Forked Fates
									</strong>
									<p className="truncate text-muted-foreground text-xs">
										A Knock Beneath Thornwick
									</p>
								</div>
								<Bookmark className="shrink-0 text-secondary" />
							</div>
							<div className="mt-3 flex items-center gap-3">
								<ProgressBar className="flex-1" value={68} />
								<span className="font-black text-xs">68%</span>
							</div>
							<div className="mt-3 flex items-center gap-3 text-muted-foreground text-xs">
								<span className="inline-flex items-center gap-1">
									<Eye size={14} /> 12.4K
								</span>
								<span className="inline-flex items-center gap-1">
									<Clock3 size={14} /> 6h
								</span>
								<Button asChild className="ml-auto" size="sm" variant="comic">
									<Link
										href="/official/branched"
										aria-label="Continue Forked Fates"
									>
										<Play fill="currentColor" />
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</ComicPanel>
			</div>
		</section>
	);
}

function HomeExperience({ signedIn = false }: { signedIn?: boolean }) {
	return (
		<PageShell>
			<LandingHero signedIn={signedIn} />
			<Suspense fallback={<CardGridSkeleton count={3} />}>
				<TrendingTales />
			</Suspense>
			<DiscoveryBands />
		</PageShell>
	);
}

export function LandingPageContent() {
	return <HomeExperience />;
}

export function SignedInHomeContent() {
	return <HomeExperience signedIn />;
}
