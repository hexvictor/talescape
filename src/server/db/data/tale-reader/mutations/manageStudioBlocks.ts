import "server-only";

import { and, eq, inArray, max, or } from "drizzle-orm";
import { db } from "~/server/db";
import {
	blockPermissions,
	blocks,
	fragmentPermissions,
	fragments,
	nodes,
	pages,
	pathPermissions,
	paths,
} from "~/server/db/schema";
import { assertCanEditTale } from "./saveTaleStudioDraft";

export async function addStudioBlock(
	userId: string,
	input: { branchId: number; taleId: number },
): Promise<{ blockId: number }> {
	await assertCanEditTale(userId, input.taleId);
	return db.transaction(async (tx) => {
		const branch = await tx.query.branches.findFirst({
			where: (model, { and, eq }) =>
				and(eq(model.id, input.branchId), eq(model.taleId, input.taleId)),
		});
		if (!branch) throw new Error("Branch not found");
		const reference = await tx.query.blocks.findFirst({
			orderBy: (model, { desc }) => desc(model.order),
			where: (model, { and, eq }) =>
				and(eq(model.branchId, input.branchId), eq(model.taleId, input.taleId)),
		});
		if (!reference)
			throw new Error("A branch needs an existing narrative location");
		const pageOrderRows = await tx
			.select({ value: max(pages.order) })
			.from(pages)
			.where(eq(pages.taleId, input.taleId));
		const maxPageOrder = pageOrderRows[0]?.value ?? -1;
		const [page] = await tx
			.insert(pages)
			.values({
				description: "",
				entryId: reference.entryId,
				isPaginated: true,
				order: maxPageOrder + 1,
				partId: reference.partId,
				taleId: input.taleId,
				title: "New page",
				type: "custom",
			})
			.returning({ id: pages.id });
		if (!page) throw new Error("Could not create page");
		const [block] = await tx
			.insert(blocks)
			.values({
				branchId: input.branchId,
				creatorId: userId,
				description: "",
				entryId: reference.entryId,
				order: reference.order + 1,
				pageId: page.id,
				pageOrder: 0,
				partId: reference.partId,
				taleId: input.taleId,
				title: "New block",
			})
			.returning({ id: blocks.id });
		if (!block) throw new Error("Could not create block");
		await tx.insert(nodes).values({
			blockId: block.id,
			config: {
				align: "stretch",
				children: [],
				direction: "column",
				gap: 24,
				id: `block-${block.id}-root`,
				justify: "center",
				mode: "flex",
				overflow: "visible",
				parentNodeId: null,
				wrap: false,
			},
			creatorId: userId,
			isRoot: true,
			name: "root",
			order: 0,
			stableId: `block-${block.id}-root`,
			taleId: input.taleId,
		});
		return { blockId: block.id };
	});
}

export async function removeStudioBlock(
	userId: string,
	input: { blockId: number; taleId: number },
): Promise<void> {
	await assertCanEditTale(userId, input.taleId);
	await db.transaction(async (tx) => {
		const block = await tx.query.blocks.findFirst({
			where: (model, { and, eq }) =>
				and(eq(model.id, input.blockId), eq(model.taleId, input.taleId)),
		});
		if (!block) throw new Error("Block not found");
		const branchBlocks = await tx.query.blocks.findMany({
			columns: { id: true },
			where: (model, { and, eq }) =>
				and(eq(model.branchId, block.branchId), eq(model.taleId, input.taleId)),
		});
		if (branchBlocks.length <= 1) {
			throw new Error("A branch must keep at least one block");
		}
		const affectedPaths = await tx
			.select({ id: paths.id })
			.from(paths)
			.where(
				and(
					eq(paths.taleId, input.taleId),
					or(
						eq(paths.fromBlockId, input.blockId),
						eq(paths.toBlockId, input.blockId),
					),
				),
			);
		const affectedFragments = await tx
			.select({ id: fragments.id })
			.from(fragments)
			.where(
				and(
					eq(fragments.taleId, input.taleId),
					eq(fragments.blockId, input.blockId),
				),
			);
		if (affectedPaths.length > 0) {
			await tx.delete(pathPermissions).where(
				inArray(
					pathPermissions.pathId,
					affectedPaths.map(({ id }) => id),
				),
			);
		}
		if (affectedFragments.length > 0) {
			await tx.delete(fragmentPermissions).where(
				inArray(
					fragmentPermissions.fragmentId,
					affectedFragments.map(({ id }) => id),
				),
			);
		}
		await tx
			.delete(blockPermissions)
			.where(eq(blockPermissions.blockId, input.blockId));
		await tx
			.delete(paths)
			.where(
				and(
					eq(paths.taleId, input.taleId),
					or(
						eq(paths.fromBlockId, input.blockId),
						eq(paths.toBlockId, input.blockId),
					),
				),
			);
		await tx
			.delete(fragments)
			.where(
				and(
					eq(fragments.taleId, input.taleId),
					eq(fragments.blockId, input.blockId),
				),
			);
		await tx
			.delete(nodes)
			.where(
				and(eq(nodes.taleId, input.taleId), eq(nodes.blockId, input.blockId)),
			);
		await tx
			.delete(blocks)
			.where(
				and(eq(blocks.taleId, input.taleId), eq(blocks.id, input.blockId)),
			);
		const remaining = await tx.query.blocks.findFirst({
			columns: { id: true },
			where: (model, { eq }) => eq(model.pageId, block.pageId),
		});
		if (!remaining) await tx.delete(pages).where(eq(pages.id, block.pageId));
	});
}
