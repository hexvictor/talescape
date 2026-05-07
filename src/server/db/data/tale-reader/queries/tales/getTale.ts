import { db } from "~/server/db";
import { formatTaleStructure } from "../../formatters/tale/formatTaleStructure";
import type { Tale } from "../../types/tales";

type FindFirstTaleArgs = Parameters<typeof db.query.tales.findFirst>[0];

type TaleWhere = NonNullable<FindFirstTaleArgs>["where"];

type GetTaleArgs = {
	where: TaleWhere;
};

const taleStructureQuery = {
	book: true,
	creatorById: true,
	parts: {
		orderBy: (model, { asc }) => [asc(model.index)],
		with: {
			blocks: {
				columns: {
					id: true,
				},
				orderBy: (model, { asc }) => [asc(model.index)],
			},
			entries: {
				orderBy: (model, { asc }) => [asc(model.index)],
				with: {
					blocks: {
						columns: {
							id: true,
						},
						orderBy: (model, { asc }) => [asc(model.index)],
					},
					pages: {
						orderBy: (model, { asc }) => [asc(model.index)],
						with: {
							blocks: {
								columns: {
									id: true,
								},
								orderBy: (model, { asc }) => [asc(model.index)],
							},
						},
					},
				},
			},
		},
	},
	branches: {
		orderBy: (model, { asc }) => [asc(model.index)],
		with: {
			incomingPaths: {
				orderBy: (model, { asc }) => [asc(model.order)],
			},
			outgoingPaths: {
				orderBy: (model, { asc }) => [asc(model.order)],
			},
			sections: {
				orderBy: (model, { asc }) => [asc(model.index)],
				with: {
					blocks: {
						orderBy: (model, { asc }) => [asc(model.index)],
						with: {
							page: true,
							entry: true,
							part: true,
							fragments: {
								orderBy: (model, { asc }) => [asc(model.index)],
							},
						},
					},
				},
			},
		},
	},
} satisfies NonNullable<FindFirstTaleArgs>["with"];

function getTaleRecord({ where }: GetTaleArgs) {
	return db.query.tales.findFirst({
		where,
		with: taleStructureQuery,
	});
}

export type TaleRecord = NonNullable<Awaited<ReturnType<typeof getTaleRecord>>>;

export async function getTale({
	where,
}: GetTaleArgs): Promise<Tale | undefined> {
	const tale = await getTaleRecord({ where });

	if (!tale) return undefined;

	return formatTaleStructure(tale);
}
