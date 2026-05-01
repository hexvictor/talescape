import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/app/api/uploadthing/core";
import { clerkAppearance } from "~/features/auth/utils/clerkAppearance";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";

const isDev = process.env.NODE_ENV === "development";

export const metadata: Metadata = {
	title: "Talescape",
	description: "The community-driven hub of interactive tales",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
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
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider appearance={clerkAppearance} afterSignOutUrl="/">
			<html lang="en" className={geist.variable} suppressHydrationWarning>
				<head>
					<script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Static pre-paint theme sync prevents a light-to-dark flash before React hydrates.
						dangerouslySetInnerHTML={{
							__html: themeScript,
						}}
					/>
					{isDev && (
						<>
							<Script
								src="//unpkg.com/react-grab/dist/index.global.js"
								crossOrigin="anonymous"
								strategy="beforeInteractive"
							/>
							<Script src="https://unpkg.com/react-scan/dist/auto.global.js" />
						</>
					)}
				</head>
				<body className="relative flex flex-col">
					<NextSSRPlugin
						/**
						 * The `extractRouterConfig` will extract **only** the route configs
						 * from the router to prevent additional information from being
						 * leaked to the client. The data passed to the client is the same
						 * as if you were to fetch `/api/uploadthing` directly.
						 */
						routerConfig={extractRouterConfig(ourFileRouter)}
					/>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
