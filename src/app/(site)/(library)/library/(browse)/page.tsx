import {
	getLibraryAuthors,
	getLibraryBooks,
	getLibraryTales,
} from "~/server/db/data/library/queries";
import { LibraryLanding } from "../_shared/components/LibraryLanding";

export default async function LibraryTalesPage() {
	const [tales, books, authors] = await Promise.all([
		getLibraryTales(),
		getLibraryBooks(),
		getLibraryAuthors(),
	]);

	return <LibraryLanding authors={authors} books={books} tales={tales} />;
}
