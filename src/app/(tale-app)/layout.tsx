import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Tale | Talescape",
	description: "Read, edit, and preview interactive tales on Talescape.",
};

export default function TaleAppLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <>{children}</>;
}
