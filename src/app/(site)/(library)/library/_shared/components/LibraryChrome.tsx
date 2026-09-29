"use client";

import { BookMarked, Lock, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { siteImages } from "~/app/(site)/_shared/components/landingCodexData";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import { type LibraryView, libraryViews } from "./libraryViews";

type LibraryCounts = Record<LibraryView, number>;

type CurrentUser = {
	username: string;
	fullName: string;
} | null;

type LibraryChromeProps = PropsWithChildren<{
	counts: LibraryCounts;
	currentUser: CurrentUser;
}>;

export function LibraryChrome({
	counts,
	currentUser,
	children,
}: LibraryChromeProps) {
	const pathname = usePathname();

	return (
		<div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
			<ComicPanel
				accent="primary"
				className="comic-panel-content"
				decoration="strikes"
				shape="cut-opposite"
				slant="28px"
			>
				<div className="grid gap-5 lg:grid-cols-[1fr_minmax(18rem,0.58fr)] lg:items-stretch">
					<div className="min-w-0">
						<ComicRail accent="primary">
							<BookMarked aria-hidden="true" className="size-4" /> Library
						</ComicRail>
						<h1 className="mt-4 text-balance font-display text-3xl uppercase sm:text-4xl">
							Browse tales, books, authors, and story frames.
						</h1>
						<div className="mt-5 flex flex-wrap gap-2">
							{currentUser ? (
								<Button asChild size="sm" variant="ghost">
									<Link href={`/library/${currentUser.username}`}>
										<UserRound aria-hidden="true" />
										My library
									</Link>
								</Button>
							) : (
								<Button asChild size="sm" variant="outline">
									<Link href="/sign-in">
										<Lock aria-hidden="true" />
										Sign in
									</Link>
								</Button>
							)}
						</div>
					</div>
					<div className="relative hidden min-h-40 overflow-hidden border-2 border-foreground [clip-path:polygon(28px_0,100%_0,calc(100%_-_28px)_100%,0_100%)] lg:block">
						<Image
							alt="A moonlit Talescape harbor"
							className="object-cover"
							fill
							sizes="38vw"
							src={siteImages.moonlessHarbor}
						/>
						<div className="absolute inset-0 bg-gradient-to-r from-card/40 to-transparent" />
					</div>
				</div>
				<nav
					aria-label="Library sections"
					className="mt-4 flex flex-wrap gap-2"
				>
					{libraryViews.map((view) => {
						const isActive =
							view.href === "/library"
								? pathname === "/library"
								: pathname === view.href;

						return (
							<Link
								key={view.key}
								href={view.href}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"inline-flex min-h-11 items-center gap-2 border-2 border-transparent px-4 font-black text-xs uppercase transition-colors",
									isActive
										? "border-foreground bg-[var(--comic-ink)] text-[var(--comic-cream)] [clip-path:polygon(10px_0,100%_0,calc(100%_-_10px)_100%,0_100%)]"
										: "text-muted-foreground hover:border-foreground hover:bg-secondary hover:text-secondary-foreground",
								)}
							>
								{view.label}
								<span
									className={cn(
										"border border-current px-1.5 py-0.5 text-xs",
										isActive ? "bg-primary-foreground/15" : "bg-muted",
									)}
								>
									{counts[view.key]}
								</span>
							</Link>
						);
					})}
				</nav>
			</ComicPanel>
			{children}
		</div>
	);
}
