// server/db/seed.ts

import { db } from "../..";
import { talePermissions, tales } from "../../schema";
import { userId1, userId2 } from "../ids";

// You can call this in your main seed index file
export async function seedTalePermissions() {
	await db.insert(talePermissions).values([
		// restricted-tale1 (id: 5)
		{
			taleId: 5,
			userId: userId1,
			permissionTypes: ["viewer", "collaborator", "cloner"],
		},

		// restricted-tale2 (id: 6)
		{
			taleId: 6,
			userId: userId1,
			permissionTypes: ["viewer", "collaborator", "cloner"],
		},
		{
			taleId: 6,
			userId: userId2,
			permissionTypes: ["viewer", "collaborator", "cloner"],
		},

		// restricted-tale3 (id: 7)
		{
			taleId: 7,
			userId: userId2,
			permissionTypes: ["viewer", "collaborator", "cloner"],
		},

		// restricted-tale4 (id: 8)
		{
			taleId: 8,
			userId: userId2,
			permissionTypes: ["viewer", "collaborator", "cloner"],
		},
		{
			taleId: 8,
			userId: userId1,
			permissionTypes: ["viewer", "collaborator", "cloner"],
		},
	]);

	console.log("✅ Tales permissions seeded!");
}
