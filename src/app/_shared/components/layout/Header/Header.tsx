"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { AuthStatus } from "~/app/_shared/auth/components";
import { TalescapeLogo } from "~/app/_shared/components/brand/TalescapeLogo";
import ThemeToggle from "~/app/_shared/components/layout/ThemeToggle";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import MainNav from "../MainNav";

type HeaderProps = HTMLAttributes<HTMLElement> & {
	leftProps?: HTMLAttributes<HTMLDivElement>;
	rightProps?: HTMLAttributes<HTMLDivElement>;
	children?: ReactNode;
};

/** Renders the responsive Talescape site header. */
export default function Header({
	leftProps,
	rightProps,
	children,
	className = "",
	...mainProps
}: HeaderProps): React.JSX.Element {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header
			data-reader-component="Header"
			data-reader-role="site-header"
			className={cn(
				"sticky top-0 z-1000 w-full border-foreground border-b-2 bg-[var(--comic-ink)] text-white shadow-[0_3px_0_var(--comic-blue)]",
				className,
			)}
			{...mainProps}
		>
			<div className="mx-auto flex min-h-[4.5rem] w-full max-w-[var(--ts-content-max)] items-center justify-between gap-3 px-[var(--ts-page-gutter)] py-2">
				<div
					className="flex min-w-0 items-center gap-3 sm:gap-8"
					{...leftProps}
				>
					<Button
						aria-expanded={mobileOpen}
						aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
						className="md:hidden"
						motion="flat"
						size="icon"
						variant="ink"
						onPress={() => setMobileOpen((open) => !open)}
					>
						{mobileOpen ? <X size={19} /> : <Menu size={19} />}
					</Button>
					<TalescapeLogo
						priority
						markClassName="hidden h-14 sm:block"
						tone="dark-surface"
						wordmarkClassName="w-24 sm:w-32"
					/>
					<div className="hidden md:block">
						<MainNav />
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-2" {...rightProps}>
					<Button type="button" size="icon" asChild motion="flat" variant="ink">
						<Link
							href="/library"
							aria-label="Search tales"
							className="grid place-items-center "
						>
							<Search size={18} />
						</Link>
					</Button>
					<ThemeToggle variant="ink" />
					<AuthStatus buttonVariant="ink" />
				</div>

				{children}
			</div>
			{mobileOpen ? (
				<div
					data-reader-component="Header"
					data-reader-role="mobile-navigation-panel"
					className="absolute inset-x-0 top-full border-foreground border-b-2 bg-[var(--comic-ink)] p-4 text-white shadow-[0_6px_0_var(--comic-blue)] md:hidden"
				>
					<MainNav mobile />
				</div>
			) : null}
		</header>
	);
}
