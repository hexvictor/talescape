"use client";

import { House, PenTool } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { BookOpenIcon, CompassIcon } from "~/components/ui/icons";
import cn from "~/lib/utils/cn";

const navItems = [
	{
		href: "/",
		label: "Discover",
		Icon: House,
	},
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
	{
		href: "/library/tale/add",
		label: "Create",
		Icon: PenTool,
	},
];

export default function MainNav({ mobile = false }: { mobile?: boolean }) {
	const pathname = usePathname();

	return (
		<nav aria-label="Main navigation">
			<ul
				className={cn(
					"flex items-center gap-1",
					mobile ? "flex-col items-stretch" : "flex-row",
				)}
			>
				{navItems.map(({ href, label, Icon }) => {
					const isActive =
						href === "/"
							? pathname === href
							: pathname === href || pathname.startsWith(`${href}/`);

					return (
						<li key={href}>
							<Button
								asChild
								className={cn(mobile && "w-full min-w-44")}
								motion={isActive ? "lift-on-hover" : "flat"}
								shape={isActive ? "slant-both" : "rectangle"}
								variant={isActive ? "navActive" : "nav"}
							>
								<Link href={href} aria-current={isActive ? "page" : undefined}>
									<Icon className="size-4" aria-hidden="true" />
									{label}
								</Link>
							</Button>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
