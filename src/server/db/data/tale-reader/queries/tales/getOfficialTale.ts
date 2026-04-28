import { auth } from "@clerk/nextjs/server";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { db } from "~/server/db";
import type { TaleData } from "~/server/db/data/tale-reader/types/tales";

export async function getOfficialTaleQuery(
	slug: string,
): Promise<TaleData | undefined> {
	console.trace("auth called in getOfficialTaleQuery");
	const user = await auth();
	console.log("auth state:", {
		userId: user.userId,
		sessionId: user.sessionId,
		orgId: user.orgId,
	});

	const rawTale = await db.query.tales.findFirst({
		where: (model, { eq, and }) =>
			and(
				eq(model.slug, slug),
				eq(model.visibility, "public"),
				eq(model.isOfficial, true),
			),
		with: {
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
		},
	});

	if (!rawTale) throw new TaleAccessError("Tale not found", 404);

	console.log(rawTale);
	// const tale = formatTale(rawTale);

	// if (user.userId === null) {
	// 	return { tale, progress: null };
	// }

	// const progress = await db.query.taleProgresses.findFirst({
	// 	where: (model, { eq, and }) =>
	// 		and(eq(model.taleId, rawTale.id), eq(model.userId, user.userId)),
	// });

	// if (progress === undefined) {
	// 	const newProgress = await createNewProgress(
	// 		tale.id,
	// 		tale.structure.blockIds,
	// 		user.userId,
	// 	);

	// 	return { tale, progress: newProgress };
	// }

	// return { tale, progress };
	return undefined;
}

export const getOfficialTale = getOfficialTaleQuery;
