import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { dark } from "@clerk/themes";

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
		<ClerkProvider appearance={{ baseTheme: dark }}>
			<html lang="en" className={`${geist.variable}`}>
				<body className="flex min-h-screen w-full flex-col">
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
