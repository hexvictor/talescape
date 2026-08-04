import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
	type SaveTaleEditorDraftInput,
	saveTaleEditorDraft,
} from "~/server/db/data/tale-reader/mutations/saveTaleEditorDraft";

const jsonRecordSchema = z.record(z.string(), z.unknown());
const requiredJsonSchema = z.any();
const nullableJsonSchema = z.any().nullable();
const animationConfigSchema = z.any();
const pathTypeSchema = z.enum(["choice", "linear", "return", "teleport"]);
const snapConfigSchema = z.union([
	z.boolean(),
	z.object({
		mode: z.enum(["snap", "scroll-snap", "snap-off"]),
		settings: z
			.object({
				captureDistancePx: z.number().nullable().optional(),
				delayMs: z.number().nullable().optional(),
				durationSeconds: z.number().nullable().optional(),
				minViewportFraction: z.number().nullable().optional(),
			})
			.nullable()
			.optional(),
	}),
]);
const snapSettingsSchema = z.object({
	captureDistancePx: z.number().nullable().optional(),
	delayMs: z.number().nullable().optional(),
	durationSeconds: z.number().nullable().optional(),
	minViewportFraction: z.number().nullable().optional(),
});
const taleSnapConfigSchema = z.object({
	scrollSnap: snapSettingsSchema,
	snap: snapSettingsSchema,
});

export const taleEditorRouter = createTRPCRouter({
	saveDraft: protectedProcedure
		.input(
			z.object({
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
				snapConfig: taleSnapConfigSchema,
				taleId: z.number(),
				title: z.string(),
				transitionFirstBlock: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return saveTaleEditorDraft(
				ctx.session.userId,
				input as SaveTaleEditorDraftInput,
			);
		}),
});
