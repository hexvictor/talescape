import type { EntryType } from "~/server/db/types/tale-reader/entry";
import type { PageType } from "~/server/db/types/tale-reader/page";

export type ReaderEntryBlueprint = {
	description: string;
	order: number;
	pageCount: number;
	partOrder: number;
	title: string;
	type: EntryType;
};

export type ReaderPageBlueprint = {
	entryOrder: number;
	isPaginated: boolean;
	localOrder: number;
	order: number;
	title: string;
	type: PageType;
};

export const readerPartTitles = [
	"The Bell Below",
	"Streets of Ash",
	"The Divided Road",
	"Names in the Stone",
	"The Last Toll",
	"After the Echo",
] as const;

export const readerEntryBlueprints: ReaderEntryBlueprint[] = [
	entry(0, 0, "Forked Fates", "cover", 1),
	entry(1, 0, "The Bell That Rang Below", "prologue", 1),
	entry(2, 0, "A Knock Beneath Thornwick", "chapter", 3),
	entry(3, 0, "The Butcher's Warning", "chapter", 2),
	entry(4, 0, "Lanterns Without Flame", "chapter", 4),
	entry(5, 1, "Map of the Buried Streets", "map", 1),
	entry(6, 1, "The Market of Missing Names", "chapter", 2),
	entry(7, 1, "A Door in the Rain", "chapter", 5),
	entry(8, 1, "The Empty Belfry", "chapter", 2),
	entry(9, 1, "The First Descent", "chapter", 3),
	entry(10, 2, "Salt on the Threshold", "chapter", 2),
	entry(11, 2, "The Choir of Dust", "chapter", 4),
	entry(12, 2, "The First Choice", "chapter", 2),
	entry(13, 2, "What the Lantern Reveals", "chapter", 3),
	entry(14, 3, "A Breath Between Bells", "interlude", 1),
	entry(15, 3, "The River Under Stone", "chapter", 5),
	entry(16, 3, "The Keeper's Ledger", "chapter", 2),
	entry(17, 3, "The Name Mara Lost", "chapter", 3),
	entry(18, 3, "The Second Door", "chapter", 2),
	entry(19, 4, "Ash in the Nave", "chapter", 4),
	entry(20, 4, "The Bell's True Voice", "chapter", 2),
	entry(21, 4, "A Town Remembering", "chapter", 3),
	entry(22, 4, "The Quiet Before Dawn", "epilogue", 1),
	entry(23, 5, "The Last Road Home", "chapter", 5),
	entry(24, 5, "When Thornwick Woke", "ending", 1),
];

export const readerPageBlueprints: ReaderPageBlueprint[] = createPageBlueprints(
	readerEntryBlueprints,
);

const choiceEntryOrder = 12;

export const choicePageOrder =
	readerPageBlueprints
		.filter((page) => page.entryOrder === choiceEntryOrder)
		.slice(-1)[0]?.order ?? 0;

/**
 * Creates one authored entry definition.
 *
 * @param order - Tale-wide entry order.
 * @param partOrder - Parent part order.
 * @param title - Entry title.
 * @param type - Entry semantic type.
 * @param pageCount - Number of pages owned by the entry.
 * @returns One entry blueprint.
 */
function entry(
	order: number,
	partOrder: number,
	title: string,
	type: EntryType,
	pageCount: number,
): ReaderEntryBlueprint {
	return {
		description: `${title} in the branching Thornwick reader demonstration.`,
		order,
		pageCount,
		partOrder,
		title,
		type,
	};
}

/**
 * Expands entry definitions into globally ordered page definitions.
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
			const page: ReaderPageBlueprint = {
				entryOrder: entryBlueprint.order,
				isPaginated: entryBlueprint.type === "chapter",
				localOrder,
				order: pageOrder,
				title:
					entryBlueprint.pageCount === 1
						? entryBlueprint.title
						: `${entryBlueprint.title} ${localOrder + 1}`,
				type: pageTypeForEntry(entryBlueprint.type),
			};
			pageOrder += 1;
			return page;
		}),
	);
}

/**
 * Maps an entry semantic type to its page type.
 *
 * @param type - Entry type.
 * @returns Compatible page type.
 */
function pageTypeForEntry(type: EntryType): PageType {
	if (
		type === "cover" ||
		type === "prologue" ||
		type === "map" ||
		type === "interlude" ||
		type === "ending"
	) {
		return type;
	}
	if (type === "epilogue") return "custom";
	return "chapter";
}
