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
					maxWidth: 640,
					orientation: "portrait",
					order: 0,
				},
				{
					id: "mobile-landscape",
					label: "Mobile Landscape",
					maxHeight: 640,
					maxWidth: 932,
					orientation: "landscape",
					order: 1,
				},
				{
					id: "tablet-portrait",
					label: "Tablet Portrait",
					maxWidth: 1024,
					minWidth: 641,
					orientation: "portrait",
					order: 2,
				},
				{
					id: "tablet-landscape",
					label: "Tablet Landscape",
					maxWidth: 1366,
					minWidth: 933,
					orientation: "landscape",
					order: 3,
				},
			],
			firstBlockTransitionMode: "inPlace",
			backgroundConfig: {
				dark: { color: "#070a0c", imageUrl: null },
				light: { color: "#fff8e8", imageUrl: null },
			},
			playbackConfig: {
				autoplay: {
					enabled: true,
					speed: 52,
					stopOn: { dragging: true, keyboard: true, scrolling: true },
				},
				interactions: { dragging: true, keyboard: true, scrolling: true },
			},
			snapConfig: {
				scrollSnap: {
					captureDistancePx: 96,
					delayMs: 240,
					durationSeconds: 0.22,
					minViewportFraction: 0,
				},
				snap: {
					captureDistancePx: 96,
					delayMs: 0,
					durationSeconds: 0.22,
					minViewportFraction: 0,
				},
			},
			type: "story",
			visibility: "public",
		},
	]);

	logSeedComplete("Tales");
}
