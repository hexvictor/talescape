"use client";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import HeaderShell from "./HeaderShell";

export default function Header() {
	const pathname = usePathname();
	const segments = useSelectedLayoutSegments();

	// List of full-page unauthorized routes
	const unauthorizedPaths = ["/sign-in", "/sign-up", "/forgot-password"];
	// Checks if the current page is authorized in order to hide the Login button
	const isUnauthorizedPage =
		unauthorizedPaths.includes(pathname) &&
		segments.some((segment) => unauthorizedPaths.includes(`/${segment}`));

	return <HeaderShell hideLoginButton={isUnauthorizedPage} />;
}
