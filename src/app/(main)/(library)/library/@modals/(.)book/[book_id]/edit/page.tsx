import RouteDialog from "~/components/layout/RouteDialog";
import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import BookFormPanel from "../../../../_shared/forms/book";

export default async function EditBookSheet() {
	const { user } = await getSignedInLibraryUser();

	return (
		<RouteDialog
			title="Edit book"
			description="Tune the book metadata, status, cover, and connected world notes."
			contentClassName="sm:max-w-2xl"
		>
			<BookFormPanel
				mode="edit"
				canManageOfficial={user?.role === "administrator"}
			/>
		</RouteDialog>
	);
}
