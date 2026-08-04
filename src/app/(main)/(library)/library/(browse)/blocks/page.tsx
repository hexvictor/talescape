import { getLibraryBlocks } from "~/server/db/data/library/queries";
import { BlocksPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryBlocksPage() {
	const blocks = await getLibraryBlocks();

	return <BlocksPanel blocks={blocks} />;
}
