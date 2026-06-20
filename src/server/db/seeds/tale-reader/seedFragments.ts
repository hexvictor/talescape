import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
	blocks,
	branches,
	entries,
	fragments,
	nodes,
	pages,
	paths,
	tales,
} from "~/server/db/schema";
import type { FragmentAnimationConfig } from "~/server/db/types/tale-reader/readerConfig";
import { userId1 } from "../ids";
import { readerPageBlueprints } from "./readerStoryBlueprint";
import { createReaderStoryText } from "./readerStoryText";
import { logSeedComplete, logSeedStart } from "./seedLogs";

const localImages = [
	"/reader-demo/thornwick-town.svg",
	"/reader-demo/thornwick-market.svg",
	"/reader-demo/thornwick-church.svg",
	"/reader-demo/thornwick-crypt.svg",
	"/reader-demo/thornwick-woods.svg",
] as const;

const externalImages = [
	"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
	"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
	"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80",
	"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
	"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
] as const;

type FragmentSeed = typeof fragments.$inferInsert;

/**
 * Inserts text, quote, image, choice, and return fragments for every block.
 *
 * @returns Nothing.
 */
export async function seedFragments(): Promise<void> {
	logSeedStart("Fragments");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	const [allBlocks, allBranches, allEntries, allPages, allNodes, allPaths] =
		await Promise.all([
			db
				.select({
					branchId: blocks.branchId,
					id: blocks.id,
					isChoiceBlock: blocks.isChoiceBlock,
					order: blocks.order,
					pageId: blocks.pageId,
				})
				.from(blocks)
				.where(eq(blocks.taleId, tale.id)),
			db
				.select({ id: branches.id, name: branches.name })
				.from(branches)
				.where(eq(branches.taleId, tale.id)),
			db
				.select({ id: entries.id, title: entries.title, type: entries.type })
				.from(entries)
				.where(eq(entries.taleId, tale.id)),
			db
				.select({
					entryId: pages.entryId,
					id: pages.id,
					order: pages.order,
					title: pages.title,
				})
				.from(pages)
				.where(eq(pages.taleId, tale.id)),
			db
				.select({
					blockId: nodes.blockId,
					config: nodes.config,
					id: nodes.id,
					name: nodes.name,
				})
				.from(nodes)
				.where(eq(nodes.taleId, tale.id)),
			db
				.select({
					fromBlockId: paths.fromBlockId,
					id: paths.id,
					label: paths.label,
					type: paths.type,
				})
				.from(paths)
				.where(eq(paths.taleId, tale.id)),
		]);
	const branchNameById = new Map(
		allBranches.map((branch) => [branch.id, branch.name]),
	);
	const entryById = new Map(allEntries.map((entry) => [entry.id, entry]));
	const pageById = new Map(allPages.map((page) => [page.id, page]));
	const pageBlueprintByOrder = new Map(
		readerPageBlueprints.map((page) => [page.order, page]),
	);
	const nodesByBlockId = groupBy(allNodes, (node) => node.blockId);
	const pathsByBlockId = groupBy(
		allPaths.filter((path) => path.fromBlockId !== null),
		(path) => path.fromBlockId as number,
	);

	const values = allBlocks.flatMap((block) => {
		const page = pageById.get(block.pageId);
		const blueprint = page && pageBlueprintByOrder.get(page.order);
		const entry = page && entryById.get(page.entryId);
		const contentNode = nodesByBlockId
			.get(block.id)
			?.find((node) => node.name === "content");
		if (!page || !blueprint || !entry || !contentNode) {
			throw new Error(`Incomplete fragment parents for block ${block.id}.`);
		}
		return createBlockFragments({
			block,
			branchName: branchNameById.get(block.branchId) ?? "main",
			contentNodeId: contentNode.id,
			entry,
			page,
			pageBlueprint: blueprint,
			paths: pathsByBlockId.get(block.id) ?? [],
			taleId: tale.id,
		});
	});
	const created = await db.insert(fragments).values(values).returning({
		id: fragments.id,
		nodeId: fragments.nodeId,
		placementConfig: fragments.placementConfig,
	});

	for (const node of allNodes) {
		const fragmentChildren = created
			.filter(
				(fragment) =>
					fragment.nodeId === node.id &&
					fragment.placementConfig.mode === "normal",
			)
			.map((fragment) => ({
				fragmentId: String(fragment.id),
				type: "fragment" as const,
			}));
		if (fragmentChildren.length === 0) continue;
		await db
			.update(nodes)
			.set({
				config: {
					...node.config,
					children: [...node.config.children, ...fragmentChildren],
				},
			})
			.where(eq(nodes.id, node.id));
	}
	logSeedComplete("Fragments");
}

type CreateBlockFragmentsInput = {
	block: {
		id: number;
		isChoiceBlock: boolean;
		order: number;
	};
	branchName: string;
	contentNodeId: number;
	entry: { title: string; type: string };
	page: { order: number; title: string | null };
	pageBlueprint: (typeof readerPageBlueprints)[number];
	paths: { id: number; label: string | null; type: string }[];
	taleId: number;
};

/**
 * Creates fragments appropriate for one fullscreen, chapter, or choice block.
 *
 * @param input - Actual parent rows and authored page metadata.
 * @returns Fragment insert values.
 */
function createBlockFragments(
	input: CreateBlockFragmentsInput,
): FragmentSeed[] {
	const {
		block,
		branchName,
		contentNodeId,
		entry,
		page,
		pageBlueprint,
		paths: blockPaths,
		taleId,
	} = input;
	const base = fragmentBase(block.id, taleId);
	const title = page.title ?? entry.title;
	if (block.isChoiceBlock) {
		if (blockPaths.length === 0) {
			throw new Error(`Choice block ${block.id} has no outgoing paths.`);
		}
		return [
			textFragment(base, contentNodeId, title, 0, true),
			...blockPaths.map((path, index) =>
				choiceFragment(base, contentNodeId, path, index + 1),
			),
		];
	}
	if (entry.type !== "chapter") {
		return [
			imageFragment(base, contentNodeId, title, page.order, 0, false),
			textFragment(base, contentNodeId, title, 1, true),
			...blockPaths.map((path, index) =>
				choiceFragment(base, contentNodeId, path, index + 2),
			),
		];
	}

	const horizontal = pageBlueprint.layout === "horizontal";
	return [
		textFragment(base, contentNodeId, title, 0, false),
		quoteFragment(
			base,
			contentNodeId,
			createReaderStoryText(title, branchName, true),
			1,
			horizontal,
		),
		imageFragment(base, contentNodeId, title, page.order, 2, horizontal),
		...blockPaths.map((path, index) =>
			choiceFragment(base, contentNodeId, path, index + 3),
		),
	];
}

/**
 * Creates a normal text fragment.
 *
 * @param base - Shared fragment fields.
 * @param nodeId - Parent content node id.
 * @param text - Fragment text.
 * @param order - Fragment order.
 * @param centered - Whether text should be centered.
 * @returns Text fragment seed.
 */
function textFragment(
	base: ReturnType<typeof fragmentBase>,
	nodeId: number,
	text: string,
	order: number,
	centered: boolean,
): FragmentSeed {
	return {
		...base,
		content: { content: text },
		data: { content: text },
		nodeId,
		order,
		placementConfig: { mode: "normal", nodeId: String(nodeId) },
		styleConfig: {
			fontSize: "clamp(2rem, 5vw, 4.5rem)",
			fontWeight: 800,
			lineHeight: 1.05,
			maxWidth: "52rem",
			textAlign: centered ? "center" : "left",
		},
		type: "text",
	};
}

/**
 * Creates a chapter quote fragment with connected enter and scroll scales.
 *
 * @param base - Shared fragment fields.
 * @param nodeId - Parent content node id.
 * @param text - Story text.
 * @param order - Fragment order.
 * @param horizontal - Whether the page scrolls horizontally.
 * @returns Quote fragment seed.
 */
function quoteFragment(
	base: ReturnType<typeof fragmentBase>,
	nodeId: number,
	text: string,
	order: number,
	horizontal: boolean,
): FragmentSeed {
	return {
		...base,
		animationConfig: {
			ambient: { cycleDurationMs: 2400, tracks: [] },
			entering: {
				tracks: [{ end: 1, from: 1, property: "scale", start: 0, to: 0.94 }],
			},
			leaving: { tracks: [] },
			scrolling: {
				tracks: [{ end: 0.7, from: 0.94, property: "scale", start: 0, to: 1 }],
			},
		},
		content: { attribution: "The Thornwick Ledger", text },
		data: { attribution: "The Thornwick Ledger", text },
		nodeId,
		order,
		placementConfig: { mode: "normal", nodeId: String(nodeId) },
		styleConfig: {
			fontSize: "clamp(1rem, 1.5vw, 1.3rem)",
			lineHeight: 1.8,
			width: "100%",
			maxWidth: "70vw",
		},
		type: "quote",
		visibleRange: { end: 1, start: 0 },
	};
}

/**
 * Creates a deterministic external image fragment with a local fallback.
 *
 * @param base - Shared fragment fields.
 * @param nodeId - Parent content node id.
 * @param title - Image alternative text context.
 * @param pageOrder - Tale-wide page order.
 * @param order - Fragment order.
 * @param horizontal - Whether the page scrolls horizontally.
 * @returns Image fragment seed.
 */
function imageFragment(
	base: ReturnType<typeof fragmentBase>,
	nodeId: number,
	title: string,
	pageOrder: number,
	order: number,
	horizontal: boolean,
): FragmentSeed {
	const source =
		externalImages[pageOrder % externalImages.length] ?? externalImages[0];
	const fallback =
		localImages[pageOrder % localImages.length] ?? localImages[0];
	return {
		...base,
		content: {
			alt: `Illustration for ${title}`,
			fallbackUrl: fallback,
			url: source,
		},
		data: { alt: `Illustration for ${title}`, url: source },
		nodeId,
		order,
		placementConfig: { mode: "normal", nodeId: String(nodeId) },
		styleConfig: {
			flexShrink: 0,
			height: horizontal ? "72vh" : "min(52vh, 34rem)",
			maxWidth: horizontal ? "65vw" : "48rem",
			objectFit: "cover",
			width: horizontal ? "65vw" : "100%",
		},
		type: "image",
	};
}

/**
 * Creates an unanimated choice or return button fragment.
 *
 * @param base - Shared fragment fields.
 * @param nodeId - Parent content node id.
 * @param path - Persisted path row.
 * @param order - Fragment order.
 * @returns Choice button fragment seed.
 */
function choiceFragment(
	base: ReturnType<typeof fragmentBase>,
	nodeId: number,
	path: { id: number; label: string | null; type: string },
	order: number,
): FragmentSeed {
	return {
		...base,
		content: {
			description:
				path.type === "return"
					? "Return to a previously visited choice."
					: path.type === "teleport"
						? "Revisit a prior block without changing the selected route."
						: "Choose the next route through Thornwick.",
			label: path.label ?? "Continue",
			pathId: String(path.id),
		},
		data: { label: path.label ?? "Continue", pathId: String(path.id) },
		nodeId,
		order,
		placementConfig: { mode: "normal", nodeId: String(nodeId) },
		styleConfig: { maxWidth: "34rem", width: "100%" },
		type: "choiceButton",
	};
}

/**
 * Creates common fragment insert values.
 *
 * @param blockId - Actual owning block id.
 * @param taleId - Actual owning tale id.
 * @returns Shared fragment fields.
 */
function fragmentBase(
	blockId: number,
	taleId: number,
): Pick<
	FragmentSeed,
	| "animationConfig"
	| "blockId"
	| "cloneable"
	| "creatorId"
	| "editable"
	| "isOfficial"
	| "isVerified"
	| "taleId"
	| "visibility"
> {
	return {
		animationConfig: emptyAnimationConfig(),
		blockId,
		cloneable: "private",
		creatorId: userId1,
		editable: true,
		isOfficial: true,
		isVerified: true,
		taleId,
		visibility: "public",
	};
}

/**
 * Creates an empty direct animation configuration.
 *
 * @returns Empty entity-owned animation tracks.
 */
function emptyAnimationConfig(): FragmentAnimationConfig {
	return {
		ambient: { cycleDurationMs: 2400, tracks: [] },
		entering: { tracks: [] },
		leaving: { tracks: [] },
		scrolling: { tracks: [] },
	};
}

/**
 * Groups rows by a derived key.
 *
 * @param rows - Rows to group.
 * @param getKey - Returns the grouping key for one row.
 * @returns Rows grouped by key.
 */
function groupBy<Row, Key>(
	rows: Row[],
	getKey: (row: Row) => Key,
): Map<Key, Row[]> {
	const groups = new Map<Key, Row[]>();
	for (const row of rows) {
		const key = getKey(row);
		groups.set(key, [...(groups.get(key) ?? []), row]);
	}
	return groups;
}
