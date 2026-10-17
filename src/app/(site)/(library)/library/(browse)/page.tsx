import { getLibraryTales } from "~/server/db/data/library/queries";
import { LibraryLanding } from "../_shared/components/LibraryLanding";

export default async function LibraryTalesPage() {
	const tales = await getLibraryTales();

	return <LibraryLanding tales={tales} />;
}
