import { getLibraryPaths } from "~/server/db/data/library/queries";
import { PathsPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryPathsPage() {
	const paths = await getLibraryPaths();

	return <PathsPanel paths={paths} />;
}
