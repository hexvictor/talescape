import type { Metadata } from "next";
export const metadata: Metadata = {
	title: "Tale Reader | Talescape",
	description: "Read an interactive tale on Talescape.",
};

export default function TaleReaderLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <>{children}</>;
}
