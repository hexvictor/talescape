import { tales } from "~/server/db/schema";
import { db } from "../..";
import { userId1, userId2 } from "../ids";

export async function seedTales() {
	const baseTales = [
		{
			creatorId: userId1,
			bookId: 1,
			title: "Frostbound Legacy",
			slug: "public-tale1",
			description:
				"In the heart of winter, ancient powers stir beneath the ice.",
			isOfficial: false,
			isVerified: false,
			editable: false,
			visibility: "public",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId2,
			bookId: 1,
			title: "Ashes of the Ember Crown",
			slug: "public-tale2",
			description: "Flames of rebellion rise as a forgotten kingdom awakens.",
			isOfficial: false,
			isVerified: false,
			editable: true,
			visibility: "public",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId1,
			bookId: 1,
			title: "Secrets Beneath the Ice",
			slug: "private-tale1",
			description: "A silent world hides lost truths frozen in time.",
			isOfficial: false,
			isVerified: false,
			editable: false,
			visibility: "private",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId2,
			bookId: 1,
			title: "Flames in the Shadows",
			slug: "private-tale2",
			description: "A fire burns quietly where no one dares to look.",
			isOfficial: false,
			isVerified: false,
			editable: true,
			visibility: "private",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId1,
			bookId: 1,
			title: "The Ice Warden's Oath",
			slug: "restricted-tale1",
			description: "A lone guardian watches over the frozen veil of time.",
			isOfficial: false,
			isVerified: false,
			editable: false,
			visibility: "restricted",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId1,
			bookId: 1,
			title: "Frozen Tides of Silence",
			slug: "restricted-tale2",
			description: "What was buried in snow may thaw into chaos.",
			isOfficial: false,
			isVerified: false,
			editable: false,
			visibility: "restricted",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId2,
			bookId: 1,
			title: "Embers Behind the Gate",
			slug: "restricted-tale3",
			description: "When flame meets iron, secrets are forged in defiance.",
			isOfficial: false,
			isVerified: false,
			editable: true,
			visibility: "restricted",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId2,
			bookId: 1,
			title: "Cinderwake",
			slug: "restricted-tale4",
			description: "A spark that should’ve died now threatens the world anew.",
			isOfficial: false,
			isVerified: false,
			editable: true,
			visibility: "restricted",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId1,
			bookId: 1,
			title: "Howl of Puppies",
			slug: "official-tale1",
			description: "Puppies howling in the wind.",
			isOfficial: true,
			isVerified: true,
			editable: true,
			visibility: "public",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId1,
			bookId: 1,
			title: "Forked Fates",
			slug: "official-tale-branched",
			description: "One official tale with multiple branching outcomes.",
			isOfficial: true,
			isVerified: true,
			editable: true,
			visibility: "public",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId1,
			bookId: 1,
			title: "Forked Fates - Snap Off",
			slug: "official-tale-branched-snap-off",
			description:
				"Forked Fates with the same branches and every block snap disabled.",
			isOfficial: true,
			isVerified: true,
			editable: true,
			visibility: "public",
			cloneable: "private",
			type: "story",
		},
		{
			creatorId: userId1,
			bookId: 1,
			title: "Forked Fates - Snap On",
			slug: "official-tale-branched-snap-on",
			description:
				"Forked Fates with the same branches and every block snap enabled.",
			isOfficial: true,
			isVerified: true,
			editable: true,
			visibility: "public",
			cloneable: "private",
			type: "story",
		},
	] as const;

	await db
		.insert(tales)
		.values([...baseTales, ...createSnapVariantTales(baseTales)]);

	console.log("✅ Tales seeded!");
}

function createSnapVariantTales(
	taleSeeds: readonly (typeof tales.$inferInsert)[],
) {
	return taleSeeds
		.filter((tale) => !tale.slug.includes("branched"))
		.flatMap((tale) => [
			{
				...tale,
				title: `${tale.title} - Snap Off`,
				slug: `${tale.slug}-snap-off`,
				description: `${tale.description} Every block snap disabled.`,
			},
			{
				...tale,
				title: `${tale.title} - Snap On`,
				slug: `${tale.slug}-snap-on`,
				description: `${tale.description} Every block snap enabled.`,
			},
		]);
}
