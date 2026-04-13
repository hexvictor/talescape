import { cache } from "react";
import type {
	BlockEmbedExtra,
	EmbeddedBlock,
} from "~/features/tale-reader/types/taleStructure";
import { db } from "~/server/db";

export async function getBlocksQuery(taleId: number): Promise<EmbeddedBlock[]> {
	const blockEmbeds = await db.query.blockEmbeds.findMany({
		where: (e, { eq }) => eq(e.taleId, taleId),
	});

	const embedMap = new Map<string, BlockEmbedExtra>();
	for (const embed of blockEmbeds) {
		if (embed.blockId !== null) {
			embedMap.set(String(embed.blockId), {
				sectionId: embed.sectionId,
				pageId: embed.pageId,
				index: embed.index,
				isSnap: embed.isSnap,
			});
		}
	}

	const blockIds = Array.from(embedMap.keys()).map(Number);
	const blocks = await db.query.blocks.findMany({
		where: (block, { inArray }) => inArray(block.id, blockIds),
	});

	return blocks.map((block) => {
		const embed = embedMap.get(String(block.id));
		if (!embed) throw new Error(`Missing embed data for block ${block.id}`);
		return {
			...block,
			...embed,
		};
	});
}

export const getBlocks = cache(getBlocksQuery);
