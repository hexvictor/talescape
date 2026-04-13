import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { taleProgresses } from "~/server/db/schema";

export const taleProgressRouter = createTRPCRouter({
	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				taleId: z.number(),
				userId: z.string(),
				updatedAt: z.date(),
				seenBlockIds: z.array(z.number()),
				lastBlockId: z.number().nullable(),
				maxBlockIdReached: z.number().nullable(),
				seenBlockProgress: z.string(),
				linearReadProgress: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...dataToUpdate } = input;

			const [progress] = await ctx.db
				.update(taleProgresses)
				.set(dataToUpdate)
				.where(eq(taleProgresses.id, id))
				.returning();

			if (!progress) {
				throw new Error("Failed to update tale progress");
			}

			return progress;
		}),
});
