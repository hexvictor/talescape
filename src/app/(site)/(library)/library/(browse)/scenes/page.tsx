import { getLibraryBlocks } from "~/server/db/data/library/queries";
import { BlocksPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryBlocksPage() {
	const scenes = await getLibraryBlocks();

	return <BlocksPanel scenes={scenes} />;
}
