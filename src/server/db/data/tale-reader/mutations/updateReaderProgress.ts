import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
	type ReaderProgressSchema,
	taleProgresses,
} from "~/server/db/schema";

export type UpdateReaderProgressInput = Pick<
	ReaderProgressSchema,
	| "id"
	| "taleId"
	| "updatedAt"
	| "seenBlockIds"
	| "lastBlockId"
	| "maxBlockIdReached"
	| "activePathIds"
	| "seenPathIds"
	| "seenBlockProgress"
	| "maxReadProgress"
>;

export async function updateReaderProgress(
	userId: string,
	input: UpdateReaderProgressInput,
) {
	const { id, taleId, ...dataToUpdate } = input;

	const [progress] = await db
		.update(taleProgresses)
		.set(dataToUpdate)
		.where(
			and(
				eq(taleProgresses.id, id),
				eq(taleProgresses.taleId, taleId),
				eq(taleProgresses.userId, userId),
			),
		)
		.returning();

	if (!progress) {
		throw new Error("Failed to update tale progress");
	}

	return progress;
}
