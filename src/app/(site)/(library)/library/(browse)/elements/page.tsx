import { getLibraryElements } from "~/server/db/data/library/queries";
import { ElementsPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryFragmentsPage() {
	const elements = await getLibraryElements();

	return <ElementsPanel elements={elements} />;
}
