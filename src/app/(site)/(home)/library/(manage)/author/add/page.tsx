import { Suspense } from "react";
import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import { DetailPageSkeleton } from "../../../../_components/skeletons";
import AuthorFormPanel from "../../../_shared/forms/author";

export default async function AddAuthorPage() {
	const { user } = await getSignedInLibraryUser();

	return (
		<Suspense fallback={<DetailPageSkeleton />}>
			<AuthorFormPanel
				mode="create"
				canManageOfficial={user?.role === "administrator"}
			/>
		</Suspense>
	);
}
