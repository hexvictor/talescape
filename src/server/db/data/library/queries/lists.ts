import "server-only";

import {
	aliasedTable,
	and,
	asc,
	desc,
	eq,
	exists,
	inArray,
	sql,
} from "drizzle-orm";
import { db } from "~/server/db";
import {
	authors,
	blocks,
	books,
	branches,
	entries,
	fragments,
	images,
	pages,
	parts,
	paths,
	talePermissions,
	tales,
	users,
} from "~/server/db/schema";
import type {
	FragmentData,
	FragmentType,
} from "~/server/db/types/tale-reader/fragment";
import {
	authorAccessCondition,
	blockAccessCondition,
	bookAccessCondition,
	branchAccessCondition,
	fragmentAccessCondition,
	getAccessLabel,
	getSignedInLibraryUser,
	pathAccessCondition,
	taleAccessCondition,
	visibleTaleByIdCondition,
} from "./access";
import { getCountsByTaleIds } from "./counts";

export type LibraryTaleList = Awaited<ReturnType<typeof getLibraryTales>>;
export type LibraryBookList = Awaited<ReturnType<typeof getLibraryBooks>>;
export type LibraryAuthorList = Awaited<ReturnType<typeof getLibraryAuthors>>;
export type LibraryBranchList = Awaited<ReturnType<typeof getLibraryBranches>>;
export type LibrarySectionList = Awaited<ReturnType<typeof getLibrarySections>>;
export type LibraryBlockList = Awaited<ReturnType<typeof getLibraryBlocks>>;
export type LibraryFragmentList = Awaited<
	ReturnType<typeof getLibraryFragments>
>;
export type LibraryPathList = Awaited<ReturnType<typeof getLibraryPaths>>;
export type LibraryPartList = Awaited<ReturnType<typeof getLibraryParts>>;
export type LibraryEntryList = Awaited<ReturnType<typeof getLibraryEntries>>;
export type LibraryPageList = Awaited<ReturnType<typeof getLibraryPages>>;

type LibraryTalesOptions = {
	creatorId?: string;
};

type LibraryBooksOptions = {
	creatorId?: string;
};

type LibrarySectionRow = {
	branch: {
		id: number;
		index: number;
		name: string;
	};
	direction: "down";
	id: number;
	index: number;
	isSnap: boolean;
	orientation: "vertical";
	previewFragment: LibraryPreviewFragment | null;
	tale: {
		id: number;
		title: string;
	};
	taleId: number;
	visibility: "private" | "public" | "restricted";
};

export async function getLibraryTales(options: LibraryTalesOptions = {}) {
	const { userId } = await getSignedInLibraryUser();
	const rows = await db
		.select({
			tale: tales,
			book: books,
			creatorById: users,
			isShared: userId ? sharedTaleExpression(userId) : sql<boolean>`false`,
		})
		.from(tales)
		.leftJoin(books, eq(books.id, tales.bookId))
		.leftJoin(users, eq(users.id, tales.creatorId))
		.where(
			and(
				taleAccessCondition(userId),
				options.creatorId ? eq(tales.creatorId, options.creatorId) : undefined,
			),
		)
		.orderBy(desc(tales.id));

	const counts = await getCountsByTaleIds(
		rows.map((row) => row.tale.id),
		userId,
	);

	return rows.map((row) => ({
		...row.tale,
		book: row.book,
		creatorById: row.creatorById,
		accessLabel: getAccessLabel(
			{ ...row.tale, isShared: Boolean(row.isShared) },
			userId,
		),
		nodeCounts: {
			branches: counts.branches.get(row.tale.id) ?? 0,
			sections: counts.sections.get(row.tale.id) ?? 0,
			blocks: counts.blocks.get(row.tale.id) ?? 0,
			fragments: counts.fragments.get(row.tale.id) ?? 0,
			paths: counts.paths.get(row.tale.id) ?? 0,
			parts: counts.parts.get(row.tale.id) ?? 0,
			entries: counts.entries.get(row.tale.id) ?? 0,
			pages: counts.pages.get(row.tale.id) ?? 0,
		},
	}));
}

export async function getLibraryBooks(options: LibraryBooksOptions = {}) {
	const { userId } = await getSignedInLibraryUser();
	const rows = await db
		.select({
			book: books,
			author: authors,
			coverImage: images,
			creator: users,
		})
		.from(books)
		.leftJoin(authors, eq(authors.id, books.authorId))
		.leftJoin(images, eq(images.id, books.coverImageId))
		.leftJoin(users, eq(users.id, books.creatorId))
		.where(
			and(
				bookAccessCondition(userId),
				options.creatorId ? eq(books.creatorId, options.creatorId) : undefined,
			),
		)
		.orderBy(desc(books.id));

	return rows.map((row) => ({
		...row.book,
		author: row.author,
		coverImage: row.coverImage,
		creator: row.creator,
	}));
}

export async function getLibraryAuthors() {
	const { userId } = await getSignedInLibraryUser();
	const rows = await db
		.select({
			author: authors,
			image: images,
			creator: users,
		})
		.from(authors)
		.leftJoin(images, eq(images.id, authors.imageId))
		.leftJoin(users, eq(users.id, authors.creatorId))
		.where(authorAccessCondition(userId))
		.orderBy(desc(authors.id));

	return rows.map((row) => ({
		...row.author,
		image: row.image,
		creator: row.creator,
	}));
}

export async function getLibraryBranches() {
	const { userId } = await getSignedInLibraryUser();
	const rows = await db
		.select({
			branch: branches,
			taleId: tales.id,
			taleTitle: tales.title,
		})
		.from(branches)
		.innerJoin(tales, eq(tales.id, branches.taleId))
		.where(
			and(
				taleAccessCondition(userId),
				branchAccessCondition(branches.id, branches, userId),
			),
		)
		.orderBy(desc(branches.id));
	const previews = await getPreviewFragmentsByBranchIds(
		rows.map((row) => row.branch.id),
		userId,
	);

	return rows.map((row) => ({
		...row.branch,
		index: row.branch.order,
		tale: { id: row.taleId, title: row.taleTitle },
		previewFragment: previews.get(row.branch.id) ?? null,
	}));
}

export async function getLibrarySections(): Promise<LibrarySectionRow[]> {
	return [];
}

export async function getLibraryBlocks() {
	const { userId } = await getSignedInLibraryUser();
	const rows = await db
		.select({
			block: blocks,
			taleId: tales.id,
			taleTitle: tales.title,
			branchId: branches.id,
			branchName: branches.name,
			branchIndex: branches.order,
			entryId: entries.id,
			entryTitle: entries.title,
			entryIndex: entries.order,
			partId: parts.id,
			partTitle: parts.title,
			partIndex: parts.order,
			pageId: pages.id,
			pageIndex: pages.order,
		})
		.from(blocks)
		.innerJoin(tales, eq(tales.id, blocks.taleId))
		.innerJoin(branches, eq(branches.id, blocks.branchId))
		.innerJoin(pages, eq(pages.id, blocks.pageId))
		.innerJoin(entries, eq(entries.id, pages.entryId))
		.innerJoin(parts, eq(parts.id, pages.partId))
		.where(
			and(
				taleAccessCondition(userId),
				blockAccessCondition(blocks.id, blocks, userId),
			),
		)
		.orderBy(desc(blocks.id));
	const previews = await getPreviewFragmentsByBlockIds(
		rows.map((row) => row.block.id),
		userId,
	);

	return rows.map((row) => ({
		...row.block,
		index: row.block.order,
		tale: { id: row.taleId, title: row.taleTitle },
		section: { id: row.branchId, index: row.branchIndex },
		branch: {
			id: row.branchId,
			name: row.branchName,
			index: row.branchIndex,
		},
		entry: {
			id: row.entryId,
			title: row.entryTitle,
			index: row.entryIndex,
		},
		part: {
			id: row.partId,
			title: row.partTitle,
			index: row.partIndex,
		},
		page:
			row.pageId === null
				? null
				: {
						id: row.pageId,
						index: row.pageIndex ?? 0,
					},
		previewFragment: previews.get(row.block.id) ?? null,
	}));
}

export async function getLibraryFragments() {
	const { userId } = await getSignedInLibraryUser();
	const rows = await db
		.select({
			fragment: fragments,
			taleId: tales.id,
			taleTitle: tales.title,
			blockId: blocks.id,
			blockIndex: blocks.order,
			branchId: branches.id,
			branchName: branches.name,
			branchIndex: branches.order,
			entryId: entries.id,
			entryTitle: entries.title,
			entryIndex: entries.order,
			partId: parts.id,
			partTitle: parts.title,
			partIndex: parts.order,
			pageId: pages.id,
			pageIndex: pages.order,
		})
		.from(fragments)
		.innerJoin(tales, eq(tales.id, fragments.taleId))
		.innerJoin(blocks, eq(blocks.id, fragments.blockId))
		.innerJoin(branches, eq(branches.id, blocks.branchId))
		.innerJoin(pages, eq(pages.id, blocks.pageId))
		.innerJoin(entries, eq(entries.id, pages.entryId))
		.innerJoin(parts, eq(parts.id, pages.partId))
		.where(
			and(
				taleAccessCondition(userId),
				fragmentAccessCondition(fragments.id, fragments, userId),
			),
		)
		.orderBy(desc(fragments.id));

	return rows.map((row) => ({
		...row.fragment,
		index: row.fragment.order,
		tale: { id: row.taleId, title: row.taleTitle },
		block: { id: row.blockId, index: row.blockIndex },
		section: { id: row.branchId, index: row.branchIndex },
		branch: {
			id: row.branchId,
			name: row.branchName,
			index: row.branchIndex,
		},
		entry: {
			id: row.entryId,
			title: row.entryTitle,
			index: row.entryIndex,
		},
		part: {
			id: row.partId,
			title: row.partTitle,
			index: row.partIndex,
		},
		page:
			row.pageId === null
				? null
				: {
						id: row.pageId,
						index: row.pageIndex ?? 0,
					},
		previewFragment: {
			id: row.fragment.id,
			type: row.fragment.type,
			data: row.fragment.data,
			orientation: "vertical" as const,
		},
	}));
}

export async function getLibraryPaths() {
	const { userId } = await getSignedInLibraryUser();
	const fromBranches = aliasedTable(branches, "from_branch");
	const toBranches = aliasedTable(branches, "to_branch");

	const rows = await db
		.select({
			path: paths,
			taleId: tales.id,
			taleTitle: tales.title,
			fromBranchId: fromBranches.id,
			fromBranchName: fromBranches.name,
			fromBranchIndex: fromBranches.order,
			toBranchId: toBranches.id,
			toBranchName: toBranches.name,
			toBranchIndex: toBranches.order,
		})
		.from(paths)
		.innerJoin(tales, eq(tales.id, paths.taleId))
		.innerJoin(fromBranches, eq(fromBranches.id, paths.fromBranchId))
		.innerJoin(toBranches, eq(toBranches.id, paths.toBranchId))
		.where(
			and(
				taleAccessCondition(userId),
				pathAccessCondition(paths.id, paths, userId),
			),
		)
		.orderBy(desc(paths.id));

	return rows.map((row) => ({
		...row.path,
		tale: { id: row.taleId, title: row.taleTitle },
		fromBranch: {
			id: row.fromBranchId,
			name: row.fromBranchName,
			index: row.fromBranchIndex,
		},
		toBranch: {
			id: row.toBranchId,
			name: row.toBranchName,
			index: row.toBranchIndex,
		},
	}));
}

export async function getLibraryParts() {
	const { userId } = await getSignedInLibraryUser();
	const rows = await db
		.select({
			part: parts,
			taleId: tales.id,
			taleTitle: tales.title,
		})
		.from(parts)
		.innerJoin(tales, eq(tales.id, parts.taleId))
		.where(
			and(
				taleAccessCondition(userId),
				visibleTaleByIdCondition(parts.taleId, userId),
			),
		)
		.orderBy(desc(parts.id));

	return rows.map((row) => ({
		...row.part,
		index: row.part.order,
		tale: { id: row.taleId, title: row.taleTitle },
	}));
}

export async function getLibraryEntries() {
	const { userId } = await getSignedInLibraryUser();
	const rows = await db
		.select({
			entry: entries,
			taleId: tales.id,
			taleTitle: tales.title,
			partId: parts.id,
			partTitle: parts.title,
			partIndex: parts.order,
		})
		.from(entries)
		.innerJoin(tales, eq(tales.id, entries.taleId))
		.innerJoin(parts, eq(parts.id, entries.partId))
		.where(taleAccessCondition(userId))
		.orderBy(desc(entries.id));

	return rows.map((row) => ({
		...row.entry,
		index: row.entry.order,
		tale: { id: row.taleId, title: row.taleTitle },
		part: {
			id: row.partId,
			title: row.partTitle,
			index: row.partIndex,
		},
	}));
}

export async function getLibraryPages() {
	const { userId } = await getSignedInLibraryUser();
	const rows = await db
		.select({
			page: pages,
			taleId: tales.id,
			taleTitle: tales.title,
			partId: parts.id,
			partTitle: parts.title,
			partIndex: parts.order,
			entryId: entries.id,
			entryTitle: entries.title,
			entryIndex: entries.order,
		})
		.from(pages)
		.innerJoin(tales, eq(tales.id, pages.taleId))
		.innerJoin(parts, eq(parts.id, pages.partId))
		.innerJoin(entries, eq(entries.id, pages.entryId))
		.where(taleAccessCondition(userId))
		.orderBy(desc(pages.id));

	return rows.map((row) => ({
		...row.page,
		index: row.page.order,
		tale: { id: row.taleId, title: row.taleTitle },
		part: {
			id: row.partId,
			title: row.partTitle,
			index: row.partIndex,
		},
		entry: {
			id: row.entryId,
			title: row.entryTitle,
			index: row.entryIndex,
		},
	}));
}

type LibraryPreviewFragment = {
	id: number;
	type: FragmentType;
	data: FragmentData;
	orientation: "vertical" | "horizontal";
};

async function getPreviewFragmentsByBranchIds(
	branchIds: number[],
	userId: string | null,
) {
	if (!branchIds.length) return new Map<number, LibraryPreviewFragment>();

	const rows = await db
		.select({
			branchId: branches.id,
			fragmentId: fragments.id,
			fragmentType: fragments.type,
			fragmentData: fragments.data,
		})
		.from(fragments)
		.innerJoin(blocks, eq(blocks.id, fragments.blockId))
		.innerJoin(branches, eq(branches.id, blocks.branchId))
		.where(
			and(
				inArray(branches.id, branchIds),
				fragmentAccessCondition(fragments.id, fragments, userId),
			),
		)
		.orderBy(asc(blocks.order), asc(fragments.order));

	return firstPreviewByKey(rows, (row) => row.branchId);
}

async function getPreviewFragmentsByBlockIds(
	blockIds: number[],
	userId: string | null,
) {
	if (!blockIds.length) return new Map<number, LibraryPreviewFragment>();

	const rows = await db
		.select({
			blockId: blocks.id,
			fragmentId: fragments.id,
			fragmentType: fragments.type,
			fragmentData: fragments.data,
		})
		.from(fragments)
		.innerJoin(blocks, eq(blocks.id, fragments.blockId))
		.where(
			and(
				inArray(blocks.id, blockIds),
				fragmentAccessCondition(fragments.id, fragments, userId),
			),
		)
		.orderBy(asc(fragments.order));

	return firstPreviewByKey(rows, (row) => row.blockId);
}

function firstPreviewByKey<
	TRow extends {
		fragmentId: number;
		fragmentType: FragmentType;
		fragmentData: FragmentData;
	},
>(rows: TRow[], getKey: (row: TRow) => number) {
	const previews = new Map<number, LibraryPreviewFragment>();

	for (const row of rows) {
		const key = getKey(row);
		if (previews.has(key)) continue;

		previews.set(key, {
			id: row.fragmentId,
			type: row.fragmentType,
			data: row.fragmentData,
			orientation: "vertical",
		});
	}

	return previews;
}

function sharedTaleExpression(userId: string) {
	return exists(
		db
			.select({ id: talePermissions.id })
			.from(talePermissions)
			.where(
				and(
					eq(talePermissions.taleId, tales.id),
					eq(talePermissions.userId, userId),
					sql`${talePermissions.permissionTypes} && ARRAY['viewer', 'collaborator', 'cloner']::text[]`,
				),
			),
	);
}
