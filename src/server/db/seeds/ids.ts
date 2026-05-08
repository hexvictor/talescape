const devUserId1 = "user_2ydsCbXHNJd6Cl6ycKEeIQEnOX2";
const devUserId2 = "user_2ydsIYHFnj03ySTWvgkcgYXLvN0";

const previewUserId1 = "user_2ymhkayaRPisrXkmWI05I13qj2m";
const previewUserId2 = "user_2ymhoyeoUYhg09DZixKuZ0rEFDm";

const seedTarget = process.env.SEED_TARGET ?? "dev";

const seedUserIds = {
	dev: {
		userId1: devUserId1,
		userId2: devUserId2,
	},
	preview: {
		userId1: previewUserId1,
		userId2: previewUserId2,
	},
} as const;

if (seedTarget !== "dev" && seedTarget !== "preview") {
	throw new Error(`Unsupported seed target: ${seedTarget}`);
}

const selectedUserIds = seedUserIds[seedTarget];

export const userId1 = process.env.SEED_USER_1_ID ?? selectedUserIds.userId1;

export const userId2 = process.env.SEED_USER_2_ID ?? selectedUserIds.userId2;

export const seedUserRecords = [
	{
		id: userId1,
		username: "user1",
		firstName: "Victor",
		lastName: "Oliveira",
		fullName: "Victor Oliveira",
		primaryEmailId: "idn_2ydsAcV6U0TXrj5E8JaRoxImBDP",
		emailVerifiedAt: new Date("2025-06-17T15:54:25.667Z"),
		imageUrl:
			"https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yeWRzQ2w4M2lEcWtMZ016QTgweWE0bjFQZWQifQ",
		email: "jvoliveiralive@gmail.com",
	},
	{
		id: userId2,
		username: "user2",
		firstName: "Victor",
		lastName: "Oliveira",
		fullName: "Victor Oliveira",
		primaryEmailId: "idn_2ydsHJCe923NyHZfpnMToPWTcc8",
		emailVerifiedAt: new Date("2025-06-17T15:55:05.671Z"),
		imageUrl:
			"https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yeWRzSVp6QlBwOE83VmxFOGZzMWFwRllSQ3gifQ",
		email: "jvictorddo@gmail.com",
	},
] as const;

export const seedUserEmailRecords = seedUserRecords.map((user) => ({
	id: user.primaryEmailId,
	userId: user.id,
	email: user.email,
}));
