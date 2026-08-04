import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { blocks, nodes, tales } from "~/server/db/schema";
import type {
	NodeAnimationConfig,
	NodeConfig,
	ReaderStyleConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { userId1 } from "../ids";
import { readerPageBlueprints } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

type NodeSeed = {
	animationConfig: NodeAnimationConfig;
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
 * Inserts one root layout node for every seeded block.
 *
 * @returns Nothing.
 */
export async function seedNodes(): Promise<void> {
	logSeedStart("Nodes");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
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
		const style = rootNodeStyle(page);
		return {
			animationConfig: emptyNodeAnimations(),
			blockId: block.id,
			config: {
				align: "stretch",
				children: [],
				direction:
					page.readingDirection === "right"
						? "row-reverse"
						: page.readingDirection === "left"
							? "row"
							: page.readingDirection === "up"
								? "column-reverse"
								: "column",
				gap: page.layout === "fullscreen" ? 20 : 40,
				id: rootStableId,
				justify: "center",
				mode: "flex",
				overflow: "visible",
				parentNodeId: null,
				style,
				wrap: false,
			},
			isRoot: true,
			name: "root",
			order: 0,
			parentNodeId: null,
			stableId: rootStableId,
			styleConfig: style,
			taleId: tale.id,
		};
	});
	await db.insert(nodes).values(rootSeeds.map(toNodeInsert));
	logSeedComplete("Nodes");
}

/**
 * Creates empty animation selections for a seeded node.
 *
 * @returns Empty node animation configuration.
 */
function emptyNodeAnimations(): NodeAnimationConfig {
	return {
		ambient: { tracks: [] },
		entering: { tracks: [] },
		leaving: { tracks: [] },
		scrolling: { tracks: [] },
	};
}

/**
 * Converts an internal node seed into schema insert values.
 *
 * @param seed - Node seed using actual database parent ids.
 * @returns Node insert values.
 */
function toNodeInsert(seed: NodeSeed): typeof nodes.$inferInsert {
	return {
		...seed,
		cloneable: "private",
		creatorId: userId1,
		editable: true,
		isOfficial: true,
		isVerified: true,
		visibility: "public",
	};
}

/**
 * Creates a stable node identifier from an actual block id.
 *
 * @param blockId - Database block id.
 * @param role - Node role within the block.
 * @returns Stable node identifier.
 */
function stableNodeId(blockId: number, role: string): string {
	return `block-${blockId}-${role}`;
}

/**
 * Creates root flex styling for a page layout.
 *
 * @param page - Authored page definition.
 * @returns Root node style.
 */
function rootNodeStyle(
	page: (typeof readerPageBlueprints)[number],
): ReaderStyleConfig {
	if (page.layout === "horizontal") {
		return {
			alignItems: "center",
			display: "flex",
			flexDirection: page.readingDirection === "right" ? "row" : "row-reverse",
			gap: 48,
			justifyItems: "center",
			height: "100%",
			padding: "4rem",
			width: "100%",
		};
	}
	return {
		alignItems: "center",
		display: "flex",
		flexDirection: page.readingDirection === "up" ? "column-reverse" : "column",
		gap: 28,
		justifyItems: "center",
		margin: "0 auto",
		height: "100%",
		padding: page.layout === "fullscreen" ? "2rem" : "4rem 2rem",
		textAlign: "center",
		width: "100%",
	};
}
