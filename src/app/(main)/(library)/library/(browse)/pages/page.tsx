import { getLibraryPages } from "~/server/db/data/library/queries";
import { PagesPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryPagesPage() {
	const pages = await getLibraryPages();

	return <PagesPanel pages={pages} />;
}
