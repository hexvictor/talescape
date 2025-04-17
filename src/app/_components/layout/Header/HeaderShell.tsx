// HeaderShell.tsx
import { Logo } from "../../ui/Logo";
import { Divider } from "../../ui/Divider";
import { MainNav } from "../MainNav";
import { ThemeToggle } from "../../ui/ThemeToggle";
import { UserMenu } from "../UserMenu";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { SkeletonSignInButton } from "../../ui/SkeletonSignInButton";

type HeaderShellProps = HTMLAttributes<HTMLElement> & {
	hideLoginButton?: boolean;
	leftProps?: HTMLAttributes<HTMLDivElement>;
	rightProps?: HTMLAttributes<HTMLDivElement>;
	children?: ReactNode;
};

export default function HeaderShell({
	hideLoginButton = false,
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
				{!hideLoginButton && (
					<>
						<ClerkLoading>
							<SkeletonSignInButton />
						</ClerkLoading>
						<ClerkLoaded>
							<SignedOut key="signed-out">
								<Link
									href="/sign-in"
									className="rounded-sm px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white"
								>
									Sign in
								</Link>
							</SignedOut>
							<SignedIn key="signed-in">
								<UserMenu />
							</SignedIn>
						</ClerkLoaded>
					</>
				)}
			</div>

			{children}
		</nav>
	);
}
