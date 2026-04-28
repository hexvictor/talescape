import { db } from "~/server/db";
import {
	type FragmentSchema,
	blocks,
	fragments,
	images,
	tales,
} from "~/server/db/schema";

type FragmentSeed = Pick<
	FragmentSchema,
	| "taleId"
	| "blockId"
	| "creatorId"
	| "type"
	| "index"
	| "isOfficial"
	| "editable"
	| "visibility"
	| "cloneable"
	| "data"
>;

export async function seedFragments() {
	const allBlocks = await db
		.select({
			id: blocks.id,
			taleId: blocks.taleId,
			creatorId: blocks.creatorId,
		})
		.from(blocks);

	const allTales = await db
		.select({
			id: tales.id,
			title: tales.title,
			isOfficial: tales.isOfficial,
			editable: tales.editable,
			visibility: tales.visibility,
			cloneable: tales.cloneable,
		})
		.from(tales);

	const allImages = await db
		.select({
			id: images.id,
			name: images.name,
			url: images.url,
		})
		.from(images);

	const taleMap = new Map(allTales.map((tale) => [tale.id, tale] as const));
	const imageMap = new Map(
		allImages.map((image) => [image.name, image.url] as const),
	);

	const seeds: FragmentSeed[] = allBlocks.flatMap((block) => {
		const tale = taleMap.get(block.taleId);
		if (!tale) return [];

		const imageUrl =
			imageMap.get(tale.title) ??
			"https://placehold.co/1200x800/111827/f9fafb/png?text=Talescape";

		return [
			{
				taleId: block.taleId,
				blockId: block.id,
				creatorId: block.creatorId,
				type: "text",
				index: 0,
				isOfficial: tale.isOfficial,
				editable: tale.editable,
				visibility: tale.visibility,
				cloneable: tale.cloneable,
				data: {
					content: `This is a generated text fragment for block ${block.id}.`,
				},
			},
			{
				taleId: block.taleId,
				blockId: block.id,
				creatorId: block.creatorId,
				type: "image",
				index: 1,
				isOfficial: tale.isOfficial,
				editable: tale.editable,
				visibility: tale.visibility,
				cloneable: tale.cloneable,
				data: {
					url: imageUrl,
					alt: `Image for block ${block.id}`,
				},
			},
		];
	});

	await db.insert(fragments).values(seeds);
	console.log(`✅ Seeded ${seeds.length} fragments (2 per block).`);
}
