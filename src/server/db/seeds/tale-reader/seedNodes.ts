import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { blocks, nodes, tales } from "~/server/db/schema";
import type {
	NodeConfig,
	ReaderStyleConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { userId1 } from "../ids";
import { readerPageBlueprints } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

type NodeSeed = {
	blockId: number;
	config: NodeConfig;
	isRoot: boolean;
	name: string;
	order: number;
	parentNodeId: number | null;
	stableId: string;
	styleConfig: ReaderStyleConfig;
	taleId: number;
};

/**
 * Queries real blocks and inserts root and nested layout nodes for every page.
 *
 * @returns Nothing.
 */
export async function seedNodes(): Promise<void> {
	logSeedStart("Nodes");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "official-tale-branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");
	const allBlocks = await db
		.select({ id: blocks.id, order: blocks.order })
		.from(blocks)
		.where(eq(blocks.taleId, tale.id));
	const pageByOrder = new Map(
		readerPageBlueprints.map((page) => [page.order, page]),
	);
	const rootSeeds = allBlocks.map((block): NodeSeed => {
		const page = pageByOrder.get(block.order);
		if (!page) throw new Error(`Missing page blueprint ${block.order}.`);
		const rootStableId = stableNodeId(block.id, "root");
		const contentStableId = stableNodeId(block.id, "content");
		const mediaStableId = stableNodeId(block.id, "media");
		const hasMediaNode = page.type === "chapter" && page.order % 3 === 0;
		const rootStyle = rootNodeStyle(page.type === "chapter", hasMediaNode);
		return {
			blockId: block.id,
			config: {
				children: [
					{ nodeId: contentStableId, type: "node" },
					...(hasMediaNode
						? [{ nodeId: mediaStableId, type: "node" as const }]
						: []),
				],
				id: rootStableId,
				mode: hasMediaNode ? "grid" : "flex",
				overflow: "visible",
				parentNodeId: null,
				style: rootStyle,
				...(hasMediaNode
					? { columns: 2, gap: 32, rows: 1 }
					: {
							align: "center" as const,
							direction: "column" as const,
							gap: 24,
							justify: "center" as const,
							wrap: false,
						}),
			} as NodeConfig,
			isRoot: true,
			name: "root",
			order: 0,
			parentNodeId: null,
			stableId: rootStableId,
			styleConfig: rootStyle,
			taleId: tale.id,
		};
	});
	const createdRoots = await db
		.insert(nodes)
		.values(rootSeeds.map(toNodeInsert))
		.returning({ blockId: nodes.blockId, id: nodes.id });
	const rootIdByBlockId = new Map(
		createdRoots.map((node) => [node.blockId, node.id]),
	);
	const childSeeds = allBlocks.flatMap((block): NodeSeed[] => {
		const page = pageByOrder.get(block.order);
		const rootId = rootIdByBlockId.get(block.id);
		if (!page || !rootId) throw new Error(`Missing root node for ${block.id}.`);
		const hasMediaNode = page.type === "chapter" && page.order % 3 === 0;
		const contentStyle = contentNodeStyle(
			page.type === "chapter",
			hasMediaNode,
		);
		const children: NodeSeed[] = [
			{
				blockId: block.id,
				config: {
					align: "stretch",
					children: [],
					direction: "column",
					gap: 24,
					id: stableNodeId(block.id, "content"),
					justify: "center",
					mode: "flex",
					overflow: "visible",
					parentNodeId: stableNodeId(block.id, "root"),
					style: contentStyle,
					wrap: false,
				},
				isRoot: false,
				name: "content",
				order: 1,
				parentNodeId: rootId,
				stableId: stableNodeId(block.id, "content"),
				styleConfig: contentStyle,
				taleId: tale.id,
			},
		];
		if (hasMediaNode) {
			const mediaStyle: ReaderStyleConfig = {
				alignItems: "center",
				display: "flex",
				justifyContent: "center",
				minHeight: "22rem",
				overflow: "hidden",
			};
			children.push({
				blockId: block.id,
				config: {
					align: "center",
					children: [],
					direction: "column",
					gap: 12,
					id: stableNodeId(block.id, "media"),
					justify: "center",
					mode: "flex",
					overflow: "clip",
					parentNodeId: stableNodeId(block.id, "root"),
					style: mediaStyle,
					wrap: false,
				},
				isRoot: false,
				name: "media",
				order: 2,
				parentNodeId: rootId,
				stableId: stableNodeId(block.id, "media"),
				styleConfig: mediaStyle,
				taleId: tale.id,
			});
		}
		return children;
	});

	await db.insert(nodes).values(childSeeds.map(toNodeInsert));
	logSeedComplete("Nodes");
}

/**
 * Converts an internal node seed into a schema insert object.
 *
 * @param seed - Node seed using actual database parent ids.
 * @returns Node insert values.
 */
function toNodeInsert(seed: NodeSeed): typeof nodes.$inferInsert {
	return {
		...seed,
		cloneable: "private" as const,
		creatorId: userId1,
		editable: true,
		isOfficial: true,
		isVerified: true,
		visibility: "public" as const,
	};
}

/**
 * Creates a stable node identifier derived from an actual database block id.
 *
 * @param blockId - Database block id.
 * @param role - Node role within the block.
 * @returns Stable node identifier.
 */
function stableNodeId(blockId: number, role: string): string {
	return `block-${blockId}-${role}`;
}

/**
 * Creates root layout styling for a page.
 *
 * @param isChapter - Whether this is a chapter page.
 * @param hasMediaNode - Whether the page uses a two-column media layout.
 * @returns Root node style.
 */
function rootNodeStyle(
	isChapter: boolean,
	hasMediaNode: boolean,
): ReaderStyleConfig {
	return {
		alignItems: "center",
		display: hasMediaNode ? "grid" : "flex",
		flexDirection: "column",
		gap: 32,
		gridTemplateColumns: hasMediaNode
			? "minmax(0, 1fr) minmax(18rem, 1fr)"
			: undefined,
		justifyContent: "center",
		minHeight: "100%",
		padding: isChapter ? "clamp(3rem, 8vh, 8rem) clamp(1.5rem, 7vw, 8rem)" : 0,
		width: "100%",
	};
}

/**
 * Creates content-column styling for a page.
 *
 * @param isChapter - Whether this is a chapter page.
 * @param hasMediaNode - Whether the page has a sibling media column.
 * @returns Content node style.
 */
function contentNodeStyle(
	isChapter: boolean,
	hasMediaNode: boolean,
): ReaderStyleConfig {
	return {
		alignItems: hasMediaNode ? "start" : "center",
		display: "flex",
		flexDirection: "column",
		gap: 24,
		justifyContent: "center",
		margin: hasMediaNode ? 0 : "0 auto",
		maxWidth: isChapter ? "64rem" : "52rem",
		minWidth: 0,
		padding: isChapter ? "clamp(1rem, 3vw, 3rem)" : "clamp(2rem, 8vw, 8rem)",
		textAlign: hasMediaNode ? "left" : "center",
		width: "100%",
	};
}
