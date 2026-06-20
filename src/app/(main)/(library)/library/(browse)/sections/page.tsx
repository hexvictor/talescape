import { getLibrarySections } from "~/server/db/data/library/queries";
import { SectionsPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibrarySectionsPage() {
	const sections = await getLibrarySections();

	return <SectionsPanel sections={sections} />;
}
