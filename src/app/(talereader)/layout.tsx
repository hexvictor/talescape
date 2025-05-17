import "~/styles/globals.css";

import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Header } from "../_components/layout/Header";
import { HoverHeader } from "../_components/layout/Header";

export const metadata: Metadata = {
	title: "Taleviewer | Talescape",
	description: "The community-driven hub of interactive tales",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function TaleviewerLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<HoverHeader />
			{/* TaleViewerWrapper */}
			{children}
			{/* TaleViewerWrapper */}
		</>
	);
}
