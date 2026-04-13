import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

export const clerkMiddlewareConfig = {
	signInUrl: "/sign-in",
	signUpUrl: "/sign-up",
};

const isProtectedRoute = createRouteMatcher([
	"/library/book/add",
	"/library/book/:bookId/edit",
	"/library/tale/add",
	"/library/tale/:taleId/edit",
	"/library/fragment/add",
	"/library/fragment/:fragmentId/edit",
]);

export default clerkMiddleware(async (auth, req) => {
	if (isProtectedRoute(req)) {
		await auth.protect();
	}
}, clerkMiddlewareConfig);

const staticFilePattern =
	"[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)";

export const config = {
	matcher: [
		// Skip Next.js internals, Sentry monitoring route, and all static files, unless found in search params

		`/((?!_next|monitoring|${staticFilePattern}).*)`,
		// Always run for API routes

		"/(api|trpc)(.*)",
	],
};
