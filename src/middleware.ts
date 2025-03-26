import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of protected routes
const PROTECTED_PATHS = ["/codex", "/view"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

	const userToken = request.cookies.get("auth_token")?.value; // or session cookie
	const isLoggedIn = Boolean(userToken);

	if (isProtected && !isLoggedIn) {
		console.log(isProtected, isLoggedIn);
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/codex/:path*", "/view/:path*"],
};
