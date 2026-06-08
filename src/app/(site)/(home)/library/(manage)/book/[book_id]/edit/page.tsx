import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import { LibraryFormPageShell } from "../../../../_shared/components/LibraryFormPageShell";
import BookFormPanel from "../../../../_shared/forms/book/BookFormPanel";

export default async function EditBookPage() {
	const { user } = await getSignedInLibraryUser();

	return (
		<LibraryFormPageShell>
			<BookFormPanel
				mode="edit"
				canManageOfficial={user?.role === "administrator"}
			/>
		</LibraryFormPageShell>
	);
}
