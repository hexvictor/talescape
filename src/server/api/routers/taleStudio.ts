import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
	addStudioBlock,
	removeStudioBlock,
} from "~/server/db/data/tale-reader/mutations/manageStudioBlocks";
import {
	type SaveTaleStudioDraftInput,
	saveTaleStudioDraft,
} from "~/server/db/data/tale-reader/mutations/saveTaleStudioDraft";

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
	addBlock: protectedProcedure
		.input(
			z.object({
				branchId: z.number().int().positive(),
				taleId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) => addStudioBlock(ctx.session.userId, input)),
	removeBlock: protectedProcedure
		.input(
			z.object({
				blockId: z.number().int().positive(),
				taleId: z.number().int().positive(),
			}),
		)
		.mutation(({ ctx, input }) => removeStudioBlock(ctx.session.userId, input)),
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
				blocks: z.array(
					z.object({
						branchId: z.number(),
						description: z.string().nullable(),
						id: z.number(),
						isChoiceBlock: z.boolean(),
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
				firstBlockTransitionMode: z.enum(["fromPlacement", "inPlace"]),
				fragments: z.array(
					z.object({
						animationConfig: animationConfigSchema,
						content: jsonRecordSchema,
						data: jsonRecordSchema,
						id: z.number(),
						nodeId: z.number().nullable(),
						order: z.number(),
						placementConfig: requiredJsonSchema,
						responsiveConfig: requiredJsonSchema,
						styleConfig: nullableJsonSchema,
						type: z.string(),
						visibleRange: nullableJsonSchema,
					}),
				),
				nodes: z.array(
					z.object({
						animationConfig: animationConfigSchema,
						config: requiredJsonSchema,
						id: z.number(),
						name: z.string().nullable(),
						order: z.number(),
						parentNodeId: z.number().nullable(),
						styleConfig: nullableJsonSchema,
					}),
				),
				paths: z.array(
					z.object({
						description: z.string().nullable(),
						fromBlockId: z.number(),
						fromBranchId: z.number(),
						id: z.number(),
						label: z.string(),
						order: z.number(),
						toBlockId: z.number(),
						toBranchId: z.number(),
						type: pathTypeSchema,
					}),
				),
				pages: z.array(
					z.object({
						description: z.string().nullable(),
						id: z.number(),
						isPaginated: z.boolean(),
						title: z.string().nullable(),
					}),
				),
				playbackConfig: talePlaybackConfigSchema,
				snapConfig: taleSnapConfigSchema,
				taleId: z.number(),
				title: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return saveTaleStudioDraft(
				ctx.session.userId,
				input as SaveTaleStudioDraftInput,
			);
		}),
});
