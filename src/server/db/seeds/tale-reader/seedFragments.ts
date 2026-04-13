import { db } from "~/server/db";
import {
	blockEmbeds,
	fragments,
	type FragmentSchema,
} from "~/server/db/schema";

type FragmentSeed = Pick<
	FragmentSchema,
	| "creatorId"
	| "type"
	| "isOfficial"
	| "editable"
	| "visibility"
	| "embeddable"
	| "cloneable"
	| "status"
	| "data"
>;

const imageUrls = [
	"https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
	"https://images.unsplash.com/photo-1495567720989-cebdbdd97913",
	"https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
	"https://images.unsplash.com/photo-1602524815911-3292d1f684e5",
	"https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d",
	"https://images.unsplash.com/photo-1506744038136-46273834b3fb",
	"https://images.unsplash.com/photo-1481349518771-20055b2a7b24",
	"https://images.unsplash.com/photo-1508923567004-3a6b8004f3d3",
	"https://images.unsplash.com/photo-1515871204537-9e1e3c1a8b1b",
	"https://images.unsplash.com/photo-1482062364825-616fd23b8fc1",
];

export async function seedFragments() {
	const blockData = await db
		.select({
			blockId: blockEmbeds.blockId,
			taleId: blockEmbeds.taleId,
		})
		.from(blockEmbeds);

	const allFragments: FragmentSeed[] = blockData.flatMap(
		({ blockId }, index) => {
			const textFragment: FragmentSeed = {
				creatorId: null,
				type: "text",
				isOfficial: false,
				editable: true,
				visibility: "public",
				embeddable: "public",
				cloneable: "public",
				status: "published",
				data: {
					content: `This is a generated text fragment for block ${blockId}`,
				},
			};

			const imageFragment: FragmentSeed = {
				creatorId: null,
				type: "image",
				isOfficial: false,
				editable: true,
				visibility: "public",
				embeddable: "public",
				cloneable: "public",
				status: "published",
				data: {
					url: imageUrls[index % imageUrls.length] ?? "",
					alt: `Image for block ${blockId}`,
				},
			};

			return [textFragment, imageFragment];
		},
	);

	await db.insert(fragments).values(allFragments);
	console.log(`✅ Seeded ${allFragments.length} fragments (2 per block)`);
}
