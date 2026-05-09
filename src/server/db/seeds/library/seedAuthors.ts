// server/db/seed.ts

import { authors } from "~/server/db/schema";
import { db } from "../..";

// You can call this in your main seed index file
export async function seedAuthors() {
	await db.insert(authors).values([
		{
			fullName: "Brandon Sanderson",
			firstName: "Brandon",
			lastName: "Sanderson",
			biography:
				"Brandon Winn Sanderson is an American author of high fantasy, science fiction, and young adult books. He is best known for the Cosmere fictional universe, in which most of his fantasy novels, most notably the Mistborn series and The Stormlight Archive, are set.",
			imageId: 1,
		},
	]);

	console.log("✅ Authors seeded!");
}
