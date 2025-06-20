import type {
  BlockEmbedExtra,
  EmbeddedBlock,
} from "~/types/tale-reader/taleStructure";
import { db } from "~/server/db";
import { getBlocksByIds } from "../blocks";

export async function getBlocksWithEmbed(
  taleId: number
): Promise<EmbeddedBlock[]> {
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
      });
    }
  }

  const blockIds = Array.from(embedMap.keys()).map(Number);
  const blocks = await getBlocksByIds(blockIds);

  return blocks.map((block) => {
    const embed = embedMap.get(String(block.id));
    if (!embed) throw new Error(`Missing embed data for block ${block.id}`);
    return {
      ...block,
      ...embed,
    };
  });
}
