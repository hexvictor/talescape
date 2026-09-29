import {
	BookOpen,
	Boxes,
	ChevronRight,
	Clock3,
	FileImage,
	FileText,
	GitBranch,
	ImageIcon,
	Layers3,
	Network,
	Puzzle,
	Route,
	Sparkles,
	UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteImages } from "~/app/(site)/_shared/components/landingCodexData";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { Button } from "~/components/ui/button";
import type {
	LibraryAuthorList,
	LibraryBookList,
	LibraryTaleList,
} from "~/server/db/data/library/queries";
import { LibraryTalesExplorer } from "./LibraryTalesExplorer";
import { getTaleReaderHref } from "./taleHref";

const collections = [
	{
		href: "/library/books",
		label: "Books",
		copy: "Stories and novels",
		icon: BookOpen,
		color: "var(--talescape-cyan)",
	},
	{
		href: "/library/authors",
		label: "Authors",
		copy: "Creators and minds",
		icon: UserRound,
		color: "var(--talescape-magenta)",
	},
	{
		href: "/library",
		label: "Tales",
		copy: "Interactive stories",
		icon: Sparkles,
		color: "var(--talescape-yellow)",
	},
	{
		href: "/library/branches",
		label: "Branches",
		copy: "Story structures",
		icon: GitBranch,
		color: "var(--talescape-green)",
	},
	{
		href: "/library/scenes",
		label: "Scenes",
		copy: "Moments and story beats",
		icon: FileImage,
		color: "var(--muted-foreground)",
	},
	{
		href: "/library/frames",
		label: "Frames",
		copy: "Visual sequences",
		icon: ImageIcon,
		color: "var(--talescape-cyan)",
	},
	{
		href: "/library/elements",
		label: "Elements",
		copy: "Objects and concepts",
		icon: Layers3,
		color: "var(--talescape-magenta)",
	},
	{
		href: "/library/parts",
		label: "Parts",
		copy: "Reusable components",
		icon: Puzzle,
		color: "var(--talescape-yellow)",
	},
	{
		href: "/library/entries",
		label: "Entries",
		copy: "Lore and notes",
		icon: FileText,
		color: "var(--muted-foreground)",
	},
	{
		href: "/library/pages",
		label: "Pages",
		copy: "Written content",
		icon: FileText,
		color: "var(--talescape-cyan)",
	},
	{
		href: "/library/paths",
		label: "Paths",
		copy: "Reading journeys",
		icon: Route,
		color: "var(--talescape-green)",
	},
] as const;

type LibraryLandingProps = {
	authors: LibraryAuthorList;
	books: LibraryBookList;
	tales: LibraryTaleList;
};

export function LibraryLanding({ authors, books, tales }: LibraryLandingProps) {
	const featuredTale = tales[0];
	const featuredBook = books[0];
	const featuredAuthor = authors[0];
	const taleHref = featuredTale ? getTaleReaderHref(featuredTale) : null;

	return (
		<div className="flex flex-col gap-8">
			<section className="grid gap-3 lg:grid-cols-3">
				<FeaturedCard
					accent="var(--talescape-magenta)"
					copy={
						featuredTale?.description ??
						"A production-shaped branching story through the buried streets of Thornwick."
					}
					href={taleHref ?? "/official/branched"}
					image={siteImages.moonlessHarbor}
					label="Featured tale"
					title={featuredTale?.title ?? "Forked Fates"}
				/>
				<FeaturedCard
					accent="var(--talescape-cyan)"
					copy={
						featuredBook?.description ??
						"An epic fantasy novel and the first book in an immense story archive."
					}
					href={
						featuredBook ? `/library/book/${featuredBook.id}` : "/library/books"
					}
					image={siteImages.crownOfAsh}
					label="Featured book"
					title={featuredBook?.title ?? "The Way of Kings"}
				/>
				<FeaturedCard
					accent="var(--talescape-yellow)"
					copy={
						featuredAuthor?.biography ??
						"A creator of vivid worlds, complex characters, and stories built to be explored."
					}
					href={
						featuredAuthor
							? `/library/author/${featuredAuthor.id}`
							: "/library/authors"
					}
					image={siteImages.emberCity}
					label="Featured author"
					title={featuredAuthor?.fullName ?? "Featured Creator"}
				/>
			</section>

			<section>
				<div className="flex items-center justify-between gap-3">
					<ComicRail accent="primary">
						<BookOpen className="size-4" /> Explore the library
					</ComicRail>
					<Button asChild motion="underline" variant="link">
						<Link href="/library/frames">
							View all <ChevronRight />
						</Link>
					</Button>
				</div>
				<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
					{collections.map(({ color, copy, href, icon: Icon, label }) => (
						<Link
							key={label}
							href={href}
							className="hover:-translate-y-0.5 flex min-h-24 items-center gap-3 border-2 border-foreground bg-card p-3 transition-transform"
						>
							<Icon className="size-8 shrink-0" style={{ color }} />
							<div className="min-w-0">
								<strong className="font-display text-lg uppercase">
									{label}
								</strong>
								<p className="text-muted-foreground text-xs leading-4">
									{copy}
								</p>
							</div>
							<ChevronRight className="ml-auto size-4 shrink-0" />
						</Link>
					))}
				</div>
			</section>

			<section>
				<ComicRail accent="secondary">
					<Network className="size-4" /> How it all connects
				</ComicRail>
				<ComicPanel className="mt-3" shape="corners-right" shadow={false}>
					<div className="comic-panel-content grid gap-6 lg:grid-cols-[20rem_1fr] lg:items-center">
						<div>
							<h2 className="font-display text-3xl uppercase">
								Stories are built together.
							</h2>
							<p className="mt-2 text-sm leading-6">
								Books contain tales. Tales branch into scenes, frames,
								keyframes, and elements. Narrative pages connect those
								structures into a reading journey.
							</p>
						</div>
						<div
							className="flex flex-wrap items-center justify-center gap-2"
							aria-label="Talescape content model"
						>
							{[
								"Books",
								"Tales",
								"Branches",
								"Scenes",
								"Frames",
								"Elements",
								"Pages",
							].map((item, index) => (
								<div key={item} className="flex items-center gap-2">
									<span className="border-2 border-foreground bg-card px-4 py-3 font-black text-xs uppercase">
										{item}
									</span>
									{index < 6 ? (
										<ChevronRight className="size-4 text-primary" />
									) : null}
								</div>
							))}
						</div>
					</div>
				</ComicPanel>
			</section>

			<section>
				<div className="flex items-center justify-between gap-3">
					<ComicRail accent="accent">
						<Clock3 className="size-4" /> Recently updated
					</ComicRail>
					<Button asChild motion="underline" variant="link">
						<Link href="#browse-tales">
							View all <ChevronRight />
						</Link>
					</Button>
				</div>
				<div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
					{tales.slice(0, 4).map((tale, index) => (
						<Link
							key={tale.id}
							href={`/library/tale/${tale.id}`}
							className="grid min-h-20 grid-cols-[6rem_1fr] border-2 border-foreground bg-card"
						>
							<div className="relative">
								<Image
									alt=""
									fill
									className="object-cover"
									src={
										[
											siteImages.emberCity,
											siteImages.lastStarbound,
											siteImages.moonlessHarbor,
											siteImages.crownOfAsh,
										][index] ?? siteImages.emberCity
									}
								/>
							</div>
							<div className="flex min-w-0 items-center gap-2 p-3">
								<div className="min-w-0">
									<span className="text-primary text-xs uppercase">
										Tale updated
									</span>
									<strong className="block truncate font-display text-lg uppercase">
										{tale.title}
									</strong>
								</div>
								<ChevronRight className="ml-auto size-4 shrink-0" />
							</div>
						</Link>
					))}
				</div>
			</section>

			<section id="browse-tales" className="scroll-mt-28">
				<div className="mb-4 flex items-center justify-between gap-3">
					<ComicRail accent="secondary">
						<Boxes className="size-4" /> Browse tales
					</ComicRail>
					<Button asChild shape="slant-right" size="sm" variant="default">
						<Link href="/library/tale/add">Create tale</Link>
					</Button>
				</div>
				<LibraryTalesExplorer tales={tales} />
			</section>
		</div>
	);
}

function FeaturedCard({
	accent,
	copy,
	href,
	image,
	label,
	title,
}: {
	accent: string;
	copy: string | null;
	href: string;
	image: string;
	label: string;
	title: string;
}) {
	return (
		<Link href={href} className="block">
			<ComicPanel
				accent={accent}
				as="article"
				className="group grid h-full min-h-52 grid-cols-[42%_1fr] overflow-hidden"
				decoration="dots"
				shape="corner-top-right"
				shadow={false}
			>
				<div className="comic-panel-bleed relative min-h-52 border-foreground border-r-2">
					<Image
						src={image}
						alt=""
						fill
						className="object-cover transition-transform group-hover:scale-105"
					/>
				</div>
				<div className="comic-panel-content flex min-w-0 flex-col justify-center py-4">
					<span
						className="font-black text-xs uppercase italic"
						style={{ color: accent }}
					>
						{label}
					</span>
					<h2 className="mt-1 font-display text-2xl uppercase leading-none">
						{title}
					</h2>
					<p className="mt-2 line-clamp-4 text-sm leading-5">{copy}</p>
					<ChevronRight className="mt-3 self-end" />
				</div>
			</ComicPanel>
		</Link>
	);
}
