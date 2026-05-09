import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { db } from "~/server/db";
import type { TaleData } from "~/server/db/data/tale-reader/types/tales";
import { getSignedInUserId } from "../auth/getSignedInUserId";
import { createNewProgress } from "../progress/createNewProgress";
import { getTale } from "./getTale";

export async function getOfficialTaleQuery(slug: string): Promise<TaleData> {
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

	const progress = await db.query.taleProgresses.findFirst({
		where: (model, { eq, and }) =>
			and(eq(model.taleId, tale.id), eq(model.userId, userId)),
	});

	if (progress === undefined) {
		const newProgress = await createNewProgress(
			tale.id,
			tale.content.order.blockIds,
			userId,
		);

		return { tale, progress: newProgress };
	}

	return { tale, progress };
}

export const getOfficialTale = getOfficialTaleQuery;
