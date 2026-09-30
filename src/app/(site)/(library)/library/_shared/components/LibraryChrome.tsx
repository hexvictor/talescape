"use client";

import {
	BookOpen,
	ChevronRight,
	FileImage,
	FileText,
	GitBranch,
	ImageIcon,
	LibraryBig,
	Lock,
	Search,
	UserRound,
	UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { siteImages } from "~/app/(site)/_shared/components/landingCodexData";
import { ComicRail } from "~/components/layout/comic-panel";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import { type LibraryView, libraryViews } from "./libraryViews";

export type LibraryCounts = Record<LibraryView, number> & {
	branches: number;
	elements: number;
	entries: number;
	pages: number;
	parts: number;
	paths: number;
	scenes: number;
};

type CurrentUser = { username: string; fullName: string } | null;
type LibraryChromeProps = PropsWithChildren<{
	counts: LibraryCounts;
	currentUser: CurrentUser;
}>;

const countItems = [
	{ key: "books", label: "Books", icon: BookOpen },
	{ key: "authors", label: "Authors", icon: UsersRound },
	{ key: "tales", label: "Tales", icon: FileText },
	{ key: "branches", label: "Branches", icon: GitBranch },
	{ key: "scenes", label: "Scenes", icon: FileImage },
	{ key: "frames", label: "Frames", icon: ImageIcon },
] as const;

export function LibraryChrome({
	counts,
	currentUser,
	children,
}: LibraryChromeProps) {
	const pathname = usePathname();
	const isLanding = pathname === "/library";

	return (
		<PageShell
			className="mx-auto flex w-full max-w-[var(--ts-content-max)] flex-col px-[var(--ts-page-gutter)] py-6 lg:py-5"
			decorationPreset="library"
		>
			{isLanding ? (
				<>
					<section className="relative grid min-h-[25rem] overflow-hidden border-foreground border-b-2 lg:grid-cols-[0.42fr_0.58fr] lg:border-2">
						<div className="relative z-10 flex flex-col justify-center py-8 lg:px-6">
							<p className="flex items-center gap-2 font-black text-sm uppercase italic">
								<span className="-skew-x-12 h-3 w-7 bg-secondary" />
								Stories. Creators. Worlds.
							</p>
							<h1 className="mt-3 font-display text-4xl uppercase leading-[0.88] sm:text-6xl xl:text-7xl">
								The Talescape <span className="block">Library</span>
							</h1>
							<p className="mt-4 max-w-lg text-sm leading-6 sm:text-base">
								Browse books, authors, tales, and story structures from across
								Talescape. Discover new worlds and find your next adventure.
							</p>
							<form
								action="/library"
								className="mt-5 flex max-w-xl border-2 border-foreground bg-card"
							>
								<label htmlFor="library-search" className="sr-only">
									Search the library
								</label>
								<Search className="ml-4 size-5 self-center" />
								<input
									id="library-search"
									name="q"
									placeholder="Search the library..."
									className="min-h-12 min-w-0 flex-1 bg-transparent px-3 outline-none"
								/>
								<Button type="submit" shape="slant-left" variant="secondary">
									Search <ChevronRight />
								</Button>
							</form>
						</div>
						<div className="absolute inset-0 lg:relative">
							<Image
								alt="The worlds of the Talescape library"
								className="object-cover object-[66%_center] lg:[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)]"
								fill
								priority
								sizes="(min-width: 1024px) 58vw, 100vw"
								src={siteImages.emberCity}
							/>
							<div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent lg:hidden" />
							<div className="comic-hero-strikes absolute top-0 left-0 size-40 bg-primary" />
							<div className="absolute right-0 bottom-0 hidden bg-[var(--comic-ink)] px-8 py-4 text-[var(--comic-cream)] [clip-path:polygon(10%_0,100%_0,94%_100%,0_100%)] lg:block">
								<span className="text-secondary text-xs uppercase">
									Explore countless stories
								</span>
								<strong className="block font-display text-2xl uppercase">
									Real worlds. Living stories.
								</strong>
							</div>
						</div>
					</section>
					<section
						aria-label="Library totals"
						className="grid grid-cols-3 border-foreground border-x-2 border-b-2 bg-card sm:grid-cols-6"
					>
						{countItems.map(({ key, label, icon: Icon }) => (
							<div
								key={key}
								className="flex items-center gap-2 border-foreground/20 border-r p-3 last:border-r-0"
							>
								<Icon className="size-6 shrink-0 text-primary" />
								<div>
									<strong className="block text-sm">
										{counts[key].toLocaleString()}
									</strong>
									<span className="text-[10px] uppercase">{label}</span>
								</div>
							</div>
						))}
					</section>
				</>
			) : (
				<div className="flex items-center justify-between gap-4 border-2 border-foreground bg-card p-4">
					<ComicRail accent="primary">
						<LibraryBig className="size-4" /> Library
					</ComicRail>
					{currentUser ? (
						<Button asChild size="sm" variant="ghost">
							<Link href={`/library/${currentUser.username}`}>
								<UserRound /> My library
							</Link>
						</Button>
					) : (
						<Button asChild size="sm" variant="outline">
							<Link href="/sign-in">
								<Lock /> Sign in
							</Link>
						</Button>
					)}
				</div>
			)}

			<nav
				aria-label="Library sections"
				className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap"
			>
				{libraryViews.map((view) => {
					const active =
						view.href === "/library"
							? pathname === "/library"
							: pathname === view.href;
					return (
						<Button
							asChild
							key={view.key}
							motion="flat"
							variant={active ? "navActive" : "nav"}
							className={cn(
								"min-h-10 gap-2 px-4",
								active
									? "border-foreground bg-[var(--comic-ink)] text-[var(--comic-cream)]"
									: "bg-card text-muted-foreground hover:border-foreground",
							)}
						>
							<Link href={view.href} aria-current={active ? "page" : undefined}>
								{view.label}
								<span className="border border-current px-1.5 py-0.5 text-xs">
									{counts[view.key]}
								</span>
							</Link>
						</Button>
					);
				})}
				{currentUser ? (
					<Button asChild className="ml-auto" size="sm" variant="ghost">
						<Link href={`/library/${currentUser.username}`}>
							<UserRound /> My library
						</Link>
					</Button>
				) : null}
			</nav>
			<div className="mt-6">{children}</div>
		</PageShell>
	);
}
