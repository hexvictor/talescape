import { db } from "~/server/db";
import { formatReaderProgress } from "~/server/db/data/tale-reader/formatters/progress/formatReaderProgress";
import type { Tale, TaleData } from "~/server/db/data/tale-reader/types/tales";
import { createNewProgress } from "../progress/createNewProgress";

/**
 * Loads or creates reader progress for an authenticated tale reader.
 *
 * @param tale - Formatted tale being opened.
 * @param userId - Authenticated database user identifier.
 * @returns Tale and normalized progress.
 *
 * @example
 * const data = await getTaleDataWithProgress(tale, userId);
 */
export async function getTaleDataWithProgress(
	tale: Tale,
	userId: string,
): Promise<TaleData> {
	const progress = await db.query.taleProgresses.findFirst({
		where: (model, { eq, and }) =>
			and(eq(model.taleId, tale.id), eq(model.userId, userId)),
	});

	if (progress !== undefined) {
		return { tale, progress: formatReaderProgress(progress) };
	}

	const newProgress = await createNewProgress(
		tale.id,
		tale.order.blockIds,
		userId,
	);

	return { tale, progress: formatReaderProgress(newProgress) };
}
