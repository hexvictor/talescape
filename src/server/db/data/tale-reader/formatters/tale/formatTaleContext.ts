import type { TaleRecord } from "../../queries/tales/getTale";

export function flattenTaleRecord(rawTale: TaleRecord) {
	const branches = rawTale.branches;
	const sections = branches.flatMap((branch) => branch.sections);
	const blocks = sections.flatMap((section) => section.blocks);
	const parts = rawTale.parts;
	const entries = parts.flatMap((part) => part.entries);
	const pages = entries.flatMap((entry) => entry.pages);
	const fragments = blocks.flatMap((block) => block.fragments);
	const paths = branches.flatMap((branch) => branch.outgoingPaths);

	return {
		branches,
		paths,
		parts,
		entries,
		pages,
		sections,
		blocks,
		fragments,
	};
}

export type FlatTaleRecord = ReturnType<typeof flattenTaleRecord>;

export function createDerivedTaleIndexes(flat: FlatTaleRecord) {
	const blockById = mapById(flat.blocks);
	const blockIdsByPartId = Object.fromEntries(
		flat.parts.map((part) => [part.id, part.blocks.map((block) => block.id)]),
	);
	const entryIdsByPartId = Object.fromEntries(
		flat.parts.map((part) => [part.id, part.entries.map((entry) => entry.id)]),
	);
	const pageIdsByPartId = Object.fromEntries(
		flat.parts.map((part) => [
			part.id,
			part.entries.flatMap((entry) => entry.pages.map((page) => page.id)),
		]),
	);
	const chapterIdsByPartId = Object.fromEntries(
		flat.parts.map((part) => [
			part.id,
			part.entries
				.filter((entry) => entry.type === "chapter")
				.map((entry) => entry.id),
		]),
	);
	const pageIdsByEntryId = Object.fromEntries(
		flat.entries.map((entry) => [entry.id, entry.pages.map((page) => page.id)]),
	);
	const blockIdsByEntryId = Object.fromEntries(
		flat.entries.map((entry) => [
			entry.id,
			entry.blocks.map((block) => block.id),
		]),
	);
	const blockIdsByPageId = Object.fromEntries(
		flat.pages.map((page) => [page.id, page.blocks.map((block) => block.id)]),
	);
	const sectionIdsByBranchId = Object.fromEntries(
		flat.branches.map((branch) => [
			branch.id,
			branch.sections.map((section) => section.id),
		]),
	);
	const blockIdsByBranchId = Object.fromEntries(
		flat.branches.map((branch) => [
			branch.id,
			branch.sections.flatMap((section) =>
				section.blocks.map((block) => block.id),
			),
		]),
	);
	const blockIdsBySectionId = Object.fromEntries(
		flat.sections.map((section) => [
			section.id,
			section.blocks.map((block) => block.id),
		]),
	);
	const fragmentIdsByBlockId = Object.fromEntries(
		flat.blocks.map((block) => [
			block.id,
			block.fragments.map((fragment) => fragment.id),
		]),
	);
	const outgoingPathIdsByBranchId = Object.fromEntries(
		flat.branches.map((branch) => [
			branch.id,
			branch.outgoingPaths.map((path) => path.id),
		]),
	);
	const incomingPathIdsByBranchId = Object.fromEntries(
		flat.branches.map((branch) => [
			branch.id,
			branch.incomingPaths.map((path) => path.id),
		]),
	);

	return {
		blockById,
		blockIdsByBranchId,
		blockIdsBySectionId,
		blockIdsByPartId,
		blockIdsByEntryId,
		blockIdsByPageId,
		fragmentIdsByBlockId,
		sectionIdsByBranchId,
		entryIdsByPartId,
		pageIdsByEntryId,
		pageIdsByPartId,
		chapterIdsByPartId,
		outgoingPathIdsByBranchId,
		incomingPathIdsByBranchId,
	};
}

export type DerivedTaleIndexes = ReturnType<typeof createDerivedTaleIndexes>;

export function siblingId(ids: number[], currentId: number, offset: -1 | 1) {
	const index = ids.indexOf(currentId);
	if (index < 0) return null;

	return ids[index + offset] ?? null;
}

export function mapById<T extends { id: number }>(items: T[]) {
	return Object.fromEntries(items.map((item) => [item.id, item])) as Record<
		number,
		T
	>;
}

export function valuesFromIds<T>(ids: number[], map: Record<number, T>) {
	return ids.map((id) => map[id]).filter((item): item is T => !!item);
}
