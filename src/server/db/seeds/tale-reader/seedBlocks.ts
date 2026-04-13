import { db } from "~/server/db";
import { blocks } from "~/server/db/schema";
import { tales, entries } from "~/server/db/schema";
import type { BlockSchema } from "~/server/db/schema";

const BLOCKS_PER_ENTRY = 8;

type BlockSeed = Pick<
	BlockSchema,
	| "creatorId"
	| "isOfficial"
	| "editable"
	| "visibility"
	| "embeddable"
	| "cloneable"
	| "status"
>;

export async function seedBlocks() {
	const allEntries = await db
		.select({
			id: entries.id,
			taleId: entries.taleId,
			partId: entries.partId,
		})
		.from(entries);

	const taleMap = await db
		.select({
			id: tales.id,
			creatorId: tales.creatorId,
		})
		.from(tales);

	const taleCreatorMap = Object.fromEntries(
		taleMap.map((t) => [t.id, t.creatorId]),
	);

	const blockData: BlockSeed[] = allEntries.flatMap((entry) =>
		Array.from({ length: BLOCKS_PER_ENTRY }).map(() => ({
			creatorId: taleCreatorMap[entry.taleId] ?? null,
			isOfficial: false,
			editable: true,
			visibility: "public",
			embeddable: "public",
			cloneable: "public",
			status: "published",
		})),
	);

	await db.insert(blocks).values(blockData);

	console.log(
		`✅ Seeded ${blockData.length} blocks (${BLOCKS_PER_ENTRY} per entry).`,
	);
}
