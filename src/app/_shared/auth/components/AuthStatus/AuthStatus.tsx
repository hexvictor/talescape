"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	publicRoutes,
	useIsPublicRoute,
} from "~/app/_shared/hooks/useIsPublicRoute";
import { Button } from "~/components/ui/button";
import UserMenu from "../UserMenu";
import SkeletonAuthStatus from "./SkeletonAuthStatus";

/**
 * Renders the current authentication control without causing Clerk hydration drift.
 *
 * @returns Sign-in action, user menu, loading placeholder, or null on public auth pages.
 *
 * @example
 * <AuthStatus />
 */
const AuthStatus = () => {
	const isPublicRoute = useIsPublicRoute(publicRoutes);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (isPublicRoute) return null;

	return (
		<div className="flex min-h-9 items-center justify-end">
			{!mounted ? (
				<SkeletonAuthStatus />
			) : (
				<>
					<ClerkLoading key="clerk-loading">
						<SkeletonAuthStatus />
					</ClerkLoading>
					<ClerkLoaded key="clerk-loaded">
						<SignedOut key="signed-out">
							<Button asChild>
								<Link href="/sign-in">Sign in</Link>
							</Button>
						</SignedOut>
						<SignedIn key="signed-in">
							<UserMenu />
						</SignedIn>
					</ClerkLoaded>
				</>
			)}
		</div>
	);
};

export default AuthStatus;
