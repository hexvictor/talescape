import type { Metadata } from "next";

import type { PropsWithChildren } from "react";
import Footer from "~/app/_shared/components/layout/Footer";
import { Header } from "~/app/_shared/components/layout/Header";
import { PageShell } from "~/components/layout/page-shell";

export const metadata: Metadata = {
	title: "Home | Talescape",
	description: "The community-driven hub of interactive tales",
};

export type SiteLayoutProps = Readonly<PropsWithChildren>;

export default function SiteLayout({ children }: SiteLayoutProps) {
	return (
		<PageShell
			decorations="site-background"
			className="flex min-h-dvh flex-col"
		>
			<Header />
			<main
				className="flex flex-1 flex-col"
				data-reader-component="SiteLayout"
				data-reader-role="page-content"
			>
				{children}
			</main>
			<Footer />
		</PageShell>
	);
}
