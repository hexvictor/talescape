import { getLibraryTales } from "~/server/db/data/library/queries";
import { LibraryBrowsePage } from "../_shared/components/LibraryBrowsePage";
import { LibraryTalesExplorer } from "../_shared/components/LibraryTalesExplorer";

export default async function LibraryTalesPage() {
	const tales = await getLibraryTales();

	return (
		<LibraryBrowsePage
			actionHref="/library/tale/add"
			actionLabel="Add tale"
			description="Readable stories and their structure."
			title="Tales"
		>
			<LibraryTalesExplorer tales={tales} />
		</LibraryBrowsePage>
	);
}
