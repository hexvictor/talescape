import { Suspense } from "react";
import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import { DetailPageSkeleton } from "../../../../_components/skeletons";
import BookFormPanel from "../../../_shared/forms/book";

export default async function AddBookPage() {
	const { user } = await getSignedInLibraryUser();

	return (
		<Suspense fallback={<DetailPageSkeleton />}>
			<BookFormPanel
				mode="create"
				canManageOfficial={user?.role === "administrator"}
			/>
		</Suspense>
	);
}
