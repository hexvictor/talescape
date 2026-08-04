import type { AnyColumn, SQL, SQLWrapper } from "drizzle-orm";
import { db } from "~/server/db";
import { formatTaleStructure } from "../../formatters/tale/formatTaleStructure";
import type { Tale } from "../../types/tales";

type FindFirstTaleArgs = Parameters<typeof db.query.tales.findFirst>[0];

type TaleWhere = NonNullable<FindFirstTaleArgs>["where"];

type GetTaleArgs = {
	where: TaleWhere;
};

type AscHelper = (column: SQLWrapper | AnyColumn) => SQL<unknown>;
type IdOrderModel = { id: AnyColumn; order: AnyColumn };
type BlockOrderModel = IdOrderModel & { pageOrder: AnyColumn };
type OrderContext = { asc: AscHelper };

const idOnlyColumns = {
	columns: {
		id: true,
	},
} as const;

/**
 * Orders relationship rows by order and id.
 *
 * @param model - Drizzle relation model with order and id columns.
 * @param context - Drizzle order helper context.
 * @returns Drizzle order expressions.
 *
 * @example
 * orderBy: orderByOrderAndId
 */
function orderByOrderAndId(
	model: IdOrderModel,
	{ asc }: OrderContext,
): SQL<unknown>[] {
	return [asc(model.order), asc(model.id)];
}

/**
 * Orders block relationship rows by order and page order.
 *
 * @param model - Drizzle block relation model.
 * @param context - Drizzle order helper context.
 * @returns Drizzle order expressions.
 *
 * @example
 * orderBy: orderBlocksByReaderOrder
 */
function orderBlocksByReaderOrder(
	model: BlockOrderModel,
	{ asc }: OrderContext,
): SQL<unknown>[] {
	return [asc(model.order), asc(model.pageOrder)];
}

const taleStructureQuery = {
	blocks: {
		orderBy: (model, { asc }) => [asc(model.order), asc(model.pageOrder)],
		with: {
			fragments: {
				...idOnlyColumns,
				orderBy: (model, { asc }) => [asc(model.order)],
			},
			nodes: {
				...idOnlyColumns,
				orderBy: orderByOrderAndId,
			},
		},
	},
	book: true,
	branches: {
		orderBy: (model, { asc }) => [asc(model.order)],
		with: {
			blocks: {
				...idOnlyColumns,
				orderBy: orderBlocksByReaderOrder,
			},
			incomingPaths: {
				...idOnlyColumns,
				orderBy: orderByOrderAndId,
			},
			outgoingPaths: {
				...idOnlyColumns,
				orderBy: orderByOrderAndId,
			},
		},
	},
	creatorById: true,
	entries: {
		orderBy: (model, { asc }) => [asc(model.order)],
		with: {
			blocks: {
				...idOnlyColumns,
				orderBy: orderBlocksByReaderOrder,
			},
			pages: {
				...idOnlyColumns,
				orderBy: orderByOrderAndId,
			},
		},
	},
	fragments: {
		orderBy: (model, { asc }) => [asc(model.order)],
	},
	nodes: {
		orderBy: (model, { asc }) => [asc(model.order), asc(model.id)],
	},
	pages: {
		orderBy: (model, { asc }) => [asc(model.order)],
		with: {
			blocks: {
				...idOnlyColumns,
				orderBy: orderBlocksByReaderOrder,
			},
		},
	},
	parts: {
		orderBy: (model, { asc }) => [asc(model.order)],
		with: {
			blocks: {
				...idOnlyColumns,
				orderBy: orderBlocksByReaderOrder,
			},
			entries: {
				...idOnlyColumns,
				orderBy: orderByOrderAndId,
			},
			pages: {
				...idOnlyColumns,
				orderBy: orderByOrderAndId,
			},
		},
	},
	paths: {
		orderBy: (model, { asc }) => [asc(model.order)],
	},
} satisfies NonNullable<FindFirstTaleArgs>["with"];

/**
 * Loads a tale row with every relationship required by the production reader.
 *
 * @param args - The database where clause for finding the tale.
 * @param args.where - The Drizzle relational query condition.
 * @returns The database tale record, or undefined when no tale matches.
 *
 * @example
 * const record = await getTaleRecord({ where });
 */
function getTaleRecord({ where }: GetTaleArgs) {
	return db.query.tales.findFirst({
		where,
		with: taleStructureQuery,
	});
}

/**
 * Loads active administrator-managed presets available to every tale.
 *
 * @returns The official preset rows grouped by preset type.
 *
 * @example
 * const officialPresets = await getOfficialReaderPresets();
 */
async function getOfficialReaderPresets() {
	const [
		animationPresets,
		blockStylePresets,
		transitionPresets,
		visibilityPresets,
	] = await Promise.all([
		db.query.officialAnimationPresets.findMany({
			orderBy: (model, { asc }) => [asc(model.sortOrder), asc(model.id)],
			where: (model, { eq }) => eq(model.isActive, true),
		}),
		db.query.officialStylePresets.findMany({
			orderBy: (model, { asc }) => [asc(model.sortOrder), asc(model.id)],
			where: (model, { eq }) => eq(model.isActive, true),
		}),
		db.query.officialTransitionPresets.findMany({
			orderBy: (model, { asc }) => [asc(model.sortOrder), asc(model.id)],
			where: (model, { eq }) => eq(model.isActive, true),
		}),
		db.query.officialVisibilityPresets.findMany({
			orderBy: (model, { asc }) => [asc(model.sortOrder), asc(model.id)],
			where: (model, { eq }) => eq(model.isActive, true),
		}),
	]);

	return {
		animationPresets,
		blockStylePresets,
		transitionPresets,
		visibilityPresets,
	};
}

/**
 * Gets and formats one tale for the production reader.
 *
 * @param args - The database where clause for finding the tale.
 * @param args.where - The Drizzle relational query condition.
 * @returns A formatted reader tale, or undefined when not found.
 *
 * @example
 * const tale = await getTale({ where });
 */
export async function getTale({
	where,
}: GetTaleArgs): Promise<Tale | undefined> {
	const [tale, officialPresets] = await Promise.all([
		getTaleRecord({ where }),
		getOfficialReaderPresets(),
	]);

	if (!tale) return undefined;

	return formatTaleStructure(tale, officialPresets);
}
