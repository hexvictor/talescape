import "~/styles/globals.css";

import type { Metadata } from "next";
import { AutoHideHeader } from "~/components/layout";

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
			<AutoHideHeader />
			{children}
		</>
	);
}
