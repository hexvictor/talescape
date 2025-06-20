import { db } from "~/server/db";

export async function getBlocksByIds(blockIds: number[]) {
  return await db.query.blocks.findMany({
    where: (block, { inArray }) => inArray(block.id, blockIds),
  });
}
