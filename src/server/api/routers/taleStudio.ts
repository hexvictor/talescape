import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
	addStudioEntry,
	addStudioFrame,
	addStudioKeyframe,
	addStudioPage,
	addStudioPart,
	addStudioScene,
	removeStudioFrame,
	removeStudioKeyframe,
	removeStudioScene,
} from "~/server/db/data/tale-reader/mutations/manageStudioScenes";
import {
	type SaveTaleStudioDraftInput,
	saveTaleStudioDraft,
} from "~/server/db/data/tale-reader/mutations/saveTaleStudioDraft";
import { getTale } from "~/server/db/data/tale-reader/queries/tales/getTale";

const jsonRecordSchema = z.record(z.string(), z.unknown());
const requiredJsonSchema = z.any();
const nullableJsonSchema = z.any().nullable();
const animationConfigSchema = z.any();
const pathTypeSchema = z.enum(["choice", "linear", "return", "teleport"]);
const snapSettingsSchema = z.object({
	captureDistancePx: z.number().nullable().optional(),
	delayMs: z.number().nullable().optional(),
	durationSeconds: z.number().nullable().optional(),
	minViewportFraction: z.number().nullable().optional(),
});
const snapBehaviorSchema = z.object({
	mode: z.enum(["snap", "scroll-snap", "snap-off"]),
	settings: snapSettingsSchema.nullable().optional(),
});
const snapConfigSchema = z.union([
	z.boolean(),
	snapBehaviorSchema.extend({
		backward: snapBehaviorSchema.optional(),
		direction: z.enum(["both", "fromNext", "fromPrevious"]).optional(),
		forward: snapBehaviorSchema.optional(),
		strategy: z.enum(["shared", "separate"]).optional(),
	}),
]);
const taleSnapConfigSchema = z.object({
	scrollSnap: snapSettingsSchema,
	snap: snapSettingsSchema,
});
const talePlaybackConfigSchema = z.object({
	autoplay: z.object({
		enabled: z.boolean(),
		speed: z.number().positive(),
		stopOn: z.object({
			dragging: z.boolean(),
			keyboard: z.boolean(),
			scrolling: z.boolean(),
		}),
	}),
	interactions: z.object({
		dragging: z.boolean(),
		keyboard: z.boolean(),
		scrolling: z.boolean(),
	}),
});

export const taleStudioRouter = createTRPCRouter({
	addPart: protectedProcedure
		.input(z.object({ taleId: z.number().int().positive() }))
		.mutation(({ ctx, input }) => addStudioPart(ctx.session.userId, input)),
	addEntry: protectedProcedure
		.input(
			z.object({
				partId: z.number().int().positive(),
				taleId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) => addStudioEntry(ctx.session.userId, input)),
	addPage: protectedProcedure
		.input(
			z.object({
				entryId: z.number().int().positive(),
				taleId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) => addStudioPage(ctx.session.userId, input)),
	addFrame: protectedProcedure
		.input(
			z.object({
				taleId: z.number().int().positive(),
				sceneId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) => addStudioFrame(ctx.session.userId, input)),
	removeFrame: protectedProcedure
		.input(
			z.object({
				taleId: z.number().int().positive(),
				frameId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) => removeStudioFrame(ctx.session.userId, input)),
	addScene: protectedProcedure
		.input(
			z.object({
				branchId: z.number().int().positive(),
				taleId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) => addStudioScene(ctx.session.userId, input)),
	removeScene: protectedProcedure
		.input(
			z.object({
				sceneId: z.number().int().positive(),
				taleId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) => removeStudioScene(ctx.session.userId, input)),
	addKeyframe: protectedProcedure
		.input(
			z.object({
				frameId: z.number().int().positive(),
				sceneId: z.number().int().positive(),
				taleId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) => addStudioKeyframe(ctx.session.userId, input)),
	removeKeyframe: protectedProcedure
		.input(
			z.object({
				keyframeId: z.number().int().positive(),
				taleId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) =>
			removeStudioKeyframe(ctx.session.userId, input),
		),
	saveDraft: protectedProcedure
		.input(
			z.object({
				backgroundConfig: z.object({
					dark: z.object({
						color: z.string(),
						imageUrl: z.string().nullable(),
					}),
					light: z.object({
						color: z.string(),
						imageUrl: z.string().nullable(),
					}),
				}),
				breakpointConfig: requiredJsonSchema,
				branches: z.array(
					z.object({
						description: z.string().nullable(),
						id: z.number(),
						order: z.number(),
						parentBranchId: z.number().nullable(),
						title: z.string(),
					}),
				),
				scenes: z.array(
					z.object({
						containerConfig: z.any().optional(),
						branchId: z.number(),
						description: z.string().nullable(),
						id: z.number(),
						isChoiceScene: z.boolean(),
						order: z.number(),
						readingConfig: requiredJsonSchema,
						responsiveConfig: requiredJsonSchema,
						sizeConfig: requiredJsonSchema,
						sizeMode: z.enum(["contentResponsive", "fixed"]),
						snap: snapConfigSchema,
						styleConfig: nullableJsonSchema,
						title: z.string(),
						transitionConfig: requiredJsonSchema,
					}),
				),
				description: z.string(),
				firstSceneTransitionMode: z.enum(["fromPlacement", "inPlace"]),
				elements: z.array(
					z.object({
						animationConfig: animationConfigSchema,
						content: jsonRecordSchema,
						data: jsonRecordSchema,
						id: z.number(),
						frameId: z.number().nullable(),
						order: z.number(),
						placementConfig: requiredJsonSchema,
						responsiveConfig: requiredJsonSchema,
						sceneId: z.number(),
						styleConfig: nullableJsonSchema,
						type: z.string(),
						visibleRange: nullableJsonSchema,
					}),
				),
				frames: z.array(
					z.object({
						animationConfig: animationConfigSchema,
						config: requiredJsonSchema,
						id: z.number(),
						name: z.string().nullable(),
						order: z.number(),
						parentFrameId: z.number().nullable(),
						sceneId: z.number(),
						styleConfig: nullableJsonSchema,
					}),
				),
				keyframes: z.array(
					z.object({
						responsiveConfig: z.record(z.any()).optional(),
						actions: z.array(z.any()),
						branchId: z.number(),
						description: z.string().nullable(),
						frameId: z.number().nullable(),
						id: z.number(),
						order: z.number(),
						pageId: z.number().nullable(),
						readingConfig: requiredJsonSchema,
						sceneId: z.number(),
						snapConfig: snapConfigSchema,
						title: z.string(),
					}),
				),
				paths: z.array(
					z.object({
						description: z.string().nullable(),
						fromSceneId: z.number(),
						fromKeyframeId: z.number().nullable(),
						fromBranchId: z.number(),
						id: z.number(),
						label: z.string(),
						order: z.number(),
						toSceneId: z.number(),
						toKeyframeId: z.number().nullable(),
						toBranchId: z.number(),
						type: pathTypeSchema,
					}),
				),
				pages: z.array(
					z.object({
						description: z.string().nullable(),
						entryId: z.number(),
						id: z.number(),
						isPaginated: z.boolean(),
						order: z.number(),
						partId: z.number(),
						title: z.string().nullable(),
						type: z.string(),
					}),
				),
				entries: z.array(
					z.object({
						description: z.string().nullable(),
						id: z.number(),
						isNumbered: z.boolean(),
						order: z.number(),
						partId: z.number(),
						title: z.string(),
						type: z.string(),
					}),
				),
				parts: z.array(
					z.object({
						description: z.string().nullable(),
						id: z.number(),
						order: z.number(),
						title: z.string(),
					}),
				),
				playbackConfig: talePlaybackConfigSchema,
				snapConfig: taleSnapConfigSchema,
				taleId: z.number(),
				title: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const result = await saveTaleStudioDraft(
				ctx.session.userId,
				input as SaveTaleStudioDraftInput,
			);
			const tale = await getTale({
				where: (model, { eq }) => eq(model.id, input.taleId),
			});
			return { ...result, tale };
		}),
});
