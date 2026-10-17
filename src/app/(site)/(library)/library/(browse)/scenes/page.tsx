import { getLibraryScenes } from "~/server/db/data/library/queries";
import { ScenesPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryBlocksPage() {
	const scenes = await getLibraryScenes();

	return <ScenesPanel scenes={scenes} />;
}
