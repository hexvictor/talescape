import type { Metadata } from "next";
import AutoHideTopBar from "~/components/layout/AutoHideTopBar/AutoHideTopBar";
import { Header } from "~/components/layout/Header";

export const metadata: Metadata = {
	title: "Taleviewer | Talescape",
	description: "The community-driven hub of interactive tales",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function TaleReaderLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<AutoHideTopBar clerkMenu pinOnBackgroundClick>
				<Header />
			</AutoHideTopBar>
			{children}
		</>
	);
}
