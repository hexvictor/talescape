"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { publicRoutes, useIsPublicRoute } from "~/hooks/useIsPublicRoute";
import UserMenu from "../UserMenu";
import SkeletonAuthStatus from "./SkeletonAuthStatus";

const AuthStatus = () => {
	const isPublicRoute = useIsPublicRoute(publicRoutes);
	if (!isPublicRoute)
		return (
			<div className="flex min-h-9 items-center justify-end">
				<ClerkLoading key="clerk-loading">
					<SkeletonAuthStatus />
				</ClerkLoading>
				<ClerkLoaded key="clerk-loaded">
					<SignedOut key="signed-out">
						<Link
							href="/sign-in"
							className="inline-flex h-9 items-center rounded-md bg-primary px-4 font-semibold text-primary-foreground text-sm shadow-xs transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
						>
							Sign in
						</Link>
					</SignedOut>
					<SignedIn key="signed-in">
						<UserMenu />
					</SignedIn>
				</ClerkLoaded>
			</div>
		);
};

export default AuthStatus;
