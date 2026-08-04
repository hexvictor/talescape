import { getLibraryFragments } from "~/server/db/data/library/queries";
import { FragmentsPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryFragmentsPage() {
	const fragments = await getLibraryFragments();

	return <FragmentsPanel fragments={fragments} />;
}
