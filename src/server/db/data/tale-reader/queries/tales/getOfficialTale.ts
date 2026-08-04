import { db } from "~/server/db";
import { TaleAccessError } from "~/server/db/data/tale-reader/errors/taleAccess";
import type { TaleData } from "~/server/db/data/tale-reader/types/tales";
import { getSignedInUserId } from "../auth/getSignedInUserId";
import { getTale } from "./getTale";
import { getTaleDataWithProgress } from "./getTaleDataWithProgress";

async function getOfficialTaleQuery(slug: string): Promise<TaleData> {
	const tale = await getTale({
		where: (model, { eq, and }) =>
			and(
				eq(model.slug, slug),
				eq(model.visibility, "public"),
				eq(model.isOfficial, true),
			),
	});

	if (!tale) throw new TaleAccessError("Tale not found", 404);

	const userId = await getSignedInUserId();

	if (userId === null) {
		return { tale, progress: null };
	}

	return getTaleDataWithProgress(tale, userId);
}

export const getOfficialTale = getOfficialTaleQuery;
