import { getLibraryFragments } from "~/server/db/data/library/queries";
import { FragmentsPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryFragmentsPage() {
	const elements = await getLibraryFragments();

	return <FragmentsPanel elements={elements} />;
}
