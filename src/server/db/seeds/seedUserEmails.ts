import { db } from "..";
import { userEmails } from "../schema";
import { seedUserEmailRecords } from "./ids";

export async function seedUserEmails() {
	await db.insert(userEmails).values(seedUserEmailRecords);

	console.log("✅ User emails seeded!");
}
