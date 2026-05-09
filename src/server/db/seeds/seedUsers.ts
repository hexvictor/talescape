import { db } from "..";
import { users } from "../schema";
import { seedUserRecords } from "./ids";

export async function seedUsers() {
	const records = seedUserRecords.map(({ email, ...user }) => user);

	await db.insert(users).values(records);

	console.log("✅ Users seeded!");
}
