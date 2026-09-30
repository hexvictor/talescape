import {
	BarChart3,
	BookOpen,
	ChevronRight,
	CircleUserRound,
	Clock3,
	Eye,
	ImageIcon,
	Shield,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
	getCodexEntries,
	getCodexLinks,
	siteImages,
} from "~/app/(site)/_shared/components/landingCodexData";
import { CardGridSkeleton } from "~/app/(site)/_shared/components/skeletons";
import { DecoratedMedia } from "~/components/decorations";
import { PageShell } from "~/components/layout/page-shell";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { Button } from "~/components/ui/button";

const categories = [
	{
		accent: "secondary" as const,
		copy: "Heroes, allies, and rivals.",
		icon: CircleUserRound,
		label: "Characters",
	},
	{
		accent: "primary" as const,
		copy: "Groups, orders, and kingdoms.",
		icon: Shield,
		label: "Factions",
	},
	{
		accent: "accent" as const,
		copy: "Concepts, key art, and illustration.",
		icon: ImageIcon,
		label: "Art",
	},
	{
		accent: "foreground" as const,
		copy: "Lore bits, secrets, and history.",
		icon: BookOpen,
		label: "Trivia",
	},
];

const factions = [
	{
		image: siteImages.crownOfAsh,
		name: "Lantern Monks",
		copy: "Seek knowledge and keep the light through the ages.",
	},
	{
		image: siteImages.lastStarbound,
		name: "Glass Cartel",
		copy: "Traders in information, artifacts, and influence.",
	},
	{
		image: siteImages.moonlessHarbor,
		name: "Ashwardens",
		copy: "Stand between the world and what should not wake.",
	},
	{
		image: siteImages.emberCity,
		name: "Ochre Choir",
		copy: "Sing the truth in a world that prefers silence.",
	},
] as const;

function CodexHero() {
	return (
		<section className="grid items-stretch gap-5 lg:grid-cols-[0.72fr_1.28fr]">
			<div className="flex flex-col justify-center py-3 lg:py-8">
				<ComicRail>World bible</ComicRail>
				<h1 className="mt-5 max-w-xl font-display text-5xl uppercase leading-[0.88] sm:text-6xl xl:text-7xl">
					Codex of the Ember Archive
				</h1>
				<p className="mt-5 max-w-xl text-base leading-7">
					Explore the people, places, factions, art, and strange histories that
					make every Talescape world feel inhabited.
				</p>
				<Button
					asChild
					className="mt-7 self-start"
					shape="slant-right"
					size="lg"
					variant="default"
				>
					<Link href="#featured-entries">
						Explore the archive <ChevronRight />
					</Link>
				</Button>
			</div>
			<ComicPanel
				className="min-h-72 overflow-hidden lg:min-h-[20rem]"
				decoration="dots"
				shape="cut-opposite"
				slant="48px"
				shadow={false}
			>
				<DecoratedMedia
					className="comic-panel-bleed relative h-full min-h-72 lg:min-h-[20rem]"
					preset="cyan-corner"
				>
					<Image
						src={siteImages.emberCity}
						alt="The city held inside the Ember Archive"
						fill
						priority
						className="object-cover"
					/>
				</DecoratedMedia>
			</ComicPanel>
		</section>
	);
}

function CodexCategories() {
	return (
		<section>
			<div className="flex items-center justify-between gap-3">
				<ComicRail accent="secondary">
					<Sparkles className="size-4" /> Browse categories
				</ComicRail>
				<Button asChild motion="underline" variant="link">
					<Link href="/library">
						View all <ChevronRight />
					</Link>
				</Button>
			</div>
			<div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible xl:grid-cols-4">
				{categories.map(({ accent, copy, icon: Icon, label }) => (
					<ComicPanel
						accent={accent}
						as="article"
						className="comic-panel-content flex min-h-24 w-56 shrink-0 items-center gap-3 sm:w-auto"
						key={label}
						shape="corners-right"
						shadow={false}
						slant="18px"
					>
						<Icon className="size-10 shrink-0 text-primary" strokeWidth={2.4} />
						<div className="min-w-0">
							<h2 className="font-display text-xl uppercase">{label}</h2>
							<p className="mt-1 text-muted-foreground text-xs">{copy}</p>
						</div>
						<ChevronRight className="ml-auto size-5 shrink-0" />
					</ComicPanel>
				))}
			</div>
		</section>
	);
}

async function CodexEntryGrid() {
	const entries = await getCodexEntries();
	return (
		<section id="featured-entries" className="scroll-mt-28">
			<div className="flex items-center justify-between gap-3">
				<ComicRail accent="primary">
					<Sparkles className="size-4" /> Featured entries
				</ComicRail>
				<Button asChild motion="underline" variant="link">
					<Link href="/library">
						View all <ChevronRight />
					</Link>
				</Button>
			</div>
			<div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				{entries.map((entry, index) => (
					<ComicPanel
						accent={
							index % 3 === 0
								? "primary"
								: index % 3 === 1
									? "secondary"
									: "accent"
						}
						as="article"
						className="grid min-h-40 grid-cols-[44%_1fr] overflow-hidden md:flex md:min-h-[20rem] md:flex-col"
						decoration={index % 2 === 0 ? "dots" : "strikes"}
						key={entry.title}
						shape="corner-top-right"
						shadow={false}
						slant="20px"
					>
						<div className="comic-panel-bleed relative min-h-40 border-foreground border-r-2 md:aspect-[16/9] md:min-h-0 md:border-r-0 md:border-b-2">
							<Image src={entry.image} alt="" fill className="object-cover" />
						</div>
						<div className="comic-panel-content flex min-w-0 flex-1 flex-col py-4">
							<p className="font-black text-primary text-xs uppercase italic">
								{entry.type}
							</p>
							<h2 className="mt-1 font-display text-xl uppercase leading-none sm:text-2xl">
								{entry.title}
							</h2>
							<p className="mt-2 line-clamp-3 text-sm leading-5">
								{entry.copy}
							</p>
							<div className="mt-auto flex items-center gap-3 pt-3 text-muted-foreground text-xs">
								<Eye size={14} /> {(12 + index * 4).toFixed(1)}K{" "}
								<Clock3 size={14} /> {5 + index} min{" "}
								<ChevronRight className="ml-auto" />
							</div>
						</div>
					</ComicPanel>
				))}
			</div>
		</section>
	);
}

function FactionWatch() {
	return (
		<aside className="lg:row-span-3">
			<ComicRail accent="secondary">
				<BarChart3 className="size-4" /> Faction watch
			</ComicRail>
			<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
				{factions.map((faction, index) => (
					<Link
						key={faction.name}
						href="#"
						className="grid min-h-24 grid-cols-[7rem_1fr] overflow-hidden border-2 border-foreground bg-card"
					>
						<div className="relative">
							<Image src={faction.image} alt="" fill className="object-cover" />
							<div className="absolute inset-x-0 bottom-0 h-2 bg-secondary" />
						</div>
						<div className="flex min-w-0 items-center gap-2 p-3">
							<Shield className="size-7 shrink-0 text-primary" />
							<div>
								<h2 className="font-display text-lg uppercase">
									{faction.name}
								</h2>
								<p className="mt-1 line-clamp-2 text-xs leading-4">
									{faction.copy}
								</p>
							</div>
							<ChevronRight className="ml-auto size-4 shrink-0" />
						</div>
					</Link>
				))}
			</div>
			<Button
				asChild
				className="mt-3 w-full"
				shape="slant-both"
				variant="outline"
			>
				<Link href="/library">
					Explore all factions <ChevronRight />
				</Link>
			</Button>
		</aside>
	);
}

async function RecentEntries() {
	const links = await getCodexLinks();
	const images = [
		siteImages.emberCity,
		siteImages.lastStarbound,
		siteImages.crownOfAsh,
		siteImages.moonlessHarbor,
	];
	return (
		<section>
			<div className="flex items-center justify-between gap-3">
				<ComicRail accent="accent">
					<Clock3 className="size-4" /> Recent entries
				</ComicRail>
				<Button asChild motion="underline" variant="link">
					<Link href="/library">
						View all <ChevronRight />
					</Link>
				</Button>
			</div>
			<div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
				{links.map((label, index) => (
					<Link
						key={label}
						href="#"
						className="grid min-h-20 grid-cols-[5rem_1fr] border-2 border-foreground bg-card"
					>
						<div className="relative">
							<Image
								src={images[index] ?? siteImages.emberCity}
								alt=""
								fill
								className="object-cover"
							/>
						</div>
						<div className="flex min-w-0 items-center gap-2 p-3">
							<span className="line-clamp-2 font-bold text-xs">{label}</span>
							<ChevronRight className="ml-auto size-4 shrink-0" />
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}

export function CodexContent() {
	return (
		<PageShell
			className="mx-auto grid w-full max-w-[var(--ts-content-max)] gap-8 px-[var(--ts-page-gutter)] py-8 lg:grid-cols-[1fr_20rem] lg:gap-6 lg:py-5"
			decorationPreset="codex"
		>
			<div className="flex min-w-0 flex-col gap-8">
				<CodexHero />
				<CodexCategories />
				<Suspense fallback={<CardGridSkeleton count={4} />}>
					<CodexEntryGrid />
				</Suspense>
				<Suspense fallback={null}>
					<RecentEntries />
				</Suspense>
			</div>
			<FactionWatch />
		</PageShell>
	);
}
