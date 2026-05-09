import { cache } from "react";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { db } from "~/server/db";
import { getTale } from "~/server/db/data/tale-reader/queries/tales/getTale";
import type { Tale, TaleData } from "~/server/db/data/tale-reader/types/tales";
import { getUserInfo } from "~/server/db/data/users/queries";
import { getSignedInUserId } from "../auth/getSignedInUserId";
import { createNewProgress } from "../progress/createNewProgress";

async function getUserTaleQuery(
	slug: string,
	creatorUsername: string,
): Promise<TaleData> {
	const creator = await getUserInfo(creatorUsername, "username");

	if (!creator) throw new Error("User not found");

	const tale = await getTale({
		where: (model, { eq, and }) =>
			and(
				eq(model.slug, slug),
				eq(model.creatorId, creator.id),
				eq(model.isOfficial, false),
				eq(model.status, "published"),
			),
	});

	if (!tale) throw new TaleAccessError("Tale not found", 404);

	const partialTale = {
		id: tale.id,
		title: tale.title,
		slug: tale.slug,
		visibility: tale.visibility,
		type: tale.type,
	};

	switch (tale.visibility) {
		case "public":
			return getPublicTaleData(tale);
		case "private":
			return getPrivateTaleData(tale, partialTale);
		case "restricted":
			return getRestrictedTaleData(tale, partialTale);
		default:
			throw new TaleAccessError("Unexpected access case", 403, partialTale);
	}
}

export const getUserTale = cache(getUserTaleQuery);

async function getPublicTaleData(tale: Tale): Promise<TaleData> {
	const userId = await getSignedInUserId();

	if (userId === null) {
		return { tale, progress: null };
	}

	return getTaleDataWithProgress(tale, userId);
}

async function getPrivateTaleData(
	tale: Tale,
	partialTale: TaleAccessError["partialTale"],
): Promise<TaleData> {
	const userId = await requireSignedInUserId(partialTale);

	if (userId !== tale.creatorId) {
		throw new TaleAccessError("Forbidden", 403, partialTale);
	}

	return getTaleDataWithProgress(tale, userId);
}

async function getRestrictedTaleData(
	tale: Tale,
	partialTale: TaleAccessError["partialTale"],
): Promise<TaleData> {
	const userId = await requireSignedInUserId(partialTale);

	if (userId === tale.creatorId) {
		return getTaleDataWithProgress(tale, userId);
	}

	const talePermissions = await db.query.talePermissions.findFirst({
		where: (model, { eq, and }) =>
			and(eq(model.taleId, tale.id), eq(model.userId, userId)),
	});

	if (!talePermissions?.permissionTypes?.includes("viewer")) {
		throw new TaleAccessError("Forbidden", 403, partialTale);
	}

	return getTaleDataWithProgress(tale, userId);
}

async function requireSignedInUserId(
	partialTale: TaleAccessError["partialTale"],
) {
	const userId = await getSignedInUserId();

	if (userId === null) {
		throw new TaleAccessError("Unauthorized", 401, partialTale);
	}

	return userId;
}

async function getTaleDataWithProgress(
	tale: Tale,
	userId: string,
): Promise<TaleData> {
	const progress = await db.query.taleProgresses.findFirst({
		where: (model, { eq, and }) =>
			and(eq(model.taleId, tale.id), eq(model.userId, userId)),
	});

	if (progress !== undefined) {
		return { tale, progress };
	}

	const newProgress = await createNewProgress(
		tale.id,
		tale.content.order.blockIds,
		userId,
	);

	return { tale, progress: newProgress };
}
