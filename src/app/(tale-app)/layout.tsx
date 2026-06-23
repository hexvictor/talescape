import type { Metadata } from "next";
import { Header } from "~/components/layout/Header";

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
			<Header autoHide />
			{children}
		</>
	);
}
