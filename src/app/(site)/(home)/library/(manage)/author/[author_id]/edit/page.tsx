import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import { LibraryFormPageShell } from "../../../../_shared/components/LibraryFormPageShell";
import AuthorFormPanel from "../../../../_shared/forms/author";

export default async function EditAuthorPage() {
	const { user } = await getSignedInLibraryUser();

	return (
		<LibraryFormPageShell>
			<AuthorFormPanel
				mode="edit"
				canManageOfficial={user?.role === "administrator"}
			/>
		</LibraryFormPageShell>
	);
}
