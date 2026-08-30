import {
	BookOpen,
	ChevronRight,
	CircleUserRound,
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
import {
	CardGridSkeleton,
	PanelSkeleton,
} from "~/app/(site)/_shared/components/skeletons";
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

async function CodexHero() {
	return (
		<section className="grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
			<div className="flex flex-col justify-center py-3 lg:py-10">
				<ComicRail>World bible</ComicRail>
				<h1 className="mt-5 max-w-3xl text-balance font-display text-5xl uppercase leading-[0.88] sm:text-7xl">
					Codex of the Ember Archive
				</h1>
				<p className="mt-5 max-w-2xl text-muted-foreground leading-7">
					Explore the people, places, factions, art, and strange histories that
					make every Talescape world feel inhabited.
				</p>
				<Button
					asChild
					className="mt-7 self-start"
					shape="slant-right"
					variant="secondary"
				>
					<Link href="#featured-entries">
						Explore the archive <ChevronRight />
					</Link>
				</Button>
			</div>
			<ComicPanel
				as="div"
				className="min-h-72 overflow-hidden lg:min-h-[28rem]"
				decoration="dots"
				shape="cut-opposite"
				slant="48px"
			>
				<div className="comic-panel-bleed relative h-full min-h-72 lg:min-h-[28rem]">
					<Image
						src={siteImages.emberCity}
						alt="The imagined city held inside the Ember Archive"
						fill
						priority
						className="object-cover"
					/>
					<div className="comic-halftone absolute right-0 bottom-0 size-36 bg-secondary opacity-70 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
				</div>
			</ComicPanel>
		</section>
	);
}

function CodexCategories() {
	return (
		<section>
			<ComicRail accent="secondary">Browse categories</ComicRail>
			<div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{categories.map(({ accent, copy, icon: Icon, label }) => (
					<ComicPanel
						accent={accent}
						as="article"
						className="comic-panel-content flex min-h-32 items-center gap-4"
						key={label}
						shape="corners-right"
						shadow={false}
						slant="20px"
					>
						<Icon className="size-10 text-primary" strokeWidth={2.4} />
						<div className="min-w-0">
							<h2 className="font-display text-2xl uppercase">{label}</h2>
							<p className="mt-1 text-muted-foreground text-sm">{copy}</p>
						</div>
						<ChevronRight className="ml-auto size-5 shrink-0" />
					</ComicPanel>
				))}
			</div>
		</section>
	);
}

async function CodexEntryGrid() {
	const codexEntries = await getCodexEntries();

	return (
		<section id="featured-entries" className="scroll-mt-28">
			<ComicRail accent="primary">
				<Sparkles className="size-4" /> Featured entries
			</ComicRail>
			<div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
				{codexEntries.map((entry, index) => (
					<ComicPanel
						accent={
							index % 3 === 0
								? "primary"
								: index % 3 === 1
									? "secondary"
									: "accent"
						}
						as="article"
						className="flex min-h-[25rem] flex-col overflow-hidden"
						decoration={index % 2 === 0 ? "dots" : "strikes"}
						key={entry.title}
						shape={index % 2 === 0 ? "corner-top-right" : "corner-bottom-left"}
						slant="24px"
					>
						<div className="comic-panel-bleed relative aspect-[16/10]">
							<Image
								src={entry.image}
								alt={entry.title}
								fill
								className="object-cover"
							/>
						</div>
						<div className="comic-panel-content flex flex-1 flex-col pt-4">
							<p className="font-black text-primary text-xs uppercase">
								{entry.type}
							</p>
							<h2 className="mt-2 font-display text-2xl uppercase leading-none">
								{entry.title}
							</h2>
							<p className="mt-3 text-muted-foreground text-sm leading-6">
								{entry.copy}
							</p>
							<Link
								href="#"
								className="mt-auto inline-flex min-h-11 items-center gap-1 pt-4 font-black text-primary text-xs uppercase"
							>
								View entry <ChevronRight className="size-4" />
							</Link>
						</div>
					</ComicPanel>
				))}
			</div>
		</section>
	);
}

async function CodexFooterPanels() {
	const links = await getCodexLinks();

	return (
		<section className="grid gap-5 lg:grid-cols-2">
			<ComicPanel
				accent="secondary"
				className="comic-panel-content text-secondary-foreground [--comic-panel-background:var(--secondary)]"
				decoration="strikes"
				shape="cut-opposite-reverse"
				slant="28px"
			>
				<ComicRail>Faction watch</ComicRail>
				<div className="mt-5 grid gap-3 sm:grid-cols-2">
					{["Lantern Monks", "Glass Cartel", "Ashwardens", "Ochre Choir"].map(
						(faction) => (
							<div
								key={faction}
								className="border-2 border-foreground bg-card p-4 text-card-foreground"
							>
								<h2 className="font-display text-xl uppercase">{faction}</h2>
								<p className="mt-1 text-muted-foreground text-sm">
									Influence rising across the latest chapter notes.
								</p>
							</div>
						),
					)}
				</div>
			</ComicPanel>

			<ComicPanel
				accent="primary"
				className="comic-panel-content"
				shape="corners-right"
				slant="24px"
			>
				<ComicRail accent="primary">Forums and external links</ComicRail>
				<div className="mt-4 divide-y-2 divide-foreground/15">
					{links.map((link) => (
						<Link
							key={link}
							href="#"
							className="flex min-h-12 items-center justify-between gap-4 py-3 font-bold text-sm hover:text-primary"
						>
							<span>{link}</span>
							<ChevronRight className="size-4" />
						</Link>
					))}
				</div>
				<Button asChild className="mt-5" shape="slant-right" variant="ink">
					<Link href="/library">Browse connected books</Link>
				</Button>
			</ComicPanel>
		</section>
	);
}

export function CodexContent() {
	return (
		<div className="mx-auto flex w-full max-w-[90rem] flex-col gap-9 px-4 py-8 sm:px-6 lg:gap-12 lg:py-12">
			<Suspense fallback={<PanelSkeleton />}>
				<CodexHero />
			</Suspense>
			<CodexCategories />
			<Suspense fallback={<CardGridSkeleton count={4} />}>
				<CodexEntryGrid />
			</Suspense>
			<Suspense fallback={<PanelSkeleton />}>
				<CodexFooterPanels />
			</Suspense>
		</div>
	);
}
