import "server-only";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import type { AddUserProps } from "./users.types";

export async function addUser({
	id,
	username,
	imageUrl,
	firstName,
	lastName,
	fullName,
	primaryEmailId,
	emailVerifiedAt,
}: AddUserProps): Promise<void> {
	await db.insert(users).values({
		id,
		username,
		imageUrl,
		firstName,
		lastName,
		fullName,
		primaryEmailId,
		emailVerifiedAt,
	});
}
