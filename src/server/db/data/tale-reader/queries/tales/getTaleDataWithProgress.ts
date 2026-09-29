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
	const editableTale = await withEditPermission(tale, userId);
	const progress = await db.query.taleProgresses.findFirst({
		where: (model, { eq, and }) =>
			and(eq(model.taleId, tale.id), eq(model.userId, userId)),
	});

	if (progress !== undefined) {
		return { tale: editableTale, progress: formatReaderProgress(progress) };
	}

	const newProgress = await createNewProgress(
		tale.id,
		tale.order.sceneIds,
		tale.order.keyframeIds,
		userId,
	);

	return { tale: editableTale, progress: formatReaderProgress(newProgress) };
}

async function withEditPermission(tale: Tale, userId: string): Promise<Tale> {
	if (!tale.editable) return { ...tale, canEdit: false };
	if (tale.creatorId === userId) return { ...tale, canEdit: true };
	const permission = await db.query.talePermissions.findFirst({
		where: (model, { and, eq }) =>
			and(eq(model.taleId, tale.id), eq(model.userId, userId)),
	});
	return {
		...tale,
		canEdit: permission?.permissionTypes.includes("collaborator") ?? false,
	};
}
