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
import { isContentSizedPage } from "./readerBlockSeedConfig";
import { choicePageOrder, readerPageBlueprints } from "./readerStoryBlueprint";
import { createReaderStoryText } from "./readerStoryText";
import { logSeedComplete, logSeedStart } from "./seedLogs";

const imageSources = [
	"/reader-demo/thornwick-town.svg",
	"/reader-demo/thornwick-market.svg",
	"/reader-demo/thornwick-church.svg",
	"/reader-demo/thornwick-crypt.svg",
	"/reader-demo/thornwick-woods.svg",
] as const;

type FragmentSeed = typeof fragments.$inferInsert;

/**
 * Queries real blocks, nodes, and paths and inserts page fragments.
 *
 * @returns Nothing.
 */
export async function seedFragments(): Promise<void> {
	logSeedStart("Fragments");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "official-tale-branched"));
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
					title: blocks.title,
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
					type: pages.type,
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
		const pageBlueprint = page && pageBlueprintByOrder.get(page.order);
		const entry = page && entryById.get(page.entryId);
		const blockNodes = nodesByBlockId.get(block.id) ?? [];
		const contentNode = blockNodes.find((node) => node.name === "content");
		const mediaNode = blockNodes.find((node) => node.name === "media");
		const rootNode = blockNodes.find((node) => node.name === "root");
		if (!page || !pageBlueprint || !entry || !contentNode || !rootNode) {
			throw new Error(`Incomplete fragment parents for block ${block.id}.`);
		}
		const branchName = branchNameById.get(block.branchId) ?? "main";
		return createBlockFragments({
			block,
			branchName,
			contentNodeId: contentNode.id,
			entry,
			mediaNodeId: mediaNode?.id,
			page,
			pageBlueprint,
			paths: pathsByBlockId.get(block.id) ?? [],
			rootNodeId: rootNode.id,
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
		title: string | null;
	};
	branchName: string;
	contentNodeId: number;
	entry: { id: number; title: string; type: string };
	mediaNodeId?: number;
	page: { id: number; order: number; title: string | null; type: string };
	pageBlueprint: (typeof readerPageBlueprints)[number];
	paths: { id: number; label: string | null; type: string }[];
	rootNodeId: number;
	taleId: number;
};

/**
 * Creates direct fragment rows for one block.
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
		mediaNodeId,
		page,
		pageBlueprint,
		paths: blockPaths,
		rootNodeId,
		taleId,
	} = input;
	const base = fragmentBase(block.id, taleId);
	const values: FragmentSeed[] = [];
	if (entry.type === "cover") {
		values.push(
			{
				...base,
				content: {
					alt: "Thornwick beneath a storm-dark sky",
					fallbackUrl: imageSources[0],
					url: imageSources[0],
				},
				data: { alt: "Thornwick", url: imageSources[0] },
				nodeId: rootNodeId,
				order: 0,
				placementConfig: {
					horizontal: "left",
					mode: "absolute",
					nodeId: String(rootNodeId),
					overflow: "clip",
					unit: "viewport",
					vertical: "top",
					width: 1,
					x: 0,
					y: 0,
					zIndex: 0,
				},
				styleConfig: {
					height: "100%",
					objectFit: "cover",
					width: "100%",
				},
				type: "image",
			},
			{
				...base,
				animationConfig: {
					entering: {
						tracks: [
							{
								end: 0.7,
								from: 0,
								property: "opacity",
								start: 0.15,
								to: 1,
							},
							{
								axis: "y",
								end: 0.8,
								from: 80,
								property: "translate",
								start: 0.15,
								to: 0,
							},
						],
					},
					leaving: { tracks: [] },
					scrolling: { tracks: [] },
				},
				content: { content: "Forked Fates" },
				data: { content: "Forked Fates" },
				nodeId: rootNodeId,
				order: 1,
				placementConfig: {
					horizontal: "left",
					mode: "absolute",
					nodeId: String(rootNodeId),
					overflow: "visible",
					unit: "viewport",
					vertical: "top",
					width: 0.8,
					x: 0.1,
					y: 0.42,
					zIndex: 2,
				},
				styleConfig: {
					color: "#fff7e6",
					fontSize: "clamp(3rem, 9vw, 8rem)",
					fontWeight: 800,
					textAlign: "center",
					width: "100%",
				},
				type: "text",
				visibleRange: { end: 1, start: 0.12 },
			},
		);
		return values;
	}

	values.push({
		...base,
		content: { content: entry.title },
		data: { content: entry.title },
		nodeId: contentNodeId,
		order: 0,
		placementConfig: { mode: "normal", nodeId: String(contentNodeId) },
		styleConfig: {
			fontSize: "clamp(2rem, 5vw, 4.5rem)",
			fontWeight: 800,
			lineHeight: 1.05,
			textAlign: mediaNodeId ? "left" : "center",
		},
		type: "text",
	});
	values.push({
		...base,
		animationConfig: {
			entering: { tracks: [] },
			leaving: { tracks: [] },
			scrolling: {
				tracks:
					page.order % 4 === 0
						? [
								{
									end: 0.5,
									from: 0,
									property: "opacity",
									start: 0.05,
									to: 1,
								},
								{
									axis: "y",
									end: 0.65,
									from: 36,
									property: "translate",
									start: 0.05,
									to: 0,
								},
							]
						: [],
			},
		},
		content: {
			attribution: branchName === "main" ? "The Thornwick Ledger" : branchName,
			text: createReaderStoryText(
				page.title ?? entry.title,
				branchName,
				isContentSizedPage(pageBlueprint),
			),
		},
		data: {
			attribution: "The Thornwick Ledger",
			text: createReaderStoryText(
				page.title ?? entry.title,
				branchName,
				isContentSizedPage(pageBlueprint),
			),
		},
		nodeId: contentNodeId,
		order: 1,
		placementConfig: { mode: "normal", nodeId: String(contentNodeId) },
		scrollAnimationPlayback: "commitOnComplete",
		styleConfig: {
			fontSize: "clamp(1rem, 1.5vw, 1.3rem)",
			lineHeight: 1.8,
			maxWidth: "58rem",
		},
		type: "quote",
		visibleRange: { end: 1, start: 0 },
	});
	if (mediaNodeId) {
		values.push({
			...base,
			content: {
				alt: `Illustration for ${page.title ?? entry.title}`,
				fallbackUrl: imageSource(page.order),
				url: imageSource(page.order),
			},
			data: {
				alt: `Illustration for ${page.title ?? entry.title}`,
				url: imageSource(page.order),
			},
			nodeId: mediaNodeId,
			order: 2,
			placementConfig: { mode: "normal", nodeId: String(mediaNodeId) },
			styleConfig: {
				height: "min(64dvh, 46rem)",
				objectFit: "cover",
				width: "100%",
			},
			type: "image",
		});
	}
	if (block.order % 8 === 0) {
		values.push({
			...base,
			animationConfig: {
				entering: { tracks: [] },
				leaving: { tracks: [] },
				scrolling: {
					tracks: [
						{
							end: 0.75,
							from: 0,
							property: "opacity",
							start: 0.35,
							to: 0.82,
						},
						{
							end: 0.9,
							from: -8,
							property: "rotate",
							start: 0.35,
							to: 8,
						},
					],
				},
			},
			content: {
				alt: "A small Thornwick illustration",
				fallbackUrl: imageSource(page.order + 2),
				url: imageSource(page.order + 2),
			},
			data: {
				alt: "A small Thornwick illustration",
				url: imageSource(page.order + 2),
			},
			nodeId: rootNodeId,
			order: 3,
			placementConfig: {
				horizontal: page.order % 2 === 0 ? "right" : "left",
				mode: "absolute",
				nodeId: String(rootNodeId),
				overflow: "visible",
				unit: "viewport",
				vertical: "bottom",
				width: 0.18,
				x: 0.04,
				y: 0.04,
				zIndex: 3,
			},
			styleConfig: { objectFit: "contain", width: "100%" },
			type: "image",
			visibleRange: { end: 1, start: 0.3 },
		});
	}
	for (const [pathIndex, path] of blockPaths.entries()) {
		values.push({
			...base,
			content: {
				description:
					path.type === "return"
						? "Return to an earlier moment on this route."
						: "Choose how Mara continues through Thornwick.",
				label: path.label ?? "Continue",
				pathId: String(path.id),
			},
			data: {
				label: path.label ?? "Continue",
				pathId: String(path.id),
			},
			nodeId: contentNodeId,
			order: 10 + pathIndex,
			placementConfig: { mode: "normal", nodeId: String(contentNodeId) },
			styleConfig: { maxWidth: "34rem", width: "100%" },
			type: "choiceButton",
			visibleRange: { end: 1, start: block.isChoiceBlock ? 0.55 : 0 },
		});
	}
	if (block.order === choicePageOrder && blockPaths.length === 0) {
		throw new Error("Choice block has no outgoing path fragments.");
	}
	return values;
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
	| "scrollAnimationPlayback"
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
		scrollAnimationPlayback: "scrub",
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
		entering: { tracks: [] },
		leaving: { tracks: [] },
		scrolling: { tracks: [] },
	};
}

/**
 * Groups rows by a derived key without requiring newer JavaScript collection APIs.
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

/**
 * Returns a deterministic local illustration source.
 *
 * @param order - Page or fragment order.
 * @returns Local public image path.
 */
function imageSource(order: number): string {
	return imageSources[order % imageSources.length] ?? imageSources[0];
}
