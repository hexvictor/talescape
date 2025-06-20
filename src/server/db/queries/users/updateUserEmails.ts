import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { userEmails } from "~/server/db/schema";
import type { AddUserEmailsProps } from "./users.types";

export async function updateUserEmails(
  emails: AddUserEmailsProps
): Promise<void> {
  if (!emails || !emails[0]) return;

  const userId = emails[0].userId;

  await db.delete(userEmails).where(eq(userEmails.userId, userId));
  await db.insert(userEmails).values(emails);
}
