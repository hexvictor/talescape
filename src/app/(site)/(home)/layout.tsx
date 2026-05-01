import type { Metadata } from "next";

import type { PropsWithChildren } from "react";
import { Header } from "~/components/layout";
import Footer from "~/components/layout/Footer";

export const metadata: Metadata = {
	title: "Home | Talescape",
	description: "The community-driven hub of interactive tales",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export type HomeLayoutProps = Readonly<PropsWithChildren>;

export default function HomeLayout({ children }: HomeLayoutProps) {
	return (
		<>
			<Header />
			<main className="flex-1 px-3 py-4 sm:px-5">{children}</main>
			<Footer />
			<div id="modal-root" />
		</>
	);
}
