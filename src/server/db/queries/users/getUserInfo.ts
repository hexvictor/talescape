import "server-only";
import { db } from "~/server/db";
import type { PublicUserInfo } from "./users.types";
import type { users } from "../../schema";

type SearchableUserField = "id" | "username";

export async function getUserInfo(
  value: string,
  field: SearchableUserField = "id"
): Promise<PublicUserInfo | null> {
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u[field], value),
    columns: {
      id: true,
      username: true,
      fullName: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  };
}
