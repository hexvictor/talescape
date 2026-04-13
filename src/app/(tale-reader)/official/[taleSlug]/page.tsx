export const revalidate = 60;

import { getOfficialTale } from "~/server/db/queries/taleReader/tales";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { TaleNotFound, TaleReader } from "~/features/tale-reader/components";
import type { OfficialTalePageProps } from "~/features/tale-reader/types/talePage";

export default async function OfficialTalePage({
	params,
}: OfficialTalePageProps) {
	const { taleSlug } = await params;

	if (taleSlug) {
		try {
			const { tale, progress } = await getOfficialTale(taleSlug);

			if (!tale) {
				return <TaleNotFound />;
			}

			return <TaleReader tale={tale} progress={progress} />;
		} catch (error) {
			if (error instanceof TaleAccessError && error.status === 404) {
				return <TaleNotFound />;
			}

			console.error("Unexpected error loading official tale:", error);
			return <TaleNotFound />;
		}
	}

	return <TaleNotFound />;
}
