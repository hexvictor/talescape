import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Navbar } from "../_components/layout/Navbar";
import { Page } from "../_components/layout/Page";
import { Footer } from "../_components/layout/Footer";

export const metadata: Metadata = {
	title: "Talescape",
	description: "The community-driven hub of interactive tales",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body className="flex min-h-screen w-full flex-col">
				<TRPCReactProvider>
					<Navbar />
					<Page>{children}</Page>
					<Footer />
				</TRPCReactProvider>
			</body>
		</html>
	);
}
