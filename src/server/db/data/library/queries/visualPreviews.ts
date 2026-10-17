import "server-only";
import { and, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { elements, frames } from "~/server/db/schema";
import { fragmentAccessCondition, frameAccessCondition } from "./access";

/** Call only with scene IDs already authorized by the owning library query. */
export async function getLibraryVisualPreviews(
	sceneIds: number[],
	userId: string | null,
) {
	if (!sceneIds.length) return { frames: [], elements: [] };
	const ids = [...new Set(sceneIds)];
	const [readableFrames, readableElements] = await Promise.all([
		db
			.select()
			.from(frames)
			.where(and(inArray(frames.sceneId, ids), frameAccessCondition(userId)))
			.orderBy(frames.order),
		db
			.select()
			.from(elements)
			.where(
				and(
					inArray(elements.sceneId, ids),
					fragmentAccessCondition(elements.id, elements, userId),
				),
			)
			.orderBy(elements.order),
	]);
	return { frames: readableFrames, elements: readableElements };
}
export type LibraryVisualSnapshot = Awaited<
	ReturnType<typeof getLibraryVisualPreviews>
>;
