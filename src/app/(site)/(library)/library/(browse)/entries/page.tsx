import { getLibraryEntries } from "~/server/db/data/library/queries";
import { EntriesPanel } from "../../_shared/components/LibraryNodePanels";

export default async function LibraryEntriesPage() {
	const entries = await getLibraryEntries();

	return <EntriesPanel entries={entries} />;
}
