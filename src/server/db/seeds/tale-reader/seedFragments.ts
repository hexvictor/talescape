import { db } from "~/server/db";
import {
	type FragmentSchema,
	blocks,
	branches,
	entries,
	fragments,
	sections,
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
			entryId: blocks.entryId,
			sectionId: blocks.sectionId,
			pageId: blocks.pageId,
			index: blocks.index,
		})
		.from(blocks);

	const allEntries = await db
		.select({
			id: entries.id,
			title: entries.title,
			index: entries.index,
		})
		.from(entries);

	const allSections = await db
		.select({
			id: sections.id,
			branchId: sections.branchId,
			orientation: sections.orientation,
			direction: sections.direction,
			index: sections.index,
		})
		.from(sections);

	const allBranches = await db
		.select({
			id: branches.id,
			name: branches.name,
			index: branches.index,
		})
		.from(branches);

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

	const taleMap = new Map(allTales.map((tale) => [tale.id, tale] as const));
	const entryMap = new Map(
		allEntries.map((entry) => [entry.id, entry] as const),
	);
	const sectionMap = new Map(
		allSections.map((section) => [section.id, section] as const),
	);
	const branchMap = new Map(
		allBranches.map((branch) => [branch.id, branch] as const),
	);
	const blockOrdinalById = getBlockOrdinalById(allBlocks);

	const seeds: FragmentSeed[] = allBlocks.flatMap((block) => {
		const tale = taleMap.get(block.taleId);
		if (!tale) return [];

		const entry = entryMap.get(block.entryId) ?? null;
		const section = sectionMap.get(block.sectionId) ?? null;
		const branch = section ? (branchMap.get(section.branchId) ?? null) : null;
		const blockOrdinal = blockOrdinalById.get(block.id) ?? 0;
		const fragmentContext = {
			taleTitle: tale.title,
			taleId: block.taleId,
			branchName: branch?.name ?? "Main",
			entryTitle: entry?.title ?? "Untitled entry",
			sectionLabel: section
				? `${section.orientation} ${section.direction} section ${section.index + 1}`
				: "unplaced section",
			blockOrdinal,
			pageId: block.pageId,
		};
		const image = getFragmentImage(fragmentContext);

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
					content: getFragmentText(fragmentContext),
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
					url: image.url,
					alt: image.alt,
				},
			},
		];
	});

	await db.insert(fragments).values(seeds);
	console.log(`✅ Seeded ${seeds.length} fragments (2 per block).`);
}

type FragmentTextArgs = {
	taleTitle: string;
	taleId: number;
	branchName: string;
	entryTitle: string;
	sectionLabel: string;
	blockOrdinal: number;
	pageId: number | null;
};

type FragmentImage = {
	url: string;
	alt: string;
};

type ImageAsset = {
	fileName: string;
	altSubject: string;
};

type ImageAssetPool = readonly [ImageAsset, ...ImageAsset[]];

function getBlockOrdinalById(
	allBlocks: {
		id: number;
		entryId: number;
		index: number;
	}[],
) {
	const blocksByEntryId = new Map<number, typeof allBlocks>();

	for (const block of allBlocks) {
		const existing = blocksByEntryId.get(block.entryId) ?? [];
		existing.push(block);
		blocksByEntryId.set(block.entryId, existing);
	}

	const ordinalById = new Map<number, number>();

	for (const entryBlocks of blocksByEntryId.values()) {
		entryBlocks
			.sort((a, b) => a.id - b.id)
			.forEach((block, index) => {
				ordinalById.set(block.id, index);
			});
	}

	return ordinalById;
}

function getFragmentText(args: FragmentTextArgs) {
	if (args.taleId === 10) return getForkedFatesText(args);
	return getLinearTaleText(args);
}

function getFragmentImage(args: FragmentTextArgs): FragmentImage {
	if (args.taleId === 10) return getForkedFatesImage(args);
	return getLinearTaleImage(args);
}

function getLinearTaleImage({
	taleTitle,
	entryTitle,
	blockOrdinal,
}: FragmentTextArgs): FragmentImage {
	const assets = getLinearTaleImageAssets(taleTitle);
	const asset = pickImageAsset(assets, blockOrdinal);
	const beatLabel = getBeatImageLabel(blockOrdinal);

	return {
		url: createCommonsImageUrl(asset.fileName),
		alt: `${taleTitle}, ${entryTitle}: ${asset.altSubject} during the ${beatLabel.toLowerCase()}`,
	};
}

function getForkedFatesImage({
	branchName,
	entryTitle,
	blockOrdinal,
}: FragmentTextArgs): FragmentImage {
	const theme =
		forkedFatesImageAssetsByRoute[entryTitle] ??
		forkedFatesImageAssetsByRoute[branchName] ??
		defaultForkedFatesImageAssets;
	const asset = pickImageAsset(theme, blockOrdinal);
	const beatLabel = getBeatImageLabel(blockOrdinal);

	return {
		url: createCommonsImageUrl(asset.fileName),
		alt: `Forked Fates, ${entryTitle}: ${asset.altSubject} during the ${beatLabel.toLowerCase()}`,
	};
}

function getBeatImageLabel(blockOrdinal: number) {
	const labels = ["Opening", "Discovery", "Turn", "Consequence"];
	return labels[blockOrdinal] ?? `Beat ${blockOrdinal + 1}`;
}

function getLinearTaleImageAssets(taleTitle: string): ImageAssetPool {
	if (
		taleTitle.includes("Frost") ||
		taleTitle.includes("Ice") ||
		taleTitle.includes("Frozen")
	) {
		return frozenImageAssets;
	}

	if (
		taleTitle.includes("Ash") ||
		taleTitle.includes("Flames") ||
		taleTitle.includes("Ember") ||
		taleTitle.includes("Cinder")
	) {
		return emberImageAssets;
	}

	if (taleTitle.includes("Puppies")) {
		return puppyImageAssets;
	}

	return shadowImageAssets;
}

const frozenImageAssets = [
	{
		fileName: "Frozen Forest (Unsplash).jpg",
		altSubject: "a snowy evergreen forest from above",
	},
	{
		fileName: "Frozen winter forest (Unsplash).jpg",
		altSubject: "a hilled forest buried under winter cloud",
	},
	{
		fileName: "Above the frozen forest (Unsplash).jpg",
		altSubject: "a high view over a frozen mountain forest",
	},
	{
		fileName: "Watching A Frozen Waterfall In The Forest (Unsplash).jpg",
		altSubject: "a frozen waterfall hidden in the woods",
	},
] as const satisfies ImageAssetPool;

const emberImageAssets = [
	{
		fileName: "Strike fire (Unsplash).jpg",
		altSubject: "hot embers and flames in a firepit",
	},
	{
		fileName: "Glowing Embers (Unsplash).jpg",
		altSubject: "glowing embers on dark fireplace logs",
	},
	{
		fileName: "Bonfire flames (Unsplash).jpg",
		altSubject: "bright bonfire flames rising from firewood",
	},
	{
		fileName: "Heat of the Flames (Unsplash).jpg",
		altSubject: "burning logs in an outdoor firepit",
	},
] as const satisfies ImageAssetPool;

const tideImageAssets = [
	{
		fileName: "Ocean night.jpg",
		altSubject: "a dark ocean horizon at night",
	},
	{
		fileName: "Ocean of Stars.jpg",
		altSubject: "stars above a night beach",
	},
	{
		fileName: "Above the frozen forest (Unsplash).jpg",
		altSubject: "a cold wilderness seen from above",
	},
] as const satisfies ImageAssetPool;

const lanternImageAssets = [
	{
		fileName: "Night, street, lantern (45732183275).jpg",
		altSubject: "a lantern glowing over a night street",
	},
	{
		fileName: "White door with colors (Unsplash).jpg",
		altSubject: "a weathered bright door waiting at the end of a path",
	},
	{
		fileName: "Old door handle.jpg",
		altSubject: "an old metal handle on a mysterious door",
	},
] as const satisfies ImageAssetPool;

const doorImageAssets = [
	{
		fileName: "Black Door.jpg",
		altSubject: "a dark side door with a hard threshold",
	},
	{
		fileName: "White Door.jpg",
		altSubject: "a pale door suggesting a merciful exit",
	},
	{
		fileName: "Old door handle.jpg",
		altSubject: "an old handle waiting for a choice",
	},
] as const satisfies ImageAssetPool;

const puppyImageAssets = [
	{
		fileName: "Cute puppy running (Unsplash).jpg",
		altSubject: "a puppy running forward with bright energy",
	},
	{
		fileName: "Four puppies.jpg",
		altSubject: "four puppies waiting together",
	},
	{
		fileName: "Puppies (16717654917).jpg",
		altSubject: "puppies gathered in the open air",
	},
	{
		fileName: "A puppy.jpg",
		altSubject: "a young yellow puppy facing the camera",
	},
] as const satisfies ImageAssetPool;

const shadowImageAssets = [
	{
		fileName: "Night, street, lantern (45732183275).jpg",
		altSubject: "a quiet lantern-lit night street",
	},
	{
		fileName: "Black Door.jpg",
		altSubject: "a dark door with a secret beyond it",
	},
	{
		fileName: "Ocean of Stars.jpg",
		altSubject: "a starry night over open water",
	},
] as const satisfies ImageAssetPool;

const defaultForkedFatesImageAssets = shadowImageAssets;

const forkedFatesImageAssetsByRoute: Record<string, ImageAssetPool> = {
	Beginning: shadowImageAssets,
	"First Path": frozenImageAssets,
	"Second Path": emberImageAssets,
	"Second Path I": emberImageAssets,
	"Second Path II": emberImageAssets,
	"Third Path": tideImageAssets,
	"Fourth Path": lanternImageAssets,
	"Fourth Path I": lanternImageAssets,
	"Fourth Path II": lanternImageAssets,
	"The Choice": doorImageAssets,
	"The Good Choice": [
		{
			fileName: "White Door.jpg",
			altSubject: "a pale door opening toward mercy",
		},
		{
			fileName: "Ocean of Stars.jpg",
			altSubject: "a brighter night sky after a merciful choice",
		},
	],
	"The Bad Choice": [
		{
			fileName: "Black Door.jpg",
			altSubject: "a black door closing with certainty",
		},
		{
			fileName: "Glowing Embers (Unsplash).jpg",
			altSubject: "dark embers after a costly choice",
		},
	],
	Ending: [
		{
			fileName: "Ocean of Stars.jpg",
			altSubject: "stars over the final threshold",
		},
		{
			fileName: "Above the frozen forest (Unsplash).jpg",
			altSubject: "a wide final view over the chosen road",
		},
	],
};

function pickImageAsset(assets: ImageAssetPool, blockOrdinal: number) {
	return assets[blockOrdinal % assets.length] ?? assets[0];
}

function createCommonsImageUrl(fileName: string) {
	return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1200`;
}

function getLinearTaleText({
	taleTitle,
	entryTitle,
	sectionLabel,
	blockOrdinal,
	pageId,
}: FragmentTextArgs) {
	const pageLabel = pageId == null ? "opening panel" : `page ${blockOrdinal}`;
	const beats = [
		`${taleTitle} - ${entryTitle}. The scene opens in the ${sectionLabel}; this ${pageLabel} names the place, the danger, and the promise that pulls the reader forward.`,
		`${taleTitle} - ${entryTitle}. A second beat sharpens the conflict: someone makes a costly discovery, and the reader should feel the story moving deeper into trouble.`,
		`${taleTitle} - ${entryTitle}. The path bends. A clue, warning, or quiet betrayal changes what the characters believe about the journey.`,
		`${taleTitle} - ${entryTitle}. The entry closes with a clear turn: the next section should feel like a consequence, not a random continuation.`,
	];

	return beats[blockOrdinal] ?? beats.at(-1) ?? taleTitle;
}

function getForkedFatesText({
	branchName,
	entryTitle,
	sectionLabel,
	blockOrdinal,
	pageId,
}: FragmentTextArgs) {
	const pageLabel =
		pageId == null ? "branch opening" : `page beat ${blockOrdinal}`;
	const fallback = `[${branchName} / ${entryTitle}] In this ${sectionLabel}, ${pageLabel} keeps the branch readable and marks exactly where this route sits in Forked Fates.`;

	const beatsByEntry: Record<string, string[]> = {
		Beginning: [
			"[Beginning] The traveler reaches the moonlit causeway where four roads split from the same broken milestone.",
			"[Beginning] The marker shows four symbols: frost, ash, tide, and lantern. Each promises a different future.",
			"[Beginning] This is the first branch point. The next visible route depends on which path the reader chooses.",
		],
		"First Path": [
			"[First Path] The frost road bends left into a silent pine valley, and the traveler follows the cold blue lights.",
			"[First Path] A frozen bell rings under the snow, revealing that this route remembers every promise ever broken.",
			"[First Path] The frost road resolves quickly: it gives one answer and then flows directly toward the ending branch.",
		],
		"Second Path I": [
			"[Second Path I] The ash road descends through black grass where old watchfires still glow under the soil.",
			"[Second Path I] A cinder-crowned guide warns that this route is longer, split across more than one section.",
			"[Second Path I] The traveler accepts the ember map and continues downward toward the second half of the ash road.",
		],
		"Second Path II": [
			"[Second Path II] The ash road turns horizontal, crossing a bridge of warm iron above a river of sparks.",
			"[Second Path II] The guide admits the crown is not a prize but a burden waiting for someone desperate enough.",
			"[Second Path II] This route has no choice here; it continues by consequence toward the next revealed branch.",
		],
		"Third Path": [
			"[Third Path] The tide road moves right across glassy water, carrying the traveler between reflected stars.",
			"[Third Path] Beneath the surface, a second version of the traveler refuses to make the same mistake twice.",
			"[Third Path] The tide path closes cleanly and rolls onward to the shared ending branch.",
		],
		"Fourth Path I": [
			"[Fourth Path I] The lantern road begins bright and straight, but every lamp shows a different possible companion.",
			"[Fourth Path I] The traveler follows the warmest flame and hears a door unlocking somewhere ahead.",
			"[Fourth Path I] The lantern route does not end here; it leads into a second section before the true decision.",
		],
		"Fourth Path II": [
			"[Fourth Path II] The lantern road drops into a quiet stairwell lined with names the traveler almost remembers.",
			"[Fourth Path II] At the bottom waits a sealed hall with two handles: one silver, one black.",
			"[Fourth Path II] This route auto-continues into The Choice, where the reader must decide what kind of ending is earned.",
		],
		"The Choice": [
			"[The Choice] The silver handle promises mercy. The black handle promises certainty. Neither promise is free.",
			"[The Choice] The hall listens. The traveler can save a stranger at personal cost, or seize the answer alone.",
			"[The Choice] This is the second real branch point: Good Choice or Bad Choice should appear after this block.",
		],
		"The Good Choice": [
			"[The Good Choice] The traveler opens the silver door and gives up the map so the stranger can find daylight.",
			"[The Good Choice] The hall brightens. The route proves that mercy changes the ending, even when it costs direction.",
			"[The Good Choice] The good branch stands as its own ending route, marked clearly so the reader knows they chose compassion.",
		],
		"The Bad Choice": [
			"[The Bad Choice] The traveler opens the black door and keeps the answer, leaving the stranger in the dark hall.",
			"[The Bad Choice] The route moves right with a hard, metallic certainty; every step sounds like a lock closing.",
			"[The Bad Choice] This darker branch does not stop here. It auto-continues into the shared ending with a changed tone.",
		],
		Ending: [
			"[Ending] The roads meet beneath the dawn arch. What the traveler carries depends on the branch that brought them here.",
			"[Ending] Frost, ash, tide, lantern, mercy, or certainty all leave different traces on the final threshold.",
			"[Ending] The tale closes here. If the route felt different, the branch system is doing its job.",
		],
	};

	const beats = beatsByEntry[entryTitle];
	return beats?.[blockOrdinal] ?? fallback;
}
