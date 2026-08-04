import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { images } from "~/server/db/schema";

/**
 * Exposes image persistence and public image discovery procedures.
 *
 * Image creation is authenticated so ownership always comes from the active
 * session rather than client input.
 */
export const imageRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({ name: z.string().min(1), url: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(images).values({
				name: input.name,
				url: input.url,
				userId: ctx.session.userId,
			});
		}),

	getImages: publicProcedure.query(async ({ ctx }) => {
		const image = await ctx.db.query.images.findMany({
			orderBy: (images, { desc }) => [desc(images.createdAt)],
		});

		return image ?? null;
	}),
});
