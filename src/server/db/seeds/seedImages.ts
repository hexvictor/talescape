import { db } from "..";
import { images } from "../schema";

export async function seedImages() {
	await db.insert(images).values([
		{
			name: "Frostbound Legacy",
			url: "https://placehold.co/1200x800/1f2937/e5e7eb/png?text=Frostbound+Legacy",
			userId: null,
			isOfficial: true,
		},
		{
			name: "Ashes of the Ember Crown",
			url: "https://placehold.co/1200x800/0f172a/e2e8f0/png?text=Ashes+of+the+Ember+Crown",
			userId: null,
			isOfficial: true,
		},
		{
			name: "Secrets Beneath the Ice",
			url: "https://placehold.co/1200x800/172554/dbeafe/png?text=Secrets+Beneath+the+Ice",
			userId: null,
			isOfficial: true,
		},
		{
			name: "Flames in the Shadows",
			url: "https://placehold.co/1200x800/3f1d2e/fce7f3/png?text=Flames+in+the+Shadows",
			userId: null,
			isOfficial: true,
		},
		{
			name: "The Ice Warden's Oath",
			url: "https://placehold.co/1200x800/0c4a6e/e0f2fe/png?text=The+Ice+Warden%27s+Oath",
			userId: null,
			isOfficial: true,
		},
		{
			name: "Frozen Tides of Silence",
			url: "https://placehold.co/1200x800/312e81/e9d5ff/png?text=Frozen+Tides+of+Silence",
			userId: null,
			isOfficial: true,
		},
		{
			name: "Embers Behind the Gate",
			url: "https://placehold.co/1200x800/7c2d12/ffedd5/png?text=Embers+Behind+the+Gate",
			userId: null,
			isOfficial: true,
		},
		{
			name: "Cinderwake",
			url: "https://placehold.co/1200x800/14532d/dcfce7/png?text=Cinderwake",
			userId: null,
			isOfficial: true,
		},
		{
			name: "Howl of Puppies",
			url: "https://placehold.co/1200x800/422006/fef3c7/png?text=Howl+of+Puppies",
			userId: null,
			isOfficial: true,
		},
		{
			name: "Forked Fates",
			url: "https://placehold.co/1200x800/111827/f9fafb/png?text=Forked+Fates",
			userId: null,
			isOfficial: true,
		},
	]);

	console.log("✅ Images seeded!");
}
