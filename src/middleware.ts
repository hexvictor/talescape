import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const clerkMiddlewareConfig = {
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

export const config = {
	matcher: [
		// Skip Next.js internals, Sentry monitoring route, and all static files, unless found in search params
		"/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
