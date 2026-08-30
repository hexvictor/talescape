import "server-only";

import { and, eq, exists, or, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "~/server/db";
import { talePermissions, tales } from "~/server/db/schema";
import { getSignedInUserId } from "../auth/getSignedInUserId";

/** Loads only the authorized tale title required by Studio route metadata. */
async function getStudioTaleTitleQuery(taleId: number): Promise<string | null> {
	if (!Number.isSafeInteger(taleId) || taleId <= 0) return null;

	const userId = await getSignedInUserId();
	if (!userId) return null;

	const [tale] = await db
		.select({ title: tales.title })
		.from(tales)
		.where(
			and(
				eq(tales.id, taleId),
				eq(tales.editable, true),
				or(
					eq(tales.creatorId, userId),
					exists(
						db
							.select({ id: talePermissions.id })
							.from(talePermissions)
							.where(
								and(
									eq(talePermissions.taleId, tales.id),
									eq(talePermissions.userId, userId),
									sql`${talePermissions.permissionTypes} && ARRAY['collaborator']::text[]`,
								),
							),
					),
				),
			),
		)
		.limit(1);

	return tale?.title ?? null;
}

export const getStudioTaleTitle = cache(getStudioTaleTitleQuery);
