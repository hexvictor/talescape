export const revalidate = 60;

import { TaleNotFound } from "~/features/tale-reader/components";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { getOfficialTale } from "~/server/db/data/tale-reader/queries/tales";
import type { OfficialTalePageProps } from "./types";

export default async function OfficialTalePage({
	params,
}: OfficialTalePageProps) {
	const { taleSlug } = await params;

	if (taleSlug) {
		try {
			// const { tale, progress } = await getOfficialTale(taleSlug);
			const taleData = await getOfficialTale(taleSlug);

			// if (!tale) {
			// 	return <TaleNotFound />;
			// }

			return null;
			// return <TaleReader tale={tale} progress={progress} />;
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
