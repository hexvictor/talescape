import type { EntryType } from "~/server/db/types/tale-reader/entry";
import type { PageType } from "~/server/db/types/tale-reader/page";
import type { Direction } from "~/server/db/types/tale-reader/readerConfig";

export type ReaderPageLayout = "fullscreen" | "horizontal" | "vertical";

export type ReaderEntryBlueprint = {
	branchNames: readonly string[];
	description: string;
	isChoice: boolean;
	order: number;
	pageCount: number;
	partOrder: number;
	title: string;
	type: EntryType;
};

export type ReaderPageBlueprint = {
	branchNames: readonly string[];
	entryOrder: number;
	isChoice: boolean;
	isPaginated: boolean;
	layout: ReaderPageLayout;
	localOrder: number;
	order: number;
	readingDirection: Direction;
	title: string;
	type: PageType;
};

export type ReaderBranchBlueprint = {
	description: string;
	name: string;
	order: number;
	parentName: string | null;
	title: string;
};

export const readerBranchBlueprints: ReaderBranchBlueprint[] = [
	branch(0, "main", "The Main Route", null),
	branch(1, "lantern", "The Lantern Route", "main"),
	branch(2, "river", "The River Route", "main"),
	branch(3, "belfry", "The Belfry Route", "main"),
	branch(4, "lantern-vault", "The Lantern Vault", "lantern"),
	branch(5, "lantern-choir", "The Dust Choir", "lantern"),
	branch(6, "river-gate", "The River Gate", "river"),
	branch(7, "river-depths", "The River Depths", "river"),
	branch(8, "belfry-bells", "The Bell Chamber", "belfry"),
	branch(9, "belfry-roof", "The Belfry Roof", "belfry"),
];

export const readerPartTitles = [
	"The Bell Below",
	"The Three Roads",
	"Forks Beneath Thornwick",
	"The Last Toll",
	"After the Echo",
] as const;

export const readerEntryBlueprints: ReaderEntryBlueprint[] = [
	entry(0, 0, "Forked Fates", "cover", 1, ["main"]),
	entry(1, 0, "The Bell That Rang Below", "prologue", 1, ["main"]),
	entry(2, 0, "A Knock Beneath Thornwick", "chapter", 10, ["main"]),
	entry(3, 0, "Map of the Buried Streets", "map", 2, ["main"]),
	entry(4, 1, "The First Choice", "chapter", 1, ["main"], true),
	entry(5, 1, "The Keeper's Lantern", "chapter", 2, ["lantern"]),
	entry(6, 1, "The Lantern Fork", "chapter", 1, ["lantern"], true),
	entry(7, 1, "The Underground River", "chapter", 2, ["river"]),
	entry(8, 1, "The River Fork", "chapter", 1, ["river"], true),
	entry(9, 1, "The Empty Belfry", "chapter", 2, ["belfry"]),
	entry(10, 1, "The Belfry Fork", "chapter", 1, ["belfry"], true),
	entry(11, 2, "The Sealed Vault", "chapter", 2, ["lantern-vault"]),
	entry(12, 2, "The Choir of Dust", "chapter", 2, ["lantern-choir"]),
	entry(13, 2, "The Drowned Gate", "chapter", 2, ["river-gate"]),
	entry(14, 2, "Names in the Depths", "chapter", 2, ["river-depths"]),
	entry(15, 3, "The Chamber of Bells", "chapter", 2, ["belfry-bells"]),
	entry(16, 3, "Above the Storm", "chapter", 2, ["belfry-roof"]),
	entry(17, 4, "When Thornwick Woke", "ending", 1, [
		"lantern-vault",
		"lantern-choir",
		"river-gate",
		"river-depths",
		"belfry-bells",
		"belfry-roof",
	]),
];

export const readerPageBlueprints: ReaderPageBlueprint[] = createPageBlueprints(
	readerEntryBlueprints,
);

/**
 * Finds an authored page by entry and local page order.
 *
 * @param entryOrder - Tale-wide entry order.
 * @param localOrder - Page order inside the entry.
 * @returns Matching page blueprint.
 */
export function getReaderPageBlueprint(
	entryOrder: number,
	localOrder = 0,
): ReaderPageBlueprint {
	const page = readerPageBlueprints.find(
		(item) => item.entryOrder === entryOrder && item.localOrder === localOrder,
	);
	if (!page) {
		throw new Error(`Missing page blueprint ${entryOrder}:${localOrder}.`);
	}
	return page;
}

/**
 * Creates one authored branch definition.
 *
 * @param order - Tale-wide branch order.
 * @param name - Stable branch name.
 * @param title - Reader-facing branch title.
 * @param parentName - Parent branch name.
 * @returns Branch blueprint.
 */
function branch(
	order: number,
	name: string,
	title: string,
	parentName: string | null,
): ReaderBranchBlueprint {
	return {
		description: `${title}, a route through the Thornwick demonstration tale.`,
		name,
		order,
		parentName,
		title,
	};
}

/**
 * Creates one authored entry definition.
 *
 * @param order - Tale-wide entry order.
 * @param partOrder - Parent part order.
 * @param title - Entry title.
 * @param type - Entry semantic type.
 * @param pageCount - Number of pages owned by the entry.
 * @param branchNames - Branches that contain the entry.
 * @param isChoice - Whether the entry contains a choice block.
 * @returns Entry blueprint.
 */
function entry(
	order: number,
	partOrder: number,
	title: string,
	type: EntryType,
	pageCount: number,
	branchNames: readonly string[],
	isChoice = false,
): ReaderEntryBlueprint {
	return {
		branchNames,
		description: `${title} in the branching Thornwick reader demonstration.`,
		isChoice,
		order,
		pageCount,
		partOrder,
		title,
		type,
	};
}

/**
 * Expands entries into globally ordered page definitions.
 *
 * @param entries - Ordered entry blueprints.
 * @returns Tale-wide page blueprints.
 */
function createPageBlueprints(
	entries: ReaderEntryBlueprint[],
): ReaderPageBlueprint[] {
	let pageOrder = 0;
	return entries.flatMap((entryBlueprint) =>
		Array.from({ length: entryBlueprint.pageCount }, (_, localOrder) => {
			const layout = getPageLayout(entryBlueprint, localOrder);
			const page: ReaderPageBlueprint = {
				branchNames: entryBlueprint.branchNames,
				entryOrder: entryBlueprint.order,
				isChoice: entryBlueprint.isChoice,
				isPaginated: entryBlueprint.type === "chapter",
				layout,
				localOrder,
				order: pageOrder,
				readingDirection: getPageReadingDirection(layout, pageOrder),
				title:
					entryBlueprint.pageCount === 1
						? entryBlueprint.title
						: `${entryBlueprint.title} ${localOrder + 1}`,
				type: entryBlueprint.type,
			};
			pageOrder += 1;
			return page;
		}),
	);
}

/**
 * Selects the authored block layout for one page.
 *
 * @param entryBlueprint - Parent entry definition.
 * @param localOrder - Page order inside the entry.
 * @returns Fullscreen, horizontal, or vertical layout.
 */
function getPageLayout(
	entryBlueprint: ReaderEntryBlueprint,
	localOrder: number,
): ReaderPageLayout {
	if (entryBlueprint.type !== "chapter" || entryBlueprint.isChoice) {
		return "fullscreen";
	}
	return (entryBlueprint.order + localOrder) % 3 === 0
		? "horizontal"
		: "vertical";
}

/**
 * Selects the camera direction used while reading one authored page.
 *
 * @param layout - Page layout category.
 * @param pageOrder - Tale-wide page order.
 * @returns Direction shared by camera movement and incoming transition layout.
 *
 * @example
 * const direction = getPageReadingDirection("horizontal", 4);
 */
function getPageReadingDirection(
	layout: ReaderPageLayout,
	pageOrder: number,
): Direction {
	if (layout === "horizontal") {
		return pageOrder > 0 && pageOrder % 11 === 0 ? "left" : "right";
	}
	if (layout === "vertical") {
		return pageOrder > 0 && pageOrder % 13 === 0 ? "up" : "down";
	}
	return pageOrder > 0 && pageOrder % 9 === 0 ? "left" : "down";
}
