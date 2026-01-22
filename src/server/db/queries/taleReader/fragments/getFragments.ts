import { db } from "~/server/db";
import type {
  EmbeddedFragment,
  FragmentEmbedExtra,
} from "~/features/tale-reader/types/taleStructure";
import { cache } from "react";

export async function getFragmentsQuery(
  taleId: number
): Promise<EmbeddedFragment[]> {
  const fragmentEmbeds = await db.query.fragmentEmbeds.findMany({
    where: (e, { eq }) => eq(e.taleId, taleId),
  });

  const embedMap = new Map<string, FragmentEmbedExtra>();
  for (const embed of fragmentEmbeds) {
    if (embed.fragmentId !== null) {
      embedMap.set(String(embed.fragmentId), {
        blockId: embed.blockId,
        index: embed.index,
      });
    }
  }

  const fragmentIds = Array.from(embedMap.keys()).map(Number);
  const baseFragments = await db.query.fragments.findMany({
    where: (f, { inArray }) => inArray(f.id, fragmentIds),
  });

  return baseFragments.map((fragment) => {
    const embed = embedMap.get(String(fragment.id));
    if (!embed)
      throw new Error(`Missing embed data for fragment ${fragment.id}`);
    return {
      ...fragment,
      ...embed,
    };
  });
}
export const getFragments = cache(getFragmentsQuery);
