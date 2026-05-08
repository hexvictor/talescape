export const revalidate = 60;

import { TaleNotFound, TaleReader } from "~/features/tale-reader/components";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { getOfficialTale } from "~/server/db/data/tale-reader/queries/tales";
import { logDatabaseDiagnostics } from "~/server/db/diagnostics";
import type { OfficialTalePageProps } from "./types";

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
			await logDatabaseDiagnostics(`official tale load failed: ${taleSlug}`);
			return <TaleNotFound />;
		}
	}

	return <TaleNotFound />;
}
