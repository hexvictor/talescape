import type {
  FormattedTale,
  Tale,
  TaleData,
} from "~/features/tale-reader/types/taleStructure";
import { getUserInfo } from "~/server/db/queries/users";
import { db } from "~/server/db";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { getFormattedTale } from "~/features/tale-reader/services/getFormattedTale";
import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { createNewProgress } from "./createNewProgress";

export async function getOfficialTaleQuery(slug: string): Promise<TaleData> {
  const user = await auth();

  const tale = await db.query.tales.findFirst({
    where: (model, { eq, and }) =>
      and(
        eq(model.slug, slug),
        eq(model.visibility, "public"),
        eq(model.status, "published"),
        eq(model.isOfficial, true)
      ),
  });

  if (!tale) throw new TaleAccessError("Tale not found", 404);

  const formattedTale = await getFormattedTale(tale);
  const creator = tale.creatorId ? await getUserInfo(tale.creatorId) : null;
  if (user.userId === null) {
    // use localStorage to get the progress,  save the progress
    return { tale: { ...formattedTale, creator }, progress: null };
  }
  const progress = await db.query.taleProgresses.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.taleId, tale.id), eq(model.userId, user.userId)),
  });
  if (progress === undefined) {
    const newProgress = await createNewProgress(formattedTale, user.userId);
    return {
      tale: { ...formattedTale, creator },
      progress: newProgress,
    };
  }
  return { tale: { ...formattedTale, creator }, progress };
}

export const getOfficialTale = cache(getOfficialTaleQuery);
