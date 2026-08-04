import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { updateReaderProgress } from "~/server/db/data/tale-reader/mutations/updateReaderProgress";

export const taleProgressRouter = createTRPCRouter({
	update: protectedProcedure
		.input(
			z.object({
				blockId: z.string().nullable(),
				committedAnimationIds: z.array(z.string()),
				id: z.number(),
				innerProgress: z.number(),
				seenBlockIds: z.array(z.string()),
				seenEntryIds: z.array(z.string()),
				seenPageIds: z.array(z.string()),
				seenPartIds: z.array(z.string()),
				selectedBranchIds: z.array(z.string()),
				taleId: z.number(),
				updatedAt: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return updateReaderProgress(ctx.session.userId, input);
		}),
});
