import { Suspense } from "react";
import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import { DetailPageSkeleton } from "../../../../../_components/skeletons";
import AuthorFormPanel from "../../../../_shared/forms/author";

export default async function EditAuthorPage() {
	const { user } = await getSignedInLibraryUser();

	return (
		<Suspense fallback={<DetailPageSkeleton />}>
			<AuthorFormPanel
				mode="edit"
				canManageOfficial={user?.role === "administrator"}
			/>
		</Suspense>
	);
}
