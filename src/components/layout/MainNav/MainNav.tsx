"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import cn from "~/lib/utils/cn";
import { BookOpenIcon, CompassIcon } from "~/lib/utils/icons";

const navItems = [
	{
		href: "/library",
		label: "Library",
		Icon: BookOpenIcon,
	},
	{
		href: "/codex",
		label: "Codex",
		Icon: CompassIcon,
	},
];

export default function MainNav() {
	const pathname = usePathname();

	return (
		<nav aria-label="Main navigation">
			<ul className="flex items-center gap-1 rounded-md border border-border/70 bg-card/70 p-1 shadow-xs">
				{navItems.map(({ href, label, Icon }) => {
					const isActive = pathname === href || pathname.startsWith(`${href}/`);

					return (
						<li key={href}>
							<Link
								href={href}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"inline-flex h-9 items-center gap-2 rounded-md px-3 font-medium text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									isActive
										? "bg-primary text-primary-foreground shadow-xs"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
								)}
							>
								<Icon className="size-4" aria-hidden="true" />
								{label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
