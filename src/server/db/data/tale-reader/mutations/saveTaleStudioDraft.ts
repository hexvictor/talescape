import "server-only";

import { and, eq, inArray, or } from "drizzle-orm";
import { normalizeSceneSnapConfig } from "~/app/(tale-app)/_shared/services/readerSnapSettings";
import type {
	FirstSceneTransitionMode,
	SceneContainer,
	TaleBackgroundConfig,
	TaleBreakpoint,
	TaleElementResponsiveOverride,
	TaleKeyframe,
	TalePlaybackConfig,
	TaleSceneResponsiveOverride,
	TaleSnapConfig,
} from "~/app/(tale-app)/_shared/types";
import { db } from "~/server/db";
import {
	branches,
	elementPermissions,
	elements,
	entries,
	frames,
	keyframes,
	pages,
	parts,
	pathPermissions,
	paths,
	scenePermissions,
	scenes,
	tales,
} from "~/server/db/schema";
import type {
	ElementData,
	ElementType,
} from "~/server/db/types/tale-reader/element";
import type { EntryType } from "~/server/db/types/tale-reader/entry";
import type { PageType } from "~/server/db/types/tale-reader/page";
import type { PathType } from "~/server/db/types/tale-reader/path";
import type {
	BlockSnapConfig,
	ElementAnimationConfig,
	ElementPlacementConfig,
	FrameAnimationConfig,
	FrameConfig,
	KeyframeActionConfig,
	ReaderSizeConfig,
	ReaderSizeMode,
	ReaderStyleConfig,
	ReadingConfig,
	TimelineRange,
	TransitionConfig,
} from "~/server/db/types/tale-reader/readerConfig";

export type SaveTaleStudioDraftInput = {
	backgroundConfig: TaleBackgroundConfig;
	breakpointConfig: unknown;
	branches: Array<{
		description: string | null;
		id: number;
		order: number;
		parentBranchId: number | null;
		title: string;
	}>;
	scenes: Array<{
		containerConfig?: SceneContainer;
		branchId: number;
		description: string | null;
		id: number;
		isChoiceScene: boolean;
		order: number;
		readingConfig: unknown;
		responsiveConfig: unknown;
		sizeConfig: unknown;
		sizeMode: ReaderSizeMode;
		snap: boolean | BlockSnapConfig;
		styleConfig: unknown;
		title: string;
		transitionConfig: unknown;
	}>;
	description: string;
	firstSceneTransitionMode: FirstSceneTransitionMode;
	elements: Array<{
		animationConfig: unknown;
		content: Record<string, unknown>;
		data: Record<string, unknown>;
		id: number;
		frameId: number | null;
		order: number;
		placementConfig: unknown;
		responsiveConfig: unknown;
		sceneId: number;
		styleConfig: unknown;
		type: string;
		visibleRange: unknown;
	}>;
	frames: Array<{
		animationConfig: unknown;
		config: unknown;
		id: number;
		name: string | null;
		order: number;
		parentFrameId: number | null;
		sceneId: number;
		styleConfig: unknown;
	}>;
	keyframes: Array<{
		responsiveConfig?: TaleKeyframe["responsiveOverrides"];
		actions: unknown[];
		branchId: number;
		description: string | null;
		frameId: number | null;
		id: number;
		order: number;
		pageId: number | null;
		readingConfig: unknown;
		sceneId: number;
		snapConfig: boolean | BlockSnapConfig;
		title: string;
	}>;
	paths: Array<{
		description: string | null;
		fromSceneId: number;
		fromKeyframeId: number | null;
		fromBranchId: number;
		id: number;
		label: string;
		order: number;
		toSceneId: number;
		toKeyframeId: number | null;
		toBranchId: number;
		type: PathType;
	}>;
	pages: Array<{
		description: string | null;
		entryId: number;
		id: number;
		isPaginated: boolean;
		order: number;
		partId: number;
		title: string | null;
		type: string;
	}>;
	entries: Array<{
		description: string | null;
		id: number;
		isNumbered: boolean;
		order: number;
		partId: number;
		title: string;
		type: string;
	}>;
	parts: Array<{
		description: string | null;
		id: number;
		order: number;
		title: string;
	}>;
	playbackConfig: TalePlaybackConfig;
	snapConfig: TaleSnapConfig;
	taleId: number;
	title: string;
};

/**
 * Saves the editable fields currently supported by Tale Studio.
 *
 * @param userId - Clerk user id attempting to save the tale.
 * @param input - Existing-row Tale Studio draft payload.
 * @returns Save summary for the updated tale.
 *
 * @example
 * await saveTaleStudioDraft(userId, draft);
 */
export async function saveTaleStudioDraft(
	userId: string,
	input: SaveTaleStudioDraftInput,
): Promise<{ updatedAt: string }> {
	await assertCanEditTale(userId, input.taleId);
	await db.transaction(async (tx) => {
		await tx
			.update(tales)
			.set({
				backgroundConfig: input.backgroundConfig,
				breakpointConfig: input.breakpointConfig as TaleBreakpoint[],
				description: input.description,
				firstSceneTransitionMode: input.firstSceneTransitionMode,
				playbackConfig: input.playbackConfig,
				snapConfig: input.snapConfig,
				title: input.title,
			})
			.where(eq(tales.id, input.taleId));

		await deleteRemovedRows(tx, input);

		const branchIdMap = new Map(
			input.branches.map((branch) => [branch.id, branch.id]),
		);
		const partIdMap = new Map(
			input.parts.filter(hasValidId).map((part) => [part.id, part.id] as const),
		);
		const entryIdMap = new Map(
			input.entries
				.filter(hasValidId)
				.map((entry) => [entry.id, entry.id] as const),
		);
		const pageIdMap = new Map(
			input.pages.filter(hasValidId).map((page) => [page.id, page.id] as const),
		);
		const sceneIdMap = new Map(
			input.scenes
				.filter(hasValidId)
				.map((scene) => [scene.id, scene.id] as const),
		);
		const frameIdMap = new Map(
			input.frames
				.filter(hasValidId)
				.map((frame) => [frame.id, frame.id] as const),
		);
		const elementIdMap = new Map(
			input.elements
				.filter(hasValidId)
				.map((element) => [element.id, element.id] as const),
		);
		const keyframeIdMap = new Map(
			input.keyframes
				.filter(hasValidId)
				.map((step) => [step.id, step.id] as const),
		);

		for (const block of input.scenes.filter(isDraftId)) {
			const snap = normalizeSceneSnapConfig(block.snap);
			const transitionConfig = {
				...(block.transitionConfig as TransitionConfig),
				snap,
			};
			const [inserted] = await tx
				.insert(scenes)
				.values({
					branchId: mapRequiredId(branchIdMap, block.branchId, "branch"),
					containerConfig: block.containerConfig ?? { mode: "stack" },
					creatorId: userId,
					description: block.description,
					isChoiceScene: block.isChoiceScene,
					order: block.order,
					pageOrder: 0,
					readingConfig: block.readingConfig as ReadingConfig,
					responsiveConfig: block.responsiveConfig as Record<
						string,
						TaleSceneResponsiveOverride
					>,
					sizeConfig: block.sizeConfig as ReaderSizeConfig,
					sizeMode: block.sizeMode,
					styleConfig: block.styleConfig as ReaderStyleConfig | null,
					taleId: input.taleId,
					title: block.title,
					transitionConfig,
				})
				.returning({ id: scenes.id });
			if (!inserted) throw new Error("Could not save draft scene");
			sceneIdMap.set(block.id, inserted.id);
		}

		for (const part of input.parts.filter(isDraftId)) {
			const [inserted] = await tx
				.insert(parts)
				.values({
					description: part.description,
					order: part.order,
					taleId: input.taleId,
					title: part.title,
				})
				.returning({ id: parts.id });
			if (!inserted) throw new Error("Could not save draft part");
			partIdMap.set(part.id, inserted.id);
		}

		for (const entry of input.entries.filter(isDraftId)) {
			const [inserted] = await tx
				.insert(entries)
				.values({
					description: entry.description,
					isNumbered: entry.isNumbered,
					order: entry.order,
					partId: mapRequiredId(partIdMap, entry.partId, "part"),
					taleId: input.taleId,
					title: entry.title,
					type: entry.type as EntryType,
				})
				.returning({ id: entries.id });
			if (!inserted) throw new Error("Could not save draft entry");
			entryIdMap.set(entry.id, inserted.id);
		}

		for (const page of input.pages.filter(isDraftId)) {
			const [inserted] = await tx
				.insert(pages)
				.values({
					description: page.description,
					entryId: mapRequiredId(entryIdMap, page.entryId, "entry"),
					isPaginated: page.isPaginated,
					order: page.order,
					partId: mapRequiredId(partIdMap, page.partId, "part"),
					taleId: input.taleId,
					title: page.title,
					type: page.type as PageType,
				})
				.returning({ id: pages.id });
			if (!inserted) throw new Error("Could not save draft page");
			pageIdMap.set(page.id, inserted.id);
		}

		for (const node of input.frames.filter(isDraftId)) {
			const sceneId = mapRequiredId(sceneIdMap, node.sceneId, "scene");
			const parentFrameId =
				node.parentFrameId === null
					? null
					: mapRequiredId(frameIdMap, node.parentFrameId, "parent frame");
			const [inserted] = await tx
				.insert(frames)
				.values({
					animationConfig: node.animationConfig as FrameAnimationConfig,
					config: node.config as FrameConfig,
					creatorId: userId,
					name: node.name,
					order: node.order,
					parentFrameId,
					sceneId,
					stableId: `draft-frame-${Math.abs(node.id)}`,
					styleConfig: node.styleConfig as ReaderStyleConfig | null,
					taleId: input.taleId,
				})
				.returning({ id: frames.id });
			if (!inserted) throw new Error("Could not save draft frame");
			frameIdMap.set(node.id, inserted.id);
		}

		// Parent configs can reference draft child IDs that are not known until all
		// Frame and Group rows have been inserted. Normalize those references in a
		// second pass so nested Groups survive the save/reload round trip.
		for (const node of input.frames.filter(isDraftId)) {
			await tx
				.update(frames)
				.set({ config: remapFrameConfig(node.config, frameIdMap) })
				.where(
					and(
						eq(frames.id, mapRequiredId(frameIdMap, node.id, "frame")),
						eq(frames.taleId, input.taleId),
					),
				);
		}

		for (const fragment of input.elements.filter(isDraftId)) {
			const [inserted] = await tx
				.insert(elements)
				.values({
					animationConfig: fragment.animationConfig as ElementAnimationConfig,
					content: fragment.content,
					creatorId: userId,
					data: fragment.data as ElementData,
					frameId:
						fragment.frameId === null
							? null
							: mapRequiredId(frameIdMap, fragment.frameId, "frame"),
					order: fragment.order,
					placementConfig: fragment.placementConfig as ElementPlacementConfig,
					responsiveConfig: fragment.responsiveConfig as Record<
						string,
						TaleElementResponsiveOverride
					>,
					sceneId: mapRequiredId(sceneIdMap, fragment.sceneId, "scene"),
					styleConfig: fragment.styleConfig as ReaderStyleConfig | null,
					taleId: input.taleId,
					type: fragment.type as ElementType,
					visibleRange: fragment.visibleRange as TimelineRange | null,
				})
				.returning({ id: elements.id });
			if (!inserted) throw new Error("Could not save draft element");
			elementIdMap.set(fragment.id, inserted.id);
		}

		for (const step of input.keyframes.filter(isDraftId)) {
			const [inserted] = await tx
				.insert(keyframes)
				.values({
					actions: remapKeyframeActions(step.actions, elementIdMap, frameIdMap),
					branchId: mapRequiredId(branchIdMap, step.branchId, "branch"),
					creatorId: userId,
					description: step.description,
					frameId:
						step.frameId === null
							? null
							: mapRequiredId(frameIdMap, step.frameId, "frame"),
					order: step.order,
					pageId:
						step.pageId === null
							? null
							: mapRequiredId(pageIdMap, step.pageId, "page"),
					readingConfig: step.readingConfig as ReadingConfig,
					responsiveConfig: step.responsiveConfig ?? {},
					sceneId: mapRequiredId(sceneIdMap, step.sceneId, "scene"),
					snapConfig: normalizeSceneSnapConfig(step.snapConfig),
					taleId: input.taleId,
					title: step.title,
				})
				.returning({ id: keyframes.id });
			if (!inserted) throw new Error("Could not save draft keyframe");
			keyframeIdMap.set(step.id, inserted.id);
		}

		for (const branch of input.branches.filter(hasValidId)) {
			await tx
				.update(branches)
				.set({
					description: branch.description,
					order: branch.order,
					parentBranchId:
						branch.parentBranchId === null
							? null
							: mapRequiredId(
									branchIdMap,
									branch.parentBranchId,
									"parent branch",
								),
					title: branch.title,
				})
				.where(
					and(eq(branches.id, branch.id), eq(branches.taleId, input.taleId)),
				);
		}

		for (const block of input.scenes.filter(hasValidId)) {
			const snap = normalizeSceneSnapConfig(block.snap);
			const transitionConfig = {
				...(block.transitionConfig as TransitionConfig),
				snap,
			};
			await tx
				.update(scenes)
				.set({
					containerConfig: block.containerConfig ?? { mode: "stack" },
					description: block.description,
					branchId: mapRequiredId(branchIdMap, block.branchId, "branch"),
					isChoiceScene: block.isChoiceScene,
					order: block.order,
					readingConfig: block.readingConfig as ReadingConfig,
					responsiveConfig: block.responsiveConfig as Record<
						string,
						TaleSceneResponsiveOverride
					>,
					sizeConfig: block.sizeConfig as ReaderSizeConfig,
					sizeMode: block.sizeMode,
					styleConfig: block.styleConfig as ReaderStyleConfig | null,
					title: block.title,
					transitionConfig,
				})
				.where(and(eq(scenes.id, block.id), eq(scenes.taleId, input.taleId)));
		}

		for (const page of input.pages.filter(hasValidId)) {
			await tx
				.update(pages)
				.set({
					description: page.description,
					entryId: mapRequiredId(entryIdMap, page.entryId, "entry"),
					isPaginated: page.isPaginated,
					order: page.order,
					partId: mapRequiredId(partIdMap, page.partId, "part"),
					title: page.title,
					type: page.type as PageType,
				})
				.where(and(eq(pages.id, page.id), eq(pages.taleId, input.taleId)));
		}

		for (const entry of input.entries.filter(hasValidId)) {
			await tx
				.update(entries)
				.set({
					description: entry.description,
					isNumbered: entry.isNumbered,
					order: entry.order,
					partId: mapRequiredId(partIdMap, entry.partId, "part"),
					title: entry.title,
					type: entry.type as EntryType,
				})
				.where(and(eq(entries.id, entry.id), eq(entries.taleId, input.taleId)));
		}

		for (const part of input.parts.filter(hasValidId)) {
			await tx
				.update(parts)
				.set({
					description: part.description,
					order: part.order,
					title: part.title,
				})
				.where(and(eq(parts.id, part.id), eq(parts.taleId, input.taleId)));
		}

		for (const step of input.keyframes.filter(hasValidId)) {
			await tx
				.update(keyframes)
				.set({
					responsiveConfig: step.responsiveConfig ?? {},
					actions: remapKeyframeActions(step.actions, elementIdMap, frameIdMap),
					branchId: mapRequiredId(branchIdMap, step.branchId, "branch"),
					description: step.description,
					frameId:
						step.frameId === null
							? null
							: mapRequiredId(frameIdMap, step.frameId, "frame"),
					order: step.order,
					pageId:
						step.pageId === null
							? null
							: mapRequiredId(pageIdMap, step.pageId, "page"),
					readingConfig: step.readingConfig as ReadingConfig,
					sceneId: mapRequiredId(sceneIdMap, step.sceneId, "scene"),
					snapConfig: normalizeSceneSnapConfig(step.snapConfig),
					title: step.title,
				})
				.where(
					and(eq(keyframes.id, step.id), eq(keyframes.taleId, input.taleId)),
				);
		}

		for (const node of input.frames.filter(hasValidId)) {
			await tx
				.update(frames)
				.set({
					animationConfig: node.animationConfig as FrameAnimationConfig,
					config: remapFrameConfig(node.config, frameIdMap),
					name: node.name,
					order: node.order,
					parentFrameId:
						node.parentFrameId === null
							? null
							: mapRequiredId(frameIdMap, node.parentFrameId, "parent frame"),
					sceneId: mapRequiredId(sceneIdMap, node.sceneId, "scene"),
					styleConfig: node.styleConfig as ReaderStyleConfig | null,
				})
				.where(and(eq(frames.id, node.id), eq(frames.taleId, input.taleId)));
		}

		for (const fragment of input.elements.filter(hasValidId)) {
			await tx
				.update(elements)
				.set({
					animationConfig: fragment.animationConfig as ElementAnimationConfig,
					content: fragment.content,
					data: fragment.data as ElementData,
					frameId:
						fragment.frameId === null
							? null
							: mapRequiredId(frameIdMap, fragment.frameId, "frame"),
					order: fragment.order,
					placementConfig: fragment.placementConfig as ElementPlacementConfig,
					responsiveConfig: fragment.responsiveConfig as Record<
						string,
						TaleElementResponsiveOverride
					>,
					sceneId: mapRequiredId(sceneIdMap, fragment.sceneId, "scene"),
					styleConfig: fragment.styleConfig as ReaderStyleConfig | null,
					type: fragment.type as ElementType,
					visibleRange: fragment.visibleRange as TimelineRange | null,
				})
				.where(
					and(eq(elements.id, fragment.id), eq(elements.taleId, input.taleId)),
				);
		}

		for (const path of input.paths.filter(hasValidId)) {
			await tx
				.update(paths)
				.set({
					description: path.description,
					fromSceneId: mapRequiredId(sceneIdMap, path.fromSceneId, "scene"),
					fromKeyframeId:
						path.fromKeyframeId === null
							? null
							: mapRequiredId(
									keyframeIdMap,
									path.fromKeyframeId,
									"source keyframe",
								),
					fromBranchId: mapRequiredId(branchIdMap, path.fromBranchId, "branch"),
					label: path.label,
					order: path.order,
					toSceneId: mapRequiredId(sceneIdMap, path.toSceneId, "scene"),
					toKeyframeId:
						path.toKeyframeId === null
							? null
							: mapRequiredId(
									keyframeIdMap,
									path.toKeyframeId,
									"target keyframe",
								),
					toBranchId: mapRequiredId(branchIdMap, path.toBranchId, "branch"),
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
export async function assertCanEditTale(
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
 * Filters Tale Studio payload rows to valid numeric database identifiers.
 *
 * @param value - Payload row with an id field.
 * @returns Whether the row can be safely used in a database update.
 *
 * @example
 * const rows = input.scenes.filter(hasValidId);
 */
function hasValidId(value: { id: number }): boolean {
	return Number.isFinite(value.id) && value.id > 0;
}

function isDraftId(value: { id: number }): boolean {
	return Number.isFinite(value.id) && value.id < 0;
}

function mapRequiredId(
	map: Map<number, number>,
	id: number,
	label: string,
): number {
	const mapped = map.get(id);
	if (mapped === undefined || !Number.isFinite(mapped)) {
		throw new Error(`Could not resolve draft ${label} ${id}`);
	}
	return mapped;
}

function remapKeyframeActions(
	actions: unknown[],
	elementIdMap: Map<number, number>,
	frameIdMap: Map<number, number>,
): KeyframeActionConfig[] {
	return (actions as KeyframeActionConfig[]).map((action) => {
		const numericTargetId = Number(action.targetId);
		if (!Number.isFinite(numericTargetId)) return action;
		const map = action.targetType === "frame" ? frameIdMap : elementIdMap;
		const targetId = map.get(numericTargetId);
		return targetId === undefined
			? action
			: { ...action, targetId: String(targetId) };
	});
}

function remapFrameConfig(
	config: unknown,
	frameIdMap: Map<number, number>,
): FrameConfig {
	const frameConfig = config as FrameConfig;
	return {
		...frameConfig,
		children: frameConfig.children.map((child) => {
			if (child.type !== "frame") return child;
			const numericId = Number(child.frameId);
			if (!Number.isFinite(numericId)) return child;
			const mapped = frameIdMap.get(numericId);
			return mapped === undefined
				? child
				: { ...child, frameId: String(mapped) };
		}),
	} as FrameConfig;
}

type TaleStudioTransaction = Parameters<
	Parameters<typeof db.transaction>[0]
>[0];

async function deleteRemovedRows(
	tx: TaleStudioTransaction,
	input: SaveTaleStudioDraftInput,
): Promise<void> {
	const keepSceneIds = input.scenes.filter(hasValidId).map((item) => item.id);
	const keepFrameIds = input.frames.filter(hasValidId).map((item) => item.id);
	const keepElementIds = input.elements
		.filter(hasValidId)
		.map((item) => item.id);
	const keepKeyframeIds = input.keyframes
		.filter(hasValidId)
		.map((item) => item.id);
	const keepPathIds = input.paths.filter(hasValidId).map((item) => item.id);

	const existingScenes = await tx
		.select({ id: scenes.id })
		.from(scenes)
		.where(eq(scenes.taleId, input.taleId));
	const existingFrames = await tx
		.select({ id: frames.id })
		.from(frames)
		.where(eq(frames.taleId, input.taleId));
	const existingElements = await tx
		.select({ id: elements.id })
		.from(elements)
		.where(eq(elements.taleId, input.taleId));
	const existingKeyframes = await tx
		.select({ id: keyframes.id })
		.from(keyframes)
		.where(eq(keyframes.taleId, input.taleId));
	const existingPaths = await tx
		.select({ id: paths.id })
		.from(paths)
		.where(eq(paths.taleId, input.taleId));

	const removeSceneIds = existingScenes
		.map((item) => item.id)
		.filter((id) => !keepSceneIds.includes(id));
	const removeFrameIds = existingFrames
		.map((item) => item.id)
		.filter((id) => !keepFrameIds.includes(id));
	const removeElementIds = existingElements
		.map((item) => item.id)
		.filter((id) => !keepElementIds.includes(id));
	const removeKeyframeIds = existingKeyframes
		.map((item) => item.id)
		.filter((id) => !keepKeyframeIds.includes(id));
	const removePathIds = existingPaths
		.map((item) => item.id)
		.filter((id) => !keepPathIds.includes(id));

	if (removePathIds.length > 0) {
		await tx
			.delete(pathPermissions)
			.where(inArray(pathPermissions.pathId, removePathIds));
		await tx.delete(paths).where(inArray(paths.id, removePathIds));
	}
	if (removeSceneIds.length > 0) {
		const affectedPaths = await tx
			.select({ id: paths.id })
			.from(paths)
			.where(
				and(
					eq(paths.taleId, input.taleId),
					or(
						inArray(paths.fromSceneId, removeSceneIds),
						inArray(paths.toSceneId, removeSceneIds),
					),
				),
			);
		if (affectedPaths.length > 0) {
			await tx.delete(pathPermissions).where(
				inArray(
					pathPermissions.pathId,
					affectedPaths.map((item) => item.id),
				),
			);
		}
		await tx
			.delete(paths)
			.where(
				and(
					eq(paths.taleId, input.taleId),
					or(
						inArray(paths.fromSceneId, removeSceneIds),
						inArray(paths.toSceneId, removeSceneIds),
					),
				),
			);
		await tx
			.delete(scenePermissions)
			.where(inArray(scenePermissions.sceneId, removeSceneIds));
	}
	if (removeElementIds.length > 0) {
		await tx
			.delete(elementPermissions)
			.where(inArray(elementPermissions.elementId, removeElementIds));
		await tx.delete(elements).where(inArray(elements.id, removeElementIds));
	}
	if (removeKeyframeIds.length > 0) {
		await tx.delete(keyframes).where(inArray(keyframes.id, removeKeyframeIds));
	}
	if (removeFrameIds.length > 0) {
		await tx.delete(frames).where(inArray(frames.id, removeFrameIds));
	}
	if (removeSceneIds.length > 0) {
		await tx.delete(scenes).where(inArray(scenes.id, removeSceneIds));
	}
}
