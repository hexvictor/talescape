import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { updateReaderProgress } from "~/server/db/data/tale-reader/mutations/updateReaderProgress";

export const taleProgressRouter = createTRPCRouter({
	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				taleId: z.number(),
				updatedAt: z.date(),
				seenBlockIds: z.array(z.number()),
				lastBlockId: z.number().nullable(),
				maxBlockIdReached: z.number().nullable(),
				activePathIds: z.array(z.number()),
				seenPathIds: z.array(z.number()),
				seenBlockProgress: z.string(),
				maxReadProgress: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return updateReaderProgress(ctx.session.userId, input);
		}),
});
