import { cache } from "react";
import { db } from "~/server/db";
import { TaleAccessError } from "~/server/db/data/tale-reader/errors/taleAccess";
import type { TaleData } from "~/server/db/data/tale-reader/types/tales";
import { getUserInfo } from "~/server/db/data/users/queries";
import { getSignedInUserId } from "../auth/getSignedInUserId";
import { getTale } from "./getTale";
import { getTaleDataWithProgress } from "./getTaleDataWithProgress";

/**
 * Loads an editable creator tale after checking owner or collaborator access.
 *
 * @param slug - Tale slug.
 * @param creatorUsername - Username owning the tale route.
 * @returns Editable tale and reader progress.
 *
 * @example
 * const data = await getEditableUserTale("thornwick", "author");
 */
async function getEditableUserTaleQuery(
	slug: string,
	creatorUsername: string,
): Promise<TaleData> {
	const creator = await getUserInfo(creatorUsername, "username");
	if (!creator) throw new TaleAccessError("Tale not found", 404);

	const tale = await getTale({
		where: (model, { and, eq }) =>
			and(
				eq(model.slug, slug),
				eq(model.creatorId, creator.id),
				eq(model.isOfficial, false),
			),
	});
	if (!tale) throw new TaleAccessError("Tale not found", 404);

	return requireTaleEditAccess(tale);
}

/**
 * Loads an editable official tale after checking owner or collaborator access.
 *
 * @param slug - Official tale slug.
 * @returns Editable tale and reader progress.
 *
 * @example
 * const data = await getEditableOfficialTale("thornwick");
 */
async function getEditableOfficialTaleQuery(slug: string): Promise<TaleData> {
	const tale = await getTale({
		where: (model, { and, eq }) =>
			and(eq(model.slug, slug), eq(model.isOfficial, true)),
	});
	if (!tale) throw new TaleAccessError("Tale not found", 404);

	return requireTaleEditAccess(tale);
}

/**
 * Checks whether the signed-in user may edit a formatted tale.
 *
 * @param tale - Tale requiring edit access.
 * @returns Tale data with progress for the authorized editor.
 *
 * @example
 * const data = await requireTaleEditAccess(tale);
 */
async function requireTaleEditAccess(
	tale: TaleData["tale"],
): Promise<TaleData> {
	const userId = await getSignedInUserId();
	if (userId === null) {
		throw new TaleAccessError("Unauthorized", 401);
	}
	if (!tale.editable) {
		throw new TaleAccessError("Forbidden", 403);
	}
	if (userId !== tale.creatorId) {
		const permission = await db.query.talePermissions.findFirst({
			where: (model, { and, eq }) =>
				and(eq(model.taleId, tale.id), eq(model.userId, userId)),
		});
		if (!permission?.permissionTypes.includes("collaborator")) {
			throw new TaleAccessError("Forbidden", 403);
		}
	}

	return getTaleDataWithProgress(tale, userId);
}

export const getEditableUserTale = cache(getEditableUserTaleQuery);
export const getEditableOfficialTale = cache(getEditableOfficialTaleQuery);
