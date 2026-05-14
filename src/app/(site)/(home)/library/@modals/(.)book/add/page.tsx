import RouteDialog from "~/components/layout/RouteDialog";
import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import BookFormPanel from "../../../_shared/forms/book";

export default async function AddBookSheet() {
	const { user } = await getSignedInLibraryUser();

	return (
		<RouteDialog
			title="Add new book"
			description="Create a shelf entry, connect it to a codex, and keep the story world tidy."
			contentClassName="sm:max-w-2xl"
		>
			<BookFormPanel
				mode="create"
				canManageOfficial={user?.role === "administrator"}
			/>
		</RouteDialog>
	);
}
