import { getLibraryFrames } from "~/server/db/data/library/queries";
import { FramesPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryFramesPage() {
	const frames = await getLibraryFrames();

	return <FramesPanel frames={frames} />;
}
