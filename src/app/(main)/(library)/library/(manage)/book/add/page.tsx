import { getSignedInLibraryUser } from "~/server/db/data/library/queries";
import { LibraryFormPageShell } from "../../../_shared/components/LibraryFormPageShell";
import BookFormPanel from "../../../_shared/forms/book";

export default async function AddBookPage() {
	const { user } = await getSignedInLibraryUser();

	return (
		<LibraryFormPageShell>
			<BookFormPanel
				mode="create"
				canManageOfficial={user?.role === "administrator"}
			/>
		</LibraryFormPageShell>
	);
}
