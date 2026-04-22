import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { db } from "~/server/db";
import { getTale } from "~/server/db/data/tale-reader/queries/tales/getTale";
import type { TaleData } from "~/server/db/data/tale-reader/types/tales";
import { getUserInfo } from "~/server/db/data/users/queries";
import { createNewProgress } from "../progress/createNewProgress";

async function getUserTaleQuery(
	slug: string,
	creatorUsername: string,
): Promise<TaleData> {
	const user = await auth();

	const creator = await getUserInfo(creatorUsername, "username");

	if (!creator) throw new Error("User not found");

	const rawTale = await db.query.tales.findFirst({
		where: (model, { eq, and }) =>
			and(
				eq(model.slug, slug),
				eq(model.creatorId, creator.id),
				eq(model.isOfficial, false),
				eq(model.status, "published"),
			),
	});

	if (!rawTale) throw new TaleAccessError("Tale not found", 404);

	const partialTale = {
		id: rawTale.id,
		title: rawTale.title,
		slug: rawTale.slug,
		visibility: rawTale.visibility,
		type: rawTale.type,
	};

	if (rawTale.visibility === "private" || rawTale.visibility === "restricted") {
		if (user.userId === null) {
			throw new TaleAccessError("Unauthorized", 401, partialTale);
		}
		const progress = await db.query.taleProgresses.findFirst({
			where: (model, { eq, and }) =>
				and(eq(model.taleId, rawTale.id), eq(model.userId, user.userId)),
		});
		if (rawTale.visibility === "private") {
			if (user.userId === rawTale.creatorId) {
				const tale = await getTale(rawTale, creator);
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
			throw new TaleAccessError("Forbidden", 403, partialTale);
		}

		if (rawTale.visibility === "restricted") {
			const talePermissions = await db.query.talePermissions.findFirst({
				where: (model, { eq, and }) =>
					and(eq(model.taleId, rawTale.id), eq(model.userId, user.userId)),
			});
			if (
				user.userId === rawTale.creatorId ||
				talePermissions?.permissionTypes?.includes("viewer")
			) {
				const tale = await getTale(rawTale, creator);
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
		}
	} else if (
		rawTale.visibility === "public" ||
		rawTale.visibility === "unlisted"
	) {
		const tale = await getTale(rawTale, creator);
		return { tale, progress: null };
	}
	throw new TaleAccessError("Unexpected access case", 403, partialTale);
}

export const getUserTale = cache(getUserTaleQuery);
