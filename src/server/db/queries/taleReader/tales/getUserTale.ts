import type {
  FormattedTale,
  Tale,
  TaleData,
} from "~/features/tale-reader/types/taleStructure";
import { getUserInfo, type PublicUserInfo } from "~/server/db/queries/users";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { getFormattedTale } from "~/features/tale-reader/services/getFormattedTale";
import { cache } from "react";
import { createNewProgress } from "./createNewProgress";

async function getUserTaleQuery(
  slug: string,
  creatorUsername: string
): Promise<TaleData> {
  const user = await auth();

  const creator = await getUserInfo(creatorUsername, "username");

  console.log(slug, creatorUsername);

  if (!creator) throw new Error("User not found");

  console.log("test");

  const tale = await db.query.tales.findFirst({
    where: (model, { eq, and }) =>
      and(
        eq(model.slug, slug),
        eq(model.creatorId, creator.id),
        eq(model.isOfficial, false),
        eq(model.status, "published")
      ),
  });

  console.log(tale);

  if (!tale) throw new TaleAccessError("Tale not found", 404);

  const partialTale = {
    id: tale.id,
    title: tale.title,
    slug: tale.slug,
    visibility: tale.visibility,
    type: tale.type,
  };

  if (tale.visibility === "private" || tale.visibility === "restricted") {
    if (user.userId === null) {
      throw new TaleAccessError("Unauthorized", 401, partialTale);
    }
    const progress = await db.query.taleProgresses.findFirst({
      where: (model, { eq, and }) =>
        and(eq(model.taleId, tale.id), eq(model.userId, user.userId)),
    });
    if (tale.visibility === "private") {
      if (user.userId === tale.creatorId) {
        const formattedTale = await getFormattedTale(tale);
        if (progress === undefined) {
          const newProgress = await createNewProgress(
            formattedTale,
            user.userId
          );
          return {
            tale: { ...formattedTale, creator },
            progress: newProgress,
          };
        }
        return { tale: { ...formattedTale, creator }, progress };
      }
      throw new TaleAccessError("Forbidden", 403, partialTale);
    }

    if (tale.visibility === "restricted") {
      const talePermissions = await db.query.talePermissions.findFirst({
        where: (model, { eq, and }) =>
          and(eq(model.taleId, tale.id), eq(model.userId, user.userId)),
      });
      if (
        user.userId === tale.creatorId ||
        talePermissions?.permissionTypes?.includes("viewer")
      ) {
        const formattedTale = await getFormattedTale(tale);
        if (progress === undefined) {
          const newProgress = await createNewProgress(
            formattedTale,
            user.userId
          );
          return {
            tale: { ...formattedTale, creator },
            progress: newProgress,
          };
        }
        return { tale: { ...formattedTale, creator }, progress };
      }
    }
  } else if (tale.visibility === "public" || tale.visibility === "unlisted") {
    const formattedTale = await getFormattedTale(tale);
    return { tale: { ...formattedTale, creator }, progress: null };
  }
  throw new TaleAccessError("Unexpected access case", 403, partialTale);
}

export const getUserTale = cache(getUserTaleQuery);
