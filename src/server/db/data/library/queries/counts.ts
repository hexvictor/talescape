import "server-only";

import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import {
	authors,
	blocks,
	books,
	branches,
	entries,
	fragments,
	pages,
	parts,
	paths,
	tales,
} from "~/server/db/schema";
import {
	authorAccessCondition,
	blockAccessCondition,
	bookAccessCondition,
	branchAccessCondition,
	fragmentAccessCondition,
	getSignedInLibraryUser,
	pathAccessCondition,
	taleAccessCondition,
	visibleTaleByIdCondition,
} from "./access";

export async function getLibraryCounts() {
	const { userId } = await getSignedInLibraryUser();

	const [
		booksCount,
		authorsCount,
		talesCount,
		branchesCount,
		blocksCount,
		fragmentsCount,
		pathsCount,
		partsCount,
		entriesCount,
		pagesCount,
	] = await Promise.all([
		getVisibleBookCount(userId),
		getVisibleAuthorCount(userId),
		getVisibleTaleCount(userId),
		getVisibleBranchCount(userId),
		getVisibleBlockCount(userId),
		getVisibleFragmentCount(userId),
		getVisiblePathCount(userId),
		getVisiblePartCount(userId),
		getVisibleEntryCount(userId),
		getVisiblePageCount(userId),
	]);

	return {
		books: booksCount,
		authors: authorsCount,
		tales: talesCount,
		nodes: branchesCount + blocksCount + fragmentsCount,
		branches: branchesCount,
		blocks: blocksCount,
		fragments: fragmentsCount,
		paths: pathsCount,
		parts: partsCount,
		entries: entriesCount,
		pages: pagesCount,
	};
}

export async function getCountsByTaleIds(
	taleIds: number[],
	userId: string | null,
) {
	if (taleIds.length === 0) {
		return {
			branches: new Map<number, number>(),
			blocks: new Map<number, number>(),
			fragments: new Map<number, number>(),
			paths: new Map<number, number>(),
			parts: new Map<number, number>(),
			entries: new Map<number, number>(),
			pages: new Map<number, number>(),
		};
	}

	const [
		branchCounts,
		blockCounts,
		fragmentCounts,
		pathCounts,
		partCounts,
		entryCounts,
		pageCounts,
	] = await Promise.all([
		db
			.select({ taleId: branches.taleId, value: count() })
			.from(branches)
			.where(
				and(
					inArray(branches.taleId, taleIds),
					branchAccessCondition(branches.id, branches, userId),
				),
			)
			.groupBy(branches.taleId),
		db
			.select({ taleId: blocks.taleId, value: count() })
			.from(blocks)
			.where(
				and(
					inArray(blocks.taleId, taleIds),
					blockAccessCondition(blocks.id, blocks, userId),
				),
			)
			.groupBy(blocks.taleId),
		db
			.select({ taleId: fragments.taleId, value: count() })
			.from(fragments)
			.where(
				and(
					inArray(fragments.taleId, taleIds),
					fragmentAccessCondition(fragments.id, fragments, userId),
				),
			)
			.groupBy(fragments.taleId),
		db
			.select({ taleId: paths.taleId, value: count() })
			.from(paths)
			.innerJoin(tales, eq(tales.id, paths.taleId))
			.where(
				and(
					inArray(paths.taleId, taleIds),
					pathAccessCondition(paths.id, paths, userId),
				),
			)
			.groupBy(paths.taleId),
		db
			.select({ taleId: parts.taleId, value: count() })
			.from(parts)
			.where(inArray(parts.taleId, taleIds))
			.groupBy(parts.taleId),
		db
			.select({ taleId: entries.taleId, value: count() })
			.from(entries)
			.where(inArray(entries.taleId, taleIds))
			.groupBy(entries.taleId),
		db
			.select({ taleId: pages.taleId, value: count() })
			.from(pages)
			.where(inArray(pages.taleId, taleIds))
			.groupBy(pages.taleId),
	]);

	return {
		branches: toCountMap(branchCounts),
		blocks: toCountMap(blockCounts),
		fragments: toCountMap(fragmentCounts),
		paths: toCountMap(pathCounts),
		parts: toCountMap(partCounts),
		entries: toCountMap(entryCounts),
		pages: toCountMap(pageCounts),
	};
}

async function getVisibleBookCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(books)
		.where(bookAccessCondition(userId));

	return row?.value ?? 0;
}

async function getVisibleAuthorCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(authors)
		.where(authorAccessCondition(userId));

	return row?.value ?? 0;
}

async function getVisibleTaleCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(tales)
		.where(taleAccessCondition(userId));

	return row?.value ?? 0;
}

async function getVisibleBranchCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(branches)
		.where(
			and(
				visibleTaleByIdCondition(branches.taleId, userId),
				branchAccessCondition(branches.id, branches, userId),
			),
		);

	return row?.value ?? 0;
}

async function getVisibleBlockCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(blocks)
		.where(
			and(
				visibleTaleByIdCondition(blocks.taleId, userId),
				blockAccessCondition(blocks.id, blocks, userId),
			),
		);

	return row?.value ?? 0;
}

async function getVisibleFragmentCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(fragments)
		.where(
			and(
				visibleTaleByIdCondition(fragments.taleId, userId),
				fragmentAccessCondition(fragments.id, fragments, userId),
			),
		);

	return row?.value ?? 0;
}

async function getVisiblePathCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(paths)
		.innerJoin(tales, eq(tales.id, paths.taleId))
		.where(
			and(
				taleAccessCondition(userId),
				pathAccessCondition(paths.id, paths, userId),
			),
		);

	return row?.value ?? 0;
}

async function getVisiblePartCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(parts)
		.where(visibleTaleByIdCondition(parts.taleId, userId));

	return row?.value ?? 0;
}

async function getVisibleEntryCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(entries)
		.where(visibleTaleByIdCondition(entries.taleId, userId));

	return row?.value ?? 0;
}

async function getVisiblePageCount(userId: string | null) {
	const [row] = await db
		.select({ value: count() })
		.from(pages)
		.where(visibleTaleByIdCondition(pages.taleId, userId));

	return row?.value ?? 0;
}

function toCountMap(rows: { taleId: number; value: number }[]) {
	return new Map(rows.map((row) => [row.taleId, row.value]));
}
