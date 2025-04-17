import { usePathname, useSelectedLayoutSegments } from "next/navigation";

export const publicRoutes = ["/sign-in", "/sign-up", "/forgot-password"];

export function useIsPublicRoute(unauthorizedPaths: string[]): boolean {
	const pathname = usePathname();
	const segments = useSelectedLayoutSegments();

	// Checks if the current page is authorized in order to hide the Login button
	return Boolean(
		unauthorizedPaths.includes(pathname) &&
			segments.some((segment) => unauthorizedPaths.includes(`/${segment}`)),
	);
}
