import { getLibraryBranches } from "~/server/db/data/library/queries";
import { BranchesPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryBranchesPage() {
	const branches = await getLibraryBranches();

	return <BranchesPanel branches={branches} />;
}
