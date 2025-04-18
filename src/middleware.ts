// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

export const clerkMiddlewareConfig = {
	signInUrl: "/sign-in", // 👈 Custom sign-in route
	signUpUrl: "/sign-up", // Optional
};

const isProtectedRoute = createRouteMatcher([
	"/library/book/add",
	"/library/book/:bookId/edit",
	"/library/story/add",
	"/library/story/:storyId/edit",
	"/library/story-block/add",
	"/library/story-block/:storyBlockId/edit",
]);

export default clerkMiddleware(async (auth, req) => {
	if (isProtectedRoute(req)) await auth.protect();
}, clerkMiddlewareConfig);

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
