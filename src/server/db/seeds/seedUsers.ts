import { db } from "..";
import { users } from "../schema";

export async function seedUsers() {
	await db.insert(users).values([
		{
			id: "user_2ydsCbXHNJd6Cl6ycKEeIQEnOX2",
			username: "user1",
			firstName: "Victor",
			lastName: "Oliveira",
			fullName: "Victor Oliveira",
			primaryEmailId: "idn_2ydsAcV6U0TXrj5E8JaRoxImBDP",
			emailVerifiedAt: new Date("2025-06-17T15:54:25.667Z"),
			imageUrl:
				"https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yeWRzQ2w4M2lEcWtMZ016QTgweWE0bjFQZWQifQ",
		},
		{
			id: "user_2ydsIYHFnj03ySTWvgkcgYXLvN0",
			username: "user2",
			firstName: "Victor",
			lastName: "Oliveira",
			fullName: "Victor Oliveira",
			primaryEmailId: "idn_2ydsHJCe923NyHZfpnMToPWTcc8",
			emailVerifiedAt: new Date("2025-06-17T15:55:05.671Z"),
			imageUrl:
				"https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yeWRzSVp6QlBwOE83VmxFOGZzMWFwRllSQ3gifQ",
		},
		{
			id: "user_2ymfvfM9UNBWEay4q9Ho2cGA3ZU",
			username: "hexvictor2",
			firstName: "Victor",
			lastName: "Oliveira",
			fullName: "Victor Oliveira",
			primaryEmailId: "idn_2ymfuPRTODMtgl9mFyePqL4RJIr",
			emailVerifiedAt: new Date("2025-06-20T18:41:52.500Z"),
			imageUrl:
				"https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18ydXM2VFU5czVtYXNlNGVydGE1UEV1VUZYcDAiLCJyaWQiOiJ1c2VyXzJ5bWZ2Zk05VU5CV0VheTRxOUhvMmNHQTNaVSIsImluaXRpYWxzIjoiVk8ifQ",
		},
	]);

	console.log("✅ Users seeded!");
}
