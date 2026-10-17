import type { LibraryTaleList } from "~/server/db/data/library/queries";
import { LibraryTalesExplorer } from "./LibraryTalesExplorer";

export function LibraryLanding({
	tales,
}: {
	tales: LibraryTaleList;
}) {
	return (
		<div data-reader-component="LibraryLanding" data-reader-role="tale-browser">
			<LibraryTalesExplorer tales={tales} />
		</div>
	);
}
