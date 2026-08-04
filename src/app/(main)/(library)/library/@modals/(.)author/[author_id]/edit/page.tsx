import RouteDialog from "~/components/layout/RouteDialog";
import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import AuthorFormPanel from "../../../../_shared/forms/author";

export default async function EditAuthorSheet() {
	const { user } = await getSignedInLibraryUser();

	return (
		<RouteDialog
			title="Edit author"
			description="Update author identity, biography, and connected library notes."
			contentClassName="sm:max-w-2xl"
		>
			<AuthorFormPanel
				mode="edit"
				canManageOfficial={user?.role === "administrator"}
			/>
		</RouteDialog>
	);
}
