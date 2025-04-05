import "server-only";
import { db } from "..";
import { users } from "../schema";

type AddUserProps = {
	id: string;
	email: string;
	username: string;
	name: string;
	firstName: string;
	lastName: string;
	image: string;
	emailVerified: Date;
};

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
