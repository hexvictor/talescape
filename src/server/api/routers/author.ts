import { desc } from "drizzle-orm";
import { z } from "zod";
import { getOrderBy } from "~/lib/utils/orderBy";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { authors } from "~/server/db/schema";

const createAuthorInputSchema = z.object({
  fullName: z.string().min(1, "Full name cannot be empty"),
  firstName: z.string().min(1, "First name cannot be empty").optional(),
  lastName: z.string().min(1, "Last name cannot be empty").optional(),
  biography: z.string().optional(),
  imageId: z.number().int("Image ID must be an integer").nullable().optional(),
});

const authorOrderByField = z.enum([
  "id",
  "fullName",
  "firstName",
  "lastName",
  "createdAt",
  "updatedAt",
]);
const sortDirection = z.enum(["asc", "desc"]);

const getAuthorsInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().min(0).optional(),
  orderBy: z
    .object({
      field: authorOrderByField,
      direction: sortDirection.default("desc"),
    })
    .optional(),
});
export const authorRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createAuthorInputSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(authors).values({
        fullName: input.fullName,
        firstName: input.firstName || null,
        lastName: input.lastName || null,
        biography: input.biography || null,
        imageId: input.imageId || null,
      });
    }),

  getAuthors: publicProcedure
    .input(getAuthorsInputSchema)
    .query(async ({ ctx, input }) => {
      const { limit, offset, orderBy } = input;

      const orderByClause = getOrderBy(authors, orderBy, [desc(authors.id)]);

      const allAuthors = await ctx.db.query.authors.findMany({
        limit: limit,
        offset: offset,
        orderBy: orderByClause,
      });
      return allAuthors;
    }),
  getAuthorById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const author = await ctx.db.query.authors.findFirst({
        where: (authors, { eq }) => eq(authors.id, input.id),
      });
      return author;
    }),
});
