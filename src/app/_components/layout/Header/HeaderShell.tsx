// HeaderShell.tsx
import { Logo } from "../../ui/Logo";
import { Divider } from "../../ui/Divider";
import { MainNav } from "../MainNav";
import { ThemeToggle } from "../../ui/ThemeToggle";
import { UserMenu } from "../UserMenu";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

type HeaderShellProps = HTMLAttributes<HTMLElement> & {
	leftProps?: HTMLAttributes<HTMLDivElement>;
	rightProps?: HTMLAttributes<HTMLDivElement>;
	children?: ReactNode;
};

export default function HeaderShell({
	leftProps,
	rightProps,
	children,
	className = "",
	...mainProps // ✅ this will carry onClick, onKeyDown, etc.
}: HeaderShellProps) {
	return (
		<nav
			className={`flex min-h-16 w-full items-center justify-between bg-black px-6 py-2 text-white ${className}`}
			{...mainProps} // ✅ onClick, onKeyDown, etc. now apply to <nav>
		>
			<div
				className="flex items-center gap-4 font-medium text-lg"
				{...leftProps}
			>
				<Logo />
				<Divider />
				<MainNav />
			</div>

			<div className="flex items-center gap-4" {...rightProps}>
				<ThemeToggle />
				<SignedOut>
					<Link
						href="/sign-in"
						className="rounded-sm bg-black px-4 py-2 font-semibold text-white"
					>
						Log in
					</Link>
				</SignedOut>
				<SignedIn>
					<UserMenu />
				</SignedIn>
			</div>

			{children}
		</nav>
	);
}
