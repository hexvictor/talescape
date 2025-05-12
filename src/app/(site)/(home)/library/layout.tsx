import type { PropsWithChildren, ReactNode } from "react";

export type LibraryLayoutProps = Readonly<
	PropsWithChildren<{
		children: React.ReactNode;
		forms: React.ReactNode;
	}>
>;

export default function LibraryLayout({ children, forms }: LibraryLayoutProps) {
	return (
		<>
			{forms}
			{children}
		</>
	);
}
