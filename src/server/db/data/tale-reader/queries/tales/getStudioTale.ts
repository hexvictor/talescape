import { cache } from "react";
import { db } from "~/server/db";
import { TaleAccessError } from "~/server/db/data/tale-reader/errors/taleAccess";
import type { TaleData } from "~/server/db/data/tale-reader/types/tales";
import { getSignedInUserId } from "../auth/getSignedInUserId";
import { getTale } from "./getTale";
import { getTaleDataWithProgress } from "./getTaleDataWithProgress";

/**
 * Loads a tale for Tale Studio by its stable database id.
 *
 * @param taleId - Numeric tale identifier from the Studio route.
 * @returns Authorized tale and reader progress.
 *
 * @example
 * const data = await getStudioTale(42);
 */
async function getStudioTaleQuery(taleId: number): Promise<TaleData> {
	if (!Number.isSafeInteger(taleId) || taleId <= 0) {
		throw new TaleAccessError("Tale not found", 404);
	}
	const tale = await getTale({
		where: (model, { eq }) => eq(model.id, taleId),
	});
	if (!tale) throw new TaleAccessError("Tale not found", 404);

	return requireTaleStudioAccess(tale);
}

/**
 * Checks whether the signed-in user may open a formatted tale in Tale Studio.
 *
 * @param tale - Tale requiring edit access.
 * @returns Tale data with progress for the authorized Studio user.
 *
 * @example
 * const data = await requireTaleStudioAccess(tale);
 */
async function requireTaleStudioAccess(
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

export const getStudioTale = cache(getStudioTaleQuery);
