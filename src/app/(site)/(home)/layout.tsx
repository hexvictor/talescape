import "~/styles/globals.css";

import type { Metadata } from "next";

import type { PropsWithChildren, ReactNode } from "react";
import Footer from "~/components/layout/footer";
import { Header } from "~/components/layout";

export const metadata: Metadata = {
	title: "Home | Talescape",
	description: "The community-driven hub of interactive tales",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export type HomeLayoutProps = Readonly<
	PropsWithChildren<{
		modals: ReactNode;
	}>
>;

export default function HomeLayout({ children, modals }: HomeLayoutProps) {
	return (
		<>
			<Header />
			<main className="flex-1 p-4">{children}</main>
			<Footer />
			{modals}
			<div id="modal-root" />
		</>
	);
}
