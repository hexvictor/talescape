import { notFound } from "next/navigation";
import { getLibraryTaleDetail } from "~/server/db/data/library/queries";
import { TaleDetailContent } from "../../../_shared/components/TaleDetailContent";
import { normalizeTaleDetailView } from "../../../_shared/components/taleDetailViews";

type TaleOverviewProps = {
	params: Promise<{
		tale_id: string;
	}>;
	searchParams?: Promise<{
		view?: string;
	}>;
};

export default async function TaleOverview({
	params,
	searchParams,
}: TaleOverviewProps) {
	const [{ tale_id }, query] = await Promise.all([params, searchParams]);
	const taleId = Number(tale_id);

	if (!Number.isInteger(taleId)) {
		notFound();
	}

	const detail = await getLibraryTaleDetail(taleId);

	if (!detail) {
		notFound();
	}

	return (
		<TaleDetailContent
			detail={detail}
			activeView={normalizeTaleDetailView(query?.view)}
		/>
	);
}
