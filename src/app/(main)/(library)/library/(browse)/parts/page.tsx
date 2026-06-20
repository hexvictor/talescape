import { getLibraryParts } from "~/server/db/data/library/queries";
import { PartsPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryPartsPage() {
	const parts = await getLibraryParts();

	return <PartsPanel parts={parts} />;
}
