"use client";

import { BookOpen, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";
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
type LibraryChromeProps = PropsWithChildren<{
	counts: LibraryCounts;
	currentUser: { username: string; fullName: string } | null;
}>;

export function LibraryChrome({
	counts,
	currentUser,
	children,
}: LibraryChromeProps) {
	const pathname = usePathname();
	return (
		<PageShell
			decorations="library"
			data-reader-component="LibraryChrome"
			data-reader-role="library-page"
			className="mx-auto flex max-w-[var(--ts-content-max)] flex-col px-[var(--ts-page-gutter)] py-6"
		>
			<header
				data-reader-component="LibraryChrome"
				data-reader-role="library-toolbar"
				className="flex flex-wrap items-center justify-between gap-4 border-border border-b pb-5"
			>
				<div>
					<h1 className="flex items-center gap-3 font-display text-4xl">
						<BookOpen className="size-7 text-primary" /> Library
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Discover stories and manage your collection.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button asChild shapes="cut-opposite">
						<Link href="/library/tale/add">
							<Plus /> New tale
						</Link>
					</Button>
					<Button asChild variant="outline" shapes="cut-opposite">
						<Link href="/library/book/add">
							<Plus /> Book
						</Link>
					</Button>
					<Button asChild variant="outline" shapes="cut-opposite">
						<Link href="/library/author/add">
							<Plus /> Author
						</Link>
					</Button>
					<Button asChild variant="ghost">
						<Link
							href={
								currentUser ? `/library/${currentUser.username}` : "/sign-in"
							}
						>
							<UserRound />
							{currentUser ? "My library" : "Sign in"}
						</Link>
					</Button>
				</div>
			</header>
			<nav
				aria-label="Library sections"
				data-reader-component="LibraryChrome"
				data-reader-role="library-navigation"
				className="mt-4 flex flex-wrap gap-2"
			>
				{libraryViews.map((view) => (
					<Button
						asChild
						key={view.key}
						variant={pathname === view.href ? "navActive" : "nav"}
						shapes="cut-opposite"
						motion="flat"
					>
						<Link
							href={view.href}
							aria-current={pathname === view.href ? "page" : undefined}
						>
							{view.label}
							<span className="text-muted-foreground text-xs">
								{counts[view.key]}
							</span>
						</Link>
					</Button>
				))}
			</nav>
			<div
				data-reader-component="LibraryChrome"
				data-reader-role="library-results"
				className="mt-6"
			>
				{children}
			</div>
		</PageShell>
	);
}
