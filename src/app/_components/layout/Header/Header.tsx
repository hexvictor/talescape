"use client";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import HeaderShell from "./HeaderShell";
import { publicRoutes, useIsPublicRoute } from "~/hooks/useIsPublicRoute";

export default function Header() {
	const isUnauthorizedPage = useIsPublicRoute(publicRoutes);

	return <HeaderShell hideLoginButton={isUnauthorizedPage} />;
}
