import "server-only";
import { db } from "..";
import { users } from "../schema";
import type { AddUserProps } from "../types/user";

export async function addUser({
	id,
	email,
	username,
	name,
	firstName,
	lastName,
	image,
	emailVerified,
}: AddUserProps): Promise<void> {
	await db.insert(users).values({
		id,
		email,
		username,
		name,
		firstName,
		lastName,
		image,
		emailVerified,
	});
}
