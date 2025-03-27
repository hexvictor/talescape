import { Logo } from "../../ui/Logo";
import { Divider } from "../../ui/Divider";
import { MainNav } from "../MainNav";
import { ThemeToggle } from "../../ui/ThemeToggle";
import { UserMenu } from "../UserMenu";
import { Suspense } from "react";
import { AvatarSkeleton } from "../../ui/Avatar";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
	return (
		<nav className="flex min-h-16 w-full items-center justify-between bg-black px-6 py-2 text-white">
			{/* Left: Logo + Divider + Menu */}
			<div className="flex items-center gap-4 font-medium text-lg">
				<Logo />
				<Divider />
				<MainNav />
			</div>

			{/* Right: Settings + Profile */}
			<div className="flex items-center gap-4">
				<ThemeToggle />
				<SignedOut>
					<Link
						href="/login"
						as="/login"
						className="rounded-sm bg-black px-4 py-2 font-semibold text-white"
					>
						Log in
					</Link>
				</SignedOut>
				<SignedIn>
					<UserMenu />
				</SignedIn>
			</div>
		</nav>
	);
}
