import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { images } from "~/server/db/schema";

export const imageRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1), url: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(images).values({
        name: input.name,
        url: input.url,
        userId: "1",
      });
    }),

  getImages: publicProcedure.query(async ({ ctx }) => {
    const image = await ctx.db.query.images.findMany({
      orderBy: (images, { desc }) => [desc(images.createdAt)],
    });

    return image ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
