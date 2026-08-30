import type { Metadata } from "next";

import type { PropsWithChildren } from "react";
import Footer from "~/app/_shared/components/layout/Footer";
import { Header } from "~/app/_shared/components/layout/Header";

export const metadata: Metadata = {
	title: "Home | Talescape",
	description: "The community-driven hub of interactive tales",
};

export type SiteLayoutProps = Readonly<PropsWithChildren>;

export default function SiteLayout({ children }: SiteLayoutProps) {
	return (
		<div className="site-paper flex min-h-dvh flex-col">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
