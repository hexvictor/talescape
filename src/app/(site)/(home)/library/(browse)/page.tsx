import { getLibraryTales } from "~/server/db/data/library/queries";
import { LibraryBrowsePage } from "../_shared/components/LibraryBrowsePage";
import { TalesGrid } from "../_shared/components/LibraryCards";

export default async function LibraryTalesPage() {
	const tales = await getLibraryTales();

	return (
		<LibraryBrowsePage
			actionHref="/library/tale/add"
			actionLabel="Add tale"
			description="Readable stories and their structure."
			title="Tales"
		>
			<TalesGrid tales={tales} />
		</LibraryBrowsePage>
	);
}
