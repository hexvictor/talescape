import { db } from "..";
import { userEmails } from "../schema";

export async function seedUserEmails() {
	await db.insert(userEmails).values([
		{
			id: "idn_2ydsAcV6U0TXrj5E8JaRoxImBDP",
			userId: "user_2ydsCbXHNJd6Cl6ycKEeIQEnOX2",
			email: "jvoliveiralive@gmail.com",
		},
		{
			id: "idn_2ydsHJCe923NyHZfpnMToPWTcc8",
			userId: "user_2ydsIYHFnj03ySTWvgkcgYXLvN0",
			email: "jvictorddo@gmail.com",
		},
		{
			id: "idn_2ymfuPRTODMtgl9mFyePqL4RJIr",
			userId: "user_2ymfvfM9UNBWEay4q9Ho2cGA3ZU",
			email: "runeterrapathbuilder@gmail.com",
		},
	]);

	console.log("✅ User emails seeded!");
}
