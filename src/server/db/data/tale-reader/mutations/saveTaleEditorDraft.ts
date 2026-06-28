import "server-only";

import { and, eq } from "drizzle-orm";
import type { FirstBlockTransitionMode } from "~/app/(tale-app)/_shared/types";
import type {
	TaleBlockResponsiveOverride,
	TaleBreakpoint,
	TaleFragmentResponsiveOverride,
} from "~/app/(tale-app)/_shared/types";
import { db } from "~/server/db";
import {
	blocks,
	branches,
	fragments,
	nodes,
	paths,
	tales,
} from "~/server/db/schema";
import type {
	FragmentData,
	FragmentType,
} from "~/server/db/types/tale-reader/fragment";
import type { PathType } from "~/server/db/types/tale-reader/path";
import type {
	FragmentAnimationConfig,
	FragmentPlacementConfig,
	NodeAnimationConfig,
	NodeConfig,
	ReaderSizeConfig,
	ReaderSizeMode,
	ReaderStyleConfig,
	ReadingConfig,
	TimelineRange,
	TransitionConfig,
} from "~/server/db/types/tale-reader/readerConfig";

export type SaveTaleEditorDraftInput = {
	breakpointConfig: unknown;
	branches: Array<{
		description: string | null;
		id: number;
		order: number;
		parentBranchId: number | null;
		title: string;
	}>;
	blocks: Array<{
		branchId: number;
		description: string | null;
		id: number;
		isChoiceBlock: boolean;
		order: number;
		readingConfig: unknown;
		responsiveConfig: unknown;
		sizeConfig: unknown;
		sizeMode: ReaderSizeMode;
		snap: boolean;
		styleConfig: unknown;
		title: string;
		transitionConfig: unknown;
	}>;
	description: string;
	firstBlockTransitionMode: FirstBlockTransitionMode;
	fragments: Array<{
		animationConfig: unknown;
		content: Record<string, unknown>;
		data: Record<string, unknown>;
		id: number;
		nodeId: number | null;
		order: number;
		placementConfig: unknown;
		responsiveConfig: unknown;
		styleConfig: unknown;
		type: string;
		visibleRange: unknown;
	}>;
	nodes: Array<{
		animationConfig: unknown;
		config: unknown;
		id: number;
		name: string | null;
		order: number;
		parentNodeId: number | null;
		styleConfig: unknown;
	}>;
	paths: Array<{
		description: string | null;
		fromBlockId: number;
		fromBranchId: number;
		id: number;
		label: string;
		order: number;
		toBlockId: number;
		toBranchId: number;
		type: PathType;
	}>;
	taleId: number;
	title: string;
	transitionFirstBlock: boolean;
};

/**
 * Saves the editable fields that are currently supported by the tale editor.
 *
 * @param userId - Clerk user id attempting to save the tale.
 * @param input - Existing-row tale editor draft payload.
 * @returns Save summary for the updated tale.
 *
 * @example
 * await saveTaleEditorDraft(userId, draft);
 */
export async function saveTaleEditorDraft(
	userId: string,
	input: SaveTaleEditorDraftInput,
): Promise<{ updatedAt: string }> {
	await assertCanEditTale(userId, input.taleId);
	await db.transaction(async (tx) => {
		await tx
			.update(tales)
			.set({
				breakpointConfig: input.breakpointConfig as TaleBreakpoint[],
				description: input.description,
				firstBlockTransitionMode: input.firstBlockTransitionMode,
				title: input.title,
				transitionFirstBlock: input.transitionFirstBlock,
			})
			.where(eq(tales.id, input.taleId));

		for (const branch of input.branches.filter(hasValidId)) {
			await tx
				.update(branches)
				.set({
					description: branch.description,
					order: branch.order,
					parentBranchId: branch.parentBranchId,
					title: branch.title,
				})
				.where(
					and(eq(branches.id, branch.id), eq(branches.taleId, input.taleId)),
				);
		}

		for (const block of input.blocks.filter(hasValidId)) {
			await tx
				.update(blocks)
				.set({
					description: block.description,
					branchId: block.branchId,
					isChoiceBlock: block.isChoiceBlock,
					isSnap: block.snap,
					order: block.order,
					readingConfig: block.readingConfig as ReadingConfig,
					responsiveConfig:
						block.responsiveConfig as Record<
							string,
							TaleBlockResponsiveOverride
						>,
					sizeConfig: block.sizeConfig as ReaderSizeConfig,
					sizeMode: block.sizeMode,
					styleConfig: block.styleConfig as ReaderStyleConfig | null,
					title: block.title,
					transitionConfig: block.transitionConfig as TransitionConfig,
				})
				.where(and(eq(blocks.id, block.id), eq(blocks.taleId, input.taleId)));
		}

		for (const node of input.nodes.filter(hasValidId)) {
			await tx
				.update(nodes)
				.set({
					animationConfig: node.animationConfig as NodeAnimationConfig,
					config: node.config as NodeConfig,
					name: node.name,
					order: node.order,
					parentNodeId: node.parentNodeId,
					styleConfig: node.styleConfig as ReaderStyleConfig | null,
				})
				.where(and(eq(nodes.id, node.id), eq(nodes.taleId, input.taleId)));
		}

		for (const fragment of input.fragments.filter(hasValidId)) {
			await tx
				.update(fragments)
				.set({
					animationConfig: fragment.animationConfig as FragmentAnimationConfig,
					content: fragment.content,
					data: fragment.data as FragmentData,
					nodeId: fragment.nodeId,
					order: fragment.order,
					placementConfig: fragment.placementConfig as FragmentPlacementConfig,
					responsiveConfig:
						fragment.responsiveConfig as Record<
							string,
							TaleFragmentResponsiveOverride
						>,
					styleConfig: fragment.styleConfig as ReaderStyleConfig | null,
					type: fragment.type as FragmentType,
					visibleRange: fragment.visibleRange as TimelineRange | null,
				})
				.where(
					and(
						eq(fragments.id, fragment.id),
						eq(fragments.taleId, input.taleId),
					),
				);
		}

		for (const path of input.paths.filter(hasValidId)) {
			await tx
				.update(paths)
				.set({
					description: path.description,
					fromBlockId: path.fromBlockId,
					fromBranchId: path.fromBranchId,
					label: path.label,
					order: path.order,
					toBlockId: path.toBlockId,
					toBranchId: path.toBranchId,
					type: path.type,
				})
				.where(and(eq(paths.id, path.id), eq(paths.taleId, input.taleId)));
		}
	});

	return { updatedAt: new Date().toISOString() };
}

/**
 * Checks whether a user can edit one tale before writes are attempted.
 *
 * @param userId - Clerk user id attempting the edit.
 * @param taleId - Database tale id.
 * @returns Nothing when access is allowed.
 *
 * @example
 * await assertCanEditTale(userId, taleId);
 */
async function assertCanEditTale(
	userId: string,
	taleId: number,
): Promise<void> {
	const tale = await db.query.tales.findFirst({
		where: (model, { eq }) => eq(model.id, taleId),
	});
	if (!tale || !tale.editable) {
		throw new Error("Tale cannot be edited");
	}
	if (tale.creatorId === userId) return;

	const permission = await db.query.talePermissions.findFirst({
		where: (model, { and, eq }) =>
			and(eq(model.taleId, taleId), eq(model.userId, userId)),
	});
	if (!permission?.permissionTypes.includes("collaborator")) {
		throw new Error("You do not have permission to edit this tale");
	}
}

/**
 * Filters editor payload rows to valid numeric database identifiers.
 *
 * @param value - Payload row with an id field.
 * @returns Whether the row can be safely used in a database update.
 *
 * @example
 * const rows = input.blocks.filter(hasValidId);
 */
function hasValidId(value: { id: number }): boolean {
	return Number.isFinite(value.id) && value.id > 0;
}
