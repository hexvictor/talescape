import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getLibraryTales } from "~/server/db/data/library/queries";
import { TalesGrid } from "../_shared/components/LibraryCards";

export default async function LibraryTalesPage() {
	const tales = await getLibraryTales();

	return (
		<div className="grid gap-4">
			<div className="flex flex-col gap-3 rounded-md border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-semibold text-lg">Tales</h2>
					<p className="text-muted-foreground text-sm">
						Readable stories and their structure.
					</p>
				</div>
				<Button asChild size="sm">
					<Link href="/library/tale/add">
						<Plus aria-hidden="true" />
						Add tale
					</Link>
				</Button>
			</div>
			<TalesGrid tales={tales} />
		</div>
	);
}
