import "~/styles/globals.css";

import type { Metadata } from "next";

import type { PropsWithChildren, ReactNode } from "react";
import Header from "~/app/_components/layout/Header";
import Footer from "~/app/_components/layout/Footer";
import Page from "~/app/_components/layout/Page";

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
			<Page>{children}</Page>
			<Footer />
			{modals}
			<div id="modal-root" />
		</>
	);
}
