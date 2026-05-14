import { db } from "~/server/db";
import {
	type BlockSchema,
	blocks,
	branches,
	entries,
	pages,
	sections,
	tales,
} from "~/server/db/schema";

type BlockSeed = Pick<
	BlockSchema,
	| "taleId"
	| "sectionId"
	| "entryId"
	| "partId"
	| "pageId"
	| "creatorId"
	| "isSnap"
	| "index"
	| "isOfficial"
	| "isVerified"
	| "editable"
	| "visibility"
	| "cloneable"
>;

const shouldSeedBlockSnap = (pageId: number | null) => pageId != null;

export async function seedBlocks() {
	const allEntries = await db
		.select({
			id: entries.id,
			taleId: entries.taleId,
			partId: entries.partId,
			title: entries.title,
			index: entries.index,
		})
		.from(entries);

	const allPages = await db
		.select({
			id: pages.id,
			entryId: pages.entryId,
			index: pages.index,
		})
		.from(pages);

	const allSections = await db
		.select({
			id: sections.id,
			taleId: sections.taleId,
			branchId: sections.branchId,
			index: sections.index,
		})
		.from(sections);

	const allBranches = await db
		.select({
			id: branches.id,
			taleId: branches.taleId,
			name: branches.name,
			index: branches.index,
		})
		.from(branches);

	const allTales = await db
		.select({
			id: tales.id,
			creatorId: tales.creatorId,
			isOfficial: tales.isOfficial,
			isVerified: tales.isVerified,
			editable: tales.editable,
			visibility: tales.visibility,
			cloneable: tales.cloneable,
		})
		.from(tales);

	const taleMap = new Map(allTales.map((tale) => [tale.id, tale] as const));

	const pagesByEntryId = new Map<number, { id: number; index: number }[]>();

	for (const page of allPages) {
		const existing = pagesByEntryId.get(page.entryId) ?? [];
		existing.push({ id: page.id, index: page.index });
		pagesByEntryId.set(page.entryId, existing);
	}

	for (const entryPages of pagesByEntryId.values()) {
		entryPages.sort((a, b) => a.index - b.index);
	}

	const branchesByTaleId = new Map<
		number,
		{ id: number; name: string; index: number }[]
	>();

	for (const branch of allBranches) {
		const existing = branchesByTaleId.get(branch.taleId) ?? [];
		existing.push(branch);
		branchesByTaleId.set(branch.taleId, existing);
	}

	for (const taleBranches of branchesByTaleId.values()) {
		taleBranches.sort((a, b) => a.index - b.index);
	}

	const sectionsByTaleId = new Map<number, typeof allSections>();

	for (const section of allSections) {
		const existing = sectionsByTaleId.get(section.taleId) ?? [];
		existing.push(section);
		sectionsByTaleId.set(section.taleId, existing);
	}

	const entriesByTaleId = new Map<number, typeof allEntries>();

	for (const entry of allEntries) {
		const existing = entriesByTaleId.get(entry.taleId) ?? [];
		existing.push(entry);
		entriesByTaleId.set(entry.taleId, existing);
	}

	const seeds: BlockSeed[] = [];

	for (const [taleId, taleEntries] of entriesByTaleId) {
		const tale = taleMap.get(taleId);
		if (!tale) continue;

		if (taleId === 10) {
			const taleBranches = branchesByTaleId.get(taleId) ?? [];
			const taleSections = sectionsByTaleId.get(taleId) ?? [];

			const branchByName = new Map(
				taleBranches.map((b) => [b.name, b.id] as const),
			);

			const sectionKey = (branchName: string, index: number) =>
				`${branchName}:${index}`;

			const sectionMap = new Map<string, number>();

			for (const section of taleSections) {
				const branch = taleBranches.find((b) => b.id === section.branchId);
				if (!branch) continue;
				sectionMap.set(sectionKey(branch.name, section.index), section.id);
			}

			const entryOrder = [
				{ title: "Beginning", section: sectionKey("Beginning", 0) },
				{ title: "First Path", section: sectionKey("First Path", 0) },
				{ title: "Third Path", section: sectionKey("Third Path", 0) },
				{ title: "Second Path I", section: sectionKey("Second Path", 0) },
				{ title: "Second Path II", section: sectionKey("Second Path", 1) },
				{ title: "Fourth Path I", section: sectionKey("Fourth Path", 0) },
				{ title: "Fourth Path II", section: sectionKey("Fourth Path", 1) },
				{ title: "The Choice", section: sectionKey("The Choice", 0) },
				{ title: "The Good Choice", section: sectionKey("The Good Choice", 0) },
				{ title: "The Bad Choice", section: sectionKey("The Bad Choice", 0) },
				{ title: "Ending", section: sectionKey("Ending", 0) },
			];

			const entriesByTitle = new Map(
				taleEntries.map((e) => [e.title, e] as const),
			);
			const sectionCounters = new Map<number, number>();

			for (const item of entryOrder) {
				const entry = entriesByTitle.get(item.title);
				const sectionId = sectionMap.get(item.section);
				if (!entry || !sectionId) continue;

				const entryPages = pagesByEntryId.get(entry.id) ?? [];
				const pageIds = [
					null,
					entryPages[0]?.id ?? null,
					entryPages[1]?.id ?? null,
				];

				for (let i = 0; i < 3; i++) {
					const currentIndex = sectionCounters.get(sectionId) ?? 0;
					sectionCounters.set(sectionId, currentIndex + 1);
					const pageId = pageIds[i] ?? null;

					seeds.push({
						taleId,
						sectionId,
						entryId: entry.id,
						partId: entry.partId,
						pageId,
						creatorId: tale.creatorId,
						isSnap: shouldSeedBlockSnap(pageId),
						index: currentIndex,
						isOfficial: tale.isOfficial,
						isVerified: tale.isVerified,
						editable: tale.editable,
						visibility: tale.visibility,
						cloneable: tale.cloneable,
					});
				}
			}

			continue;
		}

		const taleSections = (sectionsByTaleId.get(taleId) ?? []).sort(
			(a, b) => a.index - b.index,
		);

		const orderedEntries = [...taleEntries].sort((a, b) => a.id - b.id);

		const sectionAssignments = [
			taleSections[0]?.id,
			taleSections[0]?.id,
			taleSections[1]?.id,
			taleSections[1]?.id,
			taleSections[2]?.id,
			taleSections[3]?.id,
		];

		const sectionCounters = new Map<number, number>();

		for (let entryIndex = 0; entryIndex < orderedEntries.length; entryIndex++) {
			const entry = orderedEntries[entryIndex];
			const sectionId = sectionAssignments[entryIndex];
			if (!entry || !sectionId) continue;

			const entryPages = pagesByEntryId.get(entry.id) ?? [];
			const pageIds = [
				null,
				entryPages[0]?.id ?? null,
				entryPages[1]?.id ?? null,
				entryPages[2]?.id ?? null,
			];

			for (let i = 0; i < 4; i++) {
				const currentIndex = sectionCounters.get(sectionId) ?? 0;
				sectionCounters.set(sectionId, currentIndex + 1);
				const pageId = pageIds[i] ?? null;

				seeds.push({
					taleId,
					sectionId,
					entryId: entry.id,
					partId: entry.partId,
					pageId,
					creatorId: tale.creatorId,
					isSnap: shouldSeedBlockSnap(pageId),
					index: currentIndex,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				});
			}
		}
	}

	await db.insert(blocks).values(seeds);

	console.log(`✅ Seeded ${seeds.length} blocks.`);
}
