import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { db } from "~/server/db";
import { getTale } from "~/server/db/data/tale-reader/queries/tales/getTale";
import type { TaleData } from "~/server/db/data/tale-reader/types/tales";
import { createNewProgress } from "../progress/createNewProgress";

export async function getOfficialTaleQuery(slug: string): Promise<TaleData> {
	const user = await auth();

	const rawTale = await db.query.tales.findFirst({
		where: (model, { eq, and }) =>
			and(
				eq(model.slug, slug),
				eq(model.visibility, "public"),
				eq(model.status, "published"),
				eq(model.isOfficial, true),
			),
	});

	if (!rawTale) throw new TaleAccessError("Tale not found", 404);

	const tale = await getTale(rawTale);
	if (user.userId === null) {
		// use localStorage to get the progress,  save the progress
		// ATTENTION HERE
		return { tale, progress: null };
	}
	const progress = await db.query.taleProgresses.findFirst({
		where: (model, { eq, and }) =>
			and(eq(model.taleId, rawTale.id), eq(model.userId, user.userId)),
	});
	if (progress === undefined) {
		const newProgress = await createNewProgress(
			tale.id,
			tale.structure.blockIds,
			user.userId,
		);
		return {
			tale,
			progress: newProgress,
		};
	}
	return { tale, progress };
}

export const getOfficialTale = cache(getOfficialTaleQuery);
