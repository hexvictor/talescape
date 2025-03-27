import { Header } from "@/app/_components/layout/Header";
import { Page } from "@/app/_components/layout/Page";
import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import type { PropsWithChildren, ReactNode } from "react";

export const metadata: Metadata = {
	title: "Login | Talescape",
	description: "The community-driven hub of interactive tales",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function LoginLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<Header />
			<Page>{children}</Page>
		</>
	);
}
