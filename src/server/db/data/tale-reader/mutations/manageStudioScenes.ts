import "server-only";

import { and, eq, inArray, max, or } from "drizzle-orm";
import { db } from "~/server/db";
import {
	elementPermissions,
	elements,
	entries,
	frames,
	pages,
	parts,
	pathPermissions,
	paths,
	scenePermissions,
	scenes,
	keyframes,
} from "~/server/db/schema";
import { assertCanEditTale } from "./saveTaleStudioDraft";

export async function addStudioPart(
	userId: string,
	input: { taleId: number },
): Promise<{ partId: number }> {
	await assertCanEditTale(userId, input.taleId);
	const rows = await db
		.select({ value: max(parts.order) })
		.from(parts)
		.where(eq(parts.taleId, input.taleId));
	const order = (rows[0]?.value ?? -1) + 1;
	const [part] = await db
		.insert(parts)
		.values({
			description: "",
			order,
			taleId: input.taleId,
			title: `Part ${order + 1}`,
		})
		.returning({ id: parts.id });
	if (!part) throw new Error("Could not create part");
	return { partId: part.id };
}

export async function addStudioEntry(
	userId: string,
	input: { partId: number; taleId: number },
): Promise<{ entryId: number }> {
	await assertCanEditTale(userId, input.taleId);
	const part = await db.query.parts.findFirst({
		where: (model, { and, eq }) =>
			and(eq(model.id, input.partId), eq(model.taleId, input.taleId)),
	});
	if (!part) throw new Error("Part not found");
	const rows = await db
		.select({ value: max(entries.order) })
		.from(entries)
		.where(eq(entries.taleId, input.taleId));
	const order = (rows[0]?.value ?? -1) + 1;
	const [entry] = await db
		.insert(entries)
		.values({
			description: "",
			isNumbered: true,
			order,
			partId: part.id,
			taleId: input.taleId,
			title: `Entry ${order + 1}`,
			type: "chapter",
		})
		.returning({ id: entries.id });
	if (!entry) throw new Error("Could not create entry");
	return { entryId: entry.id };
}

export async function addStudioPage(
	userId: string,
	input: { entryId: number; taleId: number },
): Promise<{ pageId: number }> {
	await assertCanEditTale(userId, input.taleId);
	const entry = await db.query.entries.findFirst({
		where: (model, { and, eq }) =>
			and(eq(model.id, input.entryId), eq(model.taleId, input.taleId)),
	});
	if (!entry) throw new Error("Entry not found");
	const rows = await db
		.select({ value: max(pages.order) })
		.from(pages)
		.where(eq(pages.taleId, input.taleId));
	const order = (rows[0]?.value ?? -1) + 1;
	const [page] = await db
		.insert(pages)
		.values({
			description: "",
			entryId: entry.id,
			isPaginated: true,
			order,
			partId: entry.partId,
			taleId: input.taleId,
			title: `Page ${order + 1}`,
			type: "chapter",
		})
		.returning({ id: pages.id });
	if (!page) throw new Error("Could not create page");
	return { pageId: page.id };
}

export async function addStudioFrame(
	userId: string,
	input: { taleId: number; sceneId: number },
) {
	await assertCanEditTale(userId, input.taleId);
	return db.transaction(async (tx) => {
		const scene = await tx.query.scenes.findFirst({
			where: (s, { and, eq }) =>
				and(eq(s.id, input.sceneId), eq(s.taleId, input.taleId)),
		});
		if (!scene) throw new Error("Scene not found");
		const rows = await tx
			.select({ value: max(frames.order) })
			.from(frames)
			.where(eq(frames.sceneId, scene.id));
		const order = (rows[0]?.value ?? -1) + 1;
		const [frame] = await tx
			.insert(frames)
			.values({
				taleId: input.taleId,
				sceneId: scene.id,
				creatorId: userId,
				order,
				stableId: crypto.randomUUID(),
				name: `Frame ${order + 1}`,
				config: { id: "", mode: "stack", children: [], parentFrameId: null },
			})
			.returning({ id: frames.id });
		if (!frame) throw new Error("Could not create frame");
		await tx.insert(keyframes).values({
			taleId: input.taleId,
			sceneId: scene.id,
			frameId: frame.id,
			branchId: scene.branchId,
			creatorId: userId,
			order: 0,
			title: "Opening keyframe",
		});
		return { frameId: frame.id };
	});
}

export async function removeStudioFrame(
	userId: string,
	input: { taleId: number; frameId: number },
) {
	await assertCanEditTale(userId, input.taleId);
	await db.transaction(async (tx) => {
		const frame = await tx.query.frames.findFirst({
			where: (f, { and, eq }) =>
				and(eq(f.id, input.frameId), eq(f.taleId, input.taleId)),
		});
		if (!frame) throw new Error("Frame not found");
		const siblings = await tx.query.frames.findMany({
			where: (f, { eq }) => eq(f.sceneId, frame.sceneId),
		});
		if (siblings.length <= 1)
			throw new Error("A scene must contain at least one frame");
		const content = await tx.query.elements.findFirst({
			where: (e, { eq }) => eq(e.frameId, frame.id),
		});
		if (content || siblings.some((item) => item.parentFrameId === frame.id))
			throw new Error(
				"Move or remove the frame's elements and child frames first",
			);
		const owned = await tx.query.keyframes.findMany({
			where: (k, { eq }) => eq(k.frameId, frame.id),
		});
		for (const item of owned) {
			await tx
				.update(paths)
				.set({ fromKeyframeId: null })
				.where(eq(paths.fromKeyframeId, item.id));
			await tx
				.update(paths)
				.set({ toKeyframeId: null })
				.where(eq(paths.toKeyframeId, item.id));
		}
		await tx.delete(keyframes).where(eq(keyframes.frameId, frame.id));
		await tx.delete(frames).where(eq(frames.id, frame.id));
	});
}

export async function addStudioScene(
	userId: string,
	input: { branchId: number; taleId: number },
): Promise<{ sceneId: number }> {
	await assertCanEditTale(userId, input.taleId);
	return db.transaction(async (tx) => {
		const branch = await tx.query.branches.findFirst({
			where: (model, { and, eq }) =>
				and(eq(model.id, input.branchId), eq(model.taleId, input.taleId)),
		});
		if (!branch) throw new Error("Branch not found");
		const reference = await tx.query.scenes.findFirst({
			orderBy: (model, { desc }) => desc(model.order),
			where: (model, { and, eq }) =>
				and(eq(model.branchId, input.branchId), eq(model.taleId, input.taleId)),
		});
		const [scene] = await tx
			.insert(scenes)
			.values({
				branchId: input.branchId,
				creatorId: userId,
				description: "",
				order: (reference?.order ?? -1) + 1,
				pageOrder: 0,
				taleId: input.taleId,
				title: "New scene",
			})
			.returning({ id: scenes.id });
		if (!scene) throw new Error("Could not create scene");
		const contentStableId = `scene-${scene.id}-frame-1`;
		const [contentFrame] = await tx
			.insert(frames)
			.values({
				config: {
					children: [],
					id: contentStableId,
					mode: "stack",
					overflow: "clip",
					parentFrameId: null,
					style: { height: "100%", width: "100%" },
				},
				creatorId: userId,
				isRoot: false,
				name: "Frame 1",
				order: 1,
				parentFrameId: null,
				sceneId: scene.id,
				stableId: contentStableId,
				styleConfig: { height: "100%", width: "100%" },
				taleId: input.taleId,
			})
			.returning({ id: frames.id });
		if (!contentFrame) throw new Error("Could not create initial Frame");
		await tx.insert(keyframes).values({
			actions: [],
			branchId: input.branchId,
			creatorId: userId,
			description: "Opening state for this scene.",
			frameId: contentFrame.id,
			order: 0,
			pageId: null,
			sceneId: scene.id,
			taleId: input.taleId,
			title: "Opening step",
		});
		return { sceneId: scene.id };
	});
}

export async function removeStudioScene(
	userId: string,
	input: { sceneId: number; taleId: number },
): Promise<void> {
	await assertCanEditTale(userId, input.taleId);
	await db.transaction(async (tx) => {
		const scene = await tx.query.scenes.findFirst({
			where: (model, { and, eq }) =>
				and(eq(model.id, input.sceneId), eq(model.taleId, input.taleId)),
		});
		if (!scene) throw new Error("Scene not found");
		const branchScenes = await tx.query.scenes.findMany({
			columns: { id: true },
			where: (model, { and, eq }) =>
				and(eq(model.branchId, scene.branchId), eq(model.taleId, input.taleId)),
		});
		if (branchScenes.length <= 1) {
			throw new Error("A branch must keep at least one scene");
		}
		const affectedPaths = await tx
			.select({ id: paths.id })
			.from(paths)
			.where(
				and(
					eq(paths.taleId, input.taleId),
					or(
						eq(paths.fromSceneId, input.sceneId),
						eq(paths.toSceneId, input.sceneId),
					),
				),
			);
		const affectedFragments = await tx
			.select({ id: elements.id })
			.from(elements)
			.where(
				and(
					eq(elements.taleId, input.taleId),
					eq(elements.sceneId, input.sceneId),
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
			await tx.delete(elementPermissions).where(
				inArray(
					elementPermissions.elementId,
					affectedFragments.map(({ id }) => id),
				),
			);
		}
		await tx
			.delete(scenePermissions)
			.where(eq(scenePermissions.sceneId, input.sceneId));
		await tx
			.delete(paths)
			.where(
				and(
					eq(paths.taleId, input.taleId),
					or(
						eq(paths.fromSceneId, input.sceneId),
						eq(paths.toSceneId, input.sceneId),
					),
				),
			);
		await tx
			.delete(keyframes)
			.where(
				and(
					eq(keyframes.taleId, input.taleId),
					eq(keyframes.sceneId, input.sceneId),
				),
			);
		await tx
			.delete(elements)
			.where(
				and(
					eq(elements.taleId, input.taleId),
					eq(elements.sceneId, input.sceneId),
				),
			);
		await tx
			.delete(frames)
			.where(
				and(eq(frames.taleId, input.taleId), eq(frames.sceneId, input.sceneId)),
			);
		await tx
			.delete(scenes)
			.where(
				and(eq(scenes.taleId, input.taleId), eq(scenes.id, input.sceneId)),
			);
	});
}

export async function addStudioKeyframe(
	userId: string,
	input: { frameId: number; sceneId: number; taleId: number },
): Promise<{ keyframeId: number }> {
	await assertCanEditTale(userId, input.taleId);
	const scene = await db.query.scenes.findFirst({
		where: (model, { and, eq }) =>
			and(eq(model.id, input.sceneId), eq(model.taleId, input.taleId)),
	});
	if (!scene) throw new Error("Scene not found");
	const frame = await db.query.frames.findFirst({
		columns: { id: true },
		where: (model, { and, eq }) =>
			and(
				eq(model.id, input.frameId),
				eq(model.sceneId, input.sceneId),
				eq(model.taleId, input.taleId),
			),
	});
	if (!frame) throw new Error("Frame not found");
	const orderRows = await db
		.select({ value: max(keyframes.order) })
		.from(keyframes)
		.where(
			and(
				eq(keyframes.taleId, input.taleId),
				eq(keyframes.sceneId, input.sceneId),
			),
		);
	const order = (orderRows[0]?.value ?? -1) + 1;
	const [step] = await db
		.insert(keyframes)
		.values({
			actions: [],
			branchId: scene.branchId,
			creatorId: userId,
			description: "",
			frameId: frame.id,
			order,
			pageId: null,
			sceneId: scene.id,
			taleId: input.taleId,
			title: `Keyframe ${order + 1}`,
		})
		.returning({ id: keyframes.id });
	if (!step) throw new Error("Could not create step");
	return { keyframeId: step.id };
}

export async function removeStudioKeyframe(
	userId: string,
	input: { keyframeId: number; taleId: number },
): Promise<void> {
	await assertCanEditTale(userId, input.taleId);
	const step = await db.query.keyframes.findFirst({
		where: (model, { and, eq }) =>
			and(eq(model.id, input.keyframeId), eq(model.taleId, input.taleId)),
	});
	if (!step) throw new Error("Keyframe not found");
	if (step.frameId === null)
		throw new Error("This legacy Scene Keyframe is not owned by a Frame");
	const frameId = step.frameId;
	const frameKeyframes = await db.query.keyframes.findMany({
		columns: { id: true },
		where: (model, { and, eq }) =>
			and(
				eq(model.sceneId, step.sceneId),
				eq(model.frameId, frameId),
				eq(model.taleId, input.taleId),
			),
	});
	if (frameKeyframes.length <= 1)
		throw new Error("A progressing Frame must keep at least one Keyframe");
	await db
		.delete(keyframes)
		.where(
			and(
				eq(keyframes.id, input.keyframeId),
				eq(keyframes.taleId, input.taleId),
			),
		);
}
