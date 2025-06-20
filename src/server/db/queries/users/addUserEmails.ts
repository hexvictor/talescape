import "server-only";
import { db } from "~/server/db";
import { userEmails } from "~/server/db/schema";
import type { AddUserEmailsProps } from "./users.types";

export async function addUserEmails(emails: AddUserEmailsProps): Promise<void> {
  if (emails.length === 0) return;

  await db.insert(userEmails).values(emails);
}
