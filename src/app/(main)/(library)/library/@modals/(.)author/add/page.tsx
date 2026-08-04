import RouteDialog from "~/components/layout/RouteDialog";
import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import AuthorFormPanel from "../../../_shared/forms/author";

export default async function AddAuthorSheet() {
	const { user } = await getSignedInLibraryUser();

	return (
		<RouteDialog
			title="Add author"
			description="Create an author profile for books, tales, and library references."
			contentClassName="sm:max-w-2xl"
		>
			<AuthorFormPanel
				mode="create"
				canManageOfficial={user?.role === "administrator"}
			/>
		</RouteDialog>
	);
}
