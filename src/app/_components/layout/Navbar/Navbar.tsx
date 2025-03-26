"use client";
import { Logo } from "../../ui/Logo";
import { Divider } from "../../ui/Divider";
import { usePathname } from "next/navigation";
import { Menu, MenuItem } from "../../ui/Menu";
import { IconMoon, IconPerson } from "../../ui/Icons";
import Link from "next/link";

export default function Navbar() {
	const pathname = usePathname();
	const isLoggedIn = false;

	const items = [
		{ href: "/library", label: "Library" },
		{ href: "/codex", label: "Codex" },
	];

	return (
		<nav className="flex min-h-16 w-full items-center justify-between bg-black px-6 py-2 text-white">
			{/* Left: Logo + Divider + Menu */}
			<div className="flex items-center gap-4 font-medium text-lg">
				<Logo />
				<Divider />
				<Menu asNav>
					{items.map(({ href, label }) => (
						<MenuItem key={href} href={href} isActive={pathname === href}>
							{label}
						</MenuItem>
					))}
				</Menu>
			</div>

			{/* Right: Settings + Profile */}
			<div className="flex items-center gap-4">
				<button type="button">
					<IconMoon className="h-8 w-8 text-white transition-transform duration-200 hover:scale-110" />
				</button>
				{isLoggedIn ? (
					<button
						className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-black transition-transform duration-200 hover:scale-110"
						type="button"
					>
						<IconPerson className="w-full text-black" />
					</button>
				) : (
					<Link
						href="/login"
						className="rounded-sm bg-black px-4 py-2 font-semibold text-white"
					>
						Log in
					</Link>
				)}
				{/* <Link
					href="/login"
					className="rounded-sm bg-black px-4 py-2 font-semibold text-white"
				></Link> */}
			</div>
		</nav>
	);
}
