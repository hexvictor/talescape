"use client";

import { BookMarked, Lock, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
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
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-5 py-2">
			<section className="rounded-md border bg-card p-4 shadow-sm sm:p-5">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="min-w-0">
						<div className="flex items-center gap-2 text-primary">
							<BookMarked aria-hidden="true" className="size-4" />
							<p className="font-semibold text-xs uppercase tracking-normal">
								Library
							</p>
						</div>
						<h1 className="mt-2 text-balance font-semibold text-2xl">
							Browse tales, books, authors, and story nodes.
						</h1>
					</div>
					<div className="flex flex-wrap gap-2">
						{currentUser ? (
							<Button asChild size="sm" variant="outline">
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
				<nav
					aria-label="Library sections"
					className="scrollbar-none mt-4 overflow-x-auto"
				>
					<div className="flex min-w-max gap-2">
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
										"inline-flex h-9 items-center gap-2 rounded-md px-3 font-medium text-sm transition-colors",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
									)}
								>
									{view.label}
									<span
										className={cn(
											"rounded-md px-1.5 py-0.5 text-xs",
											isActive ? "bg-primary-foreground/15" : "bg-muted",
										)}
									>
										{counts[view.key]}
									</span>
								</Link>
							);
						})}
					</div>
				</nav>
			</section>
			{children}
		</div>
	);
}
