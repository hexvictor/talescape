import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import type { AddUserProps } from "./users.types";

export async function updateUser(user: AddUserProps): Promise<void> {
  await db
    .update(users)
    .set({
      username: user.username,
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      primaryEmailId: user.primaryEmailId,
      emailVerifiedAt: user.emailVerifiedAt,
    })
    .where(eq(users.id, user.id));
}
