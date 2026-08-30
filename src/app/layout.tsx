import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Bangers, Geist } from "next/font/google";
import { extractRouterConfig } from "uploadthing/server";
import { TaleInteractionMotion } from "~/app/(tale-app)/_shared/components/TaleInteractionMotion";
import { clerkAppearance } from "~/app/_shared/auth/utils/clerkAppearance";
import { TaleRootStoreProvider } from "~/app/_shared/contexts/TaleRootStoreContext";
import { ourFileRouter } from "~/app/api/uploadthing/core";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Talescape",
	description: "Stories that break the frame.",
	icons: {
		apple: [
			{
				sizes: "1024x1024",
				type: "image/png",
				url: "/talescape-favicon.png",
			},
		],
		icon: [
			{ sizes: "any", url: "/talescape-favicon.ico" },
			{
				sizes: "1024x1024",
				type: "image/png",
				url: "/talescape-favicon.png",
			},
		],
		shortcut: "/talescape-favicon.ico",
	},
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const bangers = Bangers({
	subsets: ["latin"],
	variable: "--font-bangers",
	weight: "400",
});

const themeScript = `
try {
  var theme = localStorage.getItem("talescape-theme");
  if (theme === "dark") document.documentElement.classList.add("dark");
  if (theme === "light") document.documentElement.classList.remove("dark");
} catch (_) {}
`;

export default function RootLayout({
	children,
	auth,
}: Readonly<{ auth: React.ReactNode; children: React.ReactNode }>) {
	return (
		<ClerkProvider appearance={clerkAppearance} afterSignOutUrl="/">
			<html
				lang="en"
				className={`${geist.variable} ${bangers.variable}`}
				suppressHydrationWarning
			>
				<head>
					<script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Static pre-paint theme sync prevents a light-to-dark flash before React hydrates.
						dangerouslySetInnerHTML={{
							__html: themeScript,
						}}
					/>
				</head>
				<body className="relative flex flex-col" suppressHydrationWarning>
					<TaleRootStoreProvider>
						<NextSSRPlugin
							/**
							 * The `extractRouterConfig` will extract **only** the route configs
							 * from the router to prevent additional information from being
							 * leaked to the client. The data passed to the client is the same
							 * as if you were to fetch `/api/uploadthing` directly.
							 */
							routerConfig={extractRouterConfig(ourFileRouter)}
						/>
						<TRPCReactProvider>
							<TaleInteractionMotion>
								{children}
								<div id="modal-root" />
								{auth}
							</TaleInteractionMotion>
						</TRPCReactProvider>
					</TaleRootStoreProvider>
					<Analytics />
				</body>
			</html>
		</ClerkProvider>
	);
}
