import type { PropsWithChildren } from "react";
import {
	getLibraryCounts,
	getSignedInLibraryUser,
} from "~/server/db/data/library/queries";
import { LibraryChrome } from "./_shared/components/LibraryChrome";

export type LibraryLayoutProps = Readonly<
	PropsWithChildren<{
		children: React.ReactNode;
		modals: React.ReactNode;
	}>
>;

export default async function LibraryLayout({
	children,
	modals,
}: LibraryLayoutProps) {
	const [counts, { user }] = await Promise.all([
		getLibraryCounts(),
		getSignedInLibraryUser(),
	]);

	return (
		<>
			{modals}
			<LibraryChrome
				counts={counts}
				currentUser={
					user
						? {
								username: user.username,
								fullName: user.fullName,
							}
						: null
				}
			>
				{children}
			</LibraryChrome>
		</>
	);
}
