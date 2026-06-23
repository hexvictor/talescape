import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getOrderBy } from "~/lib/utils/orderBy";
import { createWhereConditions } from "~/lib/utils/whereConditions";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { books } from "~/server/db/schema";

const createBookInputSchema = z.object({
	title: z.string().min(1, "Title cannot be empty"),
	authorId: z
		.number()
		.int("Author ID must be an integer")
		.nullable()
		.optional(),
	description: z.string().nullable().optional(),
	coverImageId: z
		.number()
		.int("Cover Image ID must be an integer")
		.nullable()
		.optional(),
	type: z
		.enum([
			"user",
			"official",
			// "community",
			// "fanfiction",
			// "translation",
		])
		.optional(),
	status: z
		.enum(["draft", "published", "private", "archived", "deleted"])
		.optional(),
});

const bookOrderByField = z.enum(["id", "title", "createdAt", "updatedAt"]);
const sortDirection = z.enum(["asc", "desc"]);

const getBooksInputSchema = z.object({
	limit: z.number().int().positive().max(100).optional(),
	offset: z.number().int().min(0).optional(),
	orderBy: z
		.object({
			field: bookOrderByField,
			direction: sortDirection.default("desc"),
		})
		.optional(),
	status: z
		.union([
			z.enum(["draft", "published", "private", "archived", "deleted"] as const),
			z.array(
				z.enum([
					"draft",
					"published",
					"private",
					"archived",
					"deleted",
				] as const),
			),
		])
		.optional(),
	type: z
		.union([
			z.enum(["official", "user"] as const),
			z.array(z.enum(["official", "user"] as const)),
		])
		.optional(),
});

/**
 * Exposes validated book creation and library book queries.
 */
export const bookRouter = createTRPCRouter({
	create: protectedProcedure
		.input(createBookInputSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(books).values({
				title: input.title,
				authorId: input.authorId || null,
				creatorId: ctx.session.userId,
				description: input.description || null,
				coverImageId: input.coverImageId || null,
				type: input.type,
				status: input.status,
			});
		}),

	getBooks: publicProcedure
		.input(getBooksInputSchema)
		.query(async ({ ctx, input }) => {
			const { limit, offset, orderBy, status, type } = input;

			const orderByClause = getOrderBy(books, orderBy, [desc(books.id)]);

			const dynamicFilters = {
				status: status,
				type: type,
			};

			const whereClause = createWhereConditions(books, dynamicFilters);

			const allBooks = await ctx.db.query.books.findMany({
				limit: limit,
				offset: offset,
				orderBy: orderByClause,
				where: whereClause,
				with: {
					author: true,
					creator: true,
					coverImage: true,
				},
			});
			return allBooks;
		}),

	getMyBooks: protectedProcedure
		.input(getBooksInputSchema)
		.query(async ({ ctx, input }) => {
			const { limit, offset, orderBy, status, type } = input;

			const orderByClause = getOrderBy(books, orderBy, [desc(books.id)]);

			const dynamicFilters = {
				status: status,
				type: type,
			};

			const requiredConditions = [eq(books.creatorId, ctx.session.userId)];

			const whereClause = createWhereConditions(
				books,
				dynamicFilters,
				requiredConditions,
			);

			const myBooks = await ctx.db.query.books.findMany({
				limit: limit,
				offset: offset,
				orderBy: orderByClause,
				where: whereClause,
				with: {
					author: true,
					creator: true,
					coverImage: true,
				},
			});
			return myBooks;
		}),

	getBookById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const book = await ctx.db.query.books.findFirst({
				where: (books, { eq }) => eq(books.id, input.id),
				with: {
					author: true,
					creator: true,
					coverImage: true,
				},
			});
			return book;
		}),
});
