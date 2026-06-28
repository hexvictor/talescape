import { db } from "~/server/db";
import { books, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Inserts the single official branching reader tale.
 *
 * @returns Nothing.
 */
export async function seedTales(): Promise<void> {
	logSeedStart("Tales");
	const [book] = await db.select({ id: books.id }).from(books).limit(1);

	await db.insert(tales).values([
		{
			bookId: book?.id ?? null,
			cloneable: "private",
			creatorId: userId1,
			description:
				"A production-shaped branching story through the buried streets of Thornwick.",
			editable: true,
			isOfficial: true,
			isVerified: true,
			slug: "branched",
			status: "published",
			title: "Forked Fates",
			breakpointConfig: [
				{
					id: "mobile-portrait",
					label: "Mobile Portrait",
					maxWidth: 768,
					orientation: "portrait",
					order: 0,
				},
				{
					id: "mobile-landscape",
					label: "Mobile Landscape",
					maxWidth: 1024,
					orientation: "landscape",
					order: 1,
				},
			],
			firstBlockTransitionMode: "fromPlacement",
			transitionFirstBlock: false,
			type: "story",
			visibility: "public",
		},
	]);

	logSeedComplete("Tales");
}
