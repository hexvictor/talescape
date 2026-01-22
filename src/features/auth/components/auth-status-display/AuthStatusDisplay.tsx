"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { publicRoutes, useIsPublicRoute } from "~/hooks/useIsPublicRoute";
import SkeletonSignInButton from "./SkeletonAuthStatusDisplay";
import AuthUserMenu from "../auth-user-menu";

const AuthStatusDisplay = () => {
  const isPublicRoute = useIsPublicRoute(publicRoutes);
  if (!isPublicRoute)
    return (
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
            <AuthUserMenu />
          </SignedIn>
        </ClerkLoaded>
      </>
    );
};

export default AuthStatusDisplay;
