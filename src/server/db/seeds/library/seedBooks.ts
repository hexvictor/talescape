// server/db/seed.ts

import { books } from "~/server/db/schema";
import { db } from "../..";
import { userId1 } from "../ids";

// You can call this in your main seed index file
export async function seedBooks() {
	await db.insert(books).values([
		{
			creatorId: userId1,
			title: "The Way of Kings",
			authorId: 1,
			description:
				"The Way of Kings is an epic fantasy novel written by American author Brandon Sanderson and the first book in The Stormlight Archive series.",
			coverImageId: 1,
			type: "official",
			status: "published",
			isOfficial: true,
			isVerified: true,
			editable: true,
			visibility: "public",
		},
	]);

	console.log("✅ Books seeded!");
}
