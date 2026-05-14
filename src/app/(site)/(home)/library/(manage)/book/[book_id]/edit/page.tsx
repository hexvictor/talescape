import { Suspense } from "react";
import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import { DetailPageSkeleton } from "../../../../../_components/skeletons";
import BookFormPanel from "../../../../_shared/forms/book/BookFormPanel";

export default async function EditBookPage() {
	const { user } = await getSignedInLibraryUser();

	return (
		<Suspense fallback={<DetailPageSkeleton />}>
			<BookFormPanel
				mode="edit"
				canManageOfficial={user?.role === "administrator"}
			/>
		</Suspense>
	);
}
