import type { PropsWithChildren } from "react";

export type LibraryLayoutProps = Readonly<
	PropsWithChildren<{
		children: React.ReactNode;
		modals: React.ReactNode;
	}>
>;

export default function LibraryLayout({
	children,
	modals,
}: LibraryLayoutProps) {
	return (
		<>
			{modals}
			{children}
		</>
	);
}
