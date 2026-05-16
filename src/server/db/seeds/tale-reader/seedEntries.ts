import { db } from "~/server/db";
import { type EntrySchema, entries, parts, tales } from "~/server/db/schema";
import type { EntryType } from "~/server/db/types/tale-reader/entry";
import { isBranchedTaleSlug } from "./branchedTales";

type EntrySeed = Pick<
	EntrySchema,
	"taleId" | "partId" | "title" | "type" | "index"
>;

type EntryTemplate = {
	title: string;
	type: EntryType;
};

export async function seedEntries() {
	const allParts = await db
		.select({
			id: parts.id,
			taleId: parts.taleId,
			index: parts.index,
		})
		.from(parts);
	const allTales = await db
		.select({
			id: tales.id,
			slug: tales.slug,
		})
		.from(tales);
	const taleSlugById = new Map(
		allTales.map((tale) => [tale.id, tale.slug] as const),
	);

	const seeds: EntrySeed[] = [];

	for (const part of allParts) {
		const taleSlug = taleSlugById.get(part.taleId);

		if (taleSlug && isBranchedTaleSlug(taleSlug)) {
			if (part.index === 0) {
				seeds.push(
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Beginning",
						type: "prologue",
						index: 0,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Forked Contents",
						type: "table_of_contents",
						index: 1,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Fork Map",
						type: "map",
						index: 2,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "First Path",
						type: "chapter",
						index: 3,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Third Path",
						type: "chapter",
						index: 4,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Second Path I",
						type: "chapter",
						index: 5,
					},
				);
			} else {
				seeds.push(
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Second Path II",
						type: "chapter",
						index: 0,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Fourth Path I",
						type: "chapter",
						index: 1,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Fourth Path II",
						type: "chapter",
						index: 2,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "The Choice",
						type: "chapter",
						index: 3,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Fork Quote",
						type: "quote",
						index: 4,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "The Good Choice",
						type: "chapter",
						index: 5,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "The Bad Choice",
						type: "chapter",
						index: 6,
					},
					{
						taleId: part.taleId,
						partId: part.id,
						title: "Ending",
						type: "epilogue",
						index: 7,
					},
				);
			}

			continue;
		}

		const entryTemplates = getLinearEntryTemplates(taleSlug ?? "", part.index);

		for (let i = 0; i < entryTemplates.length; i++) {
			const template = entryTemplates[i];
			if (!template) continue;

			seeds.push({
				taleId: part.taleId,
				partId: part.id,
				title: template.title,
				type: template.type,
				index: i,
			});
		}
	}

	await db.insert(entries).values(seeds);
	console.log(`✅ Seeded ${seeds.length} entries`);
}

function getLinearEntryTemplates(
	taleSlug: string,
	partIndex: number,
): EntryTemplate[] {
	const baseTaleSlug = normalizeSnapVariantSlug(taleSlug);
	const defaults: EntryTemplate[][] = [
		[
			{ title: "Cover", type: "cover" },
			{ title: "Table of Contents", type: "table_of_contents" },
			{ title: "Prologue", type: "prologue" },
		],
		[
			{ title: "Interlude", type: "interlude" },
			{ title: "Chapter", type: "chapter" },
			{ title: "Epilogue", type: "epilogue" },
		],
	];

	const plans: Record<string, EntryTemplate[][]> = {
		"public-tale1": defaults,
		"public-tale2": [
			[
				{ title: "Cover", type: "cover" },
				{ title: "Regional Map", type: "map" },
				{ title: "Prologue", type: "prologue" },
			],
			[
				{ title: "Quoted Warning", type: "quote" },
				{ title: "Chapter", type: "chapter" },
				{ title: "Appendix", type: "appendix" },
			],
		],
		"private-tale1": [
			[
				{ title: "Cover", type: "cover" },
				{ title: "Timeline", type: "timeline" },
				{ title: "Prologue", type: "prologue" },
			],
			[
				{ title: "Chapter", type: "chapter" },
				{ title: "Vocabulary", type: "vocabulary" },
				{ title: "Epilogue", type: "epilogue" },
			],
		],
		"private-tale2": [
			[
				{ title: "Table of Contents", type: "table_of_contents" },
				{ title: "Letter", type: "letter" },
				{ title: "Chapter", type: "chapter" },
			],
			[
				{ title: "Interlude", type: "interlude" },
				{ title: "Timeline", type: "timeline" },
				{ title: "Appendix", type: "appendix" },
			],
		],
		"restricted-tale1": [
			[
				{ title: "Cover", type: "cover" },
				{ title: "Map", type: "map" },
				{ title: "Chapter", type: "chapter" },
			],
			[
				{ title: "Dream", type: "dream" },
				{ title: "Chapter", type: "chapter" },
				{ title: "Vocabulary", type: "vocabulary" },
			],
		],
		"restricted-tale2": [
			[
				{ title: "Prologue", type: "prologue" },
				{ title: "Quote", type: "quote" },
				{ title: "Chapter", type: "chapter" },
			],
			[
				{ title: "Interlude", type: "interlude" },
				{ title: "Timeline", type: "timeline" },
				{ title: "Epilogue", type: "epilogue" },
			],
		],
		"restricted-tale3": [
			[
				{ title: "Cover", type: "cover" },
				{ title: "Table of Contents", type: "table_of_contents" },
				{ title: "Chapter", type: "chapter" },
			],
			[
				{ title: "Quote", type: "quote" },
				{ title: "Chapter", type: "chapter" },
				{ title: "Appendix", type: "appendix" },
			],
		],
		"restricted-tale4": [
			[
				{ title: "Cover", type: "cover" },
				{ title: "Prologue", type: "prologue" },
				{ title: "Chapter", type: "chapter" },
			],
			[
				{ title: "Map", type: "map" },
				{ title: "Interlude", type: "interlude" },
				{ title: "Timeline", type: "timeline" },
			],
		],
		"official-tale1": [
			[
				{ title: "Cover", type: "cover" },
				{ title: "Table of Contents", type: "table_of_contents" },
				{ title: "Prologue", type: "prologue" },
			],
			[
				{ title: "Illustrated Interlude", type: "interlude" },
				{ title: "Chapter", type: "chapter" },
				{ title: "Appendix", type: "appendix" },
			],
		],
	};

	return plans[baseTaleSlug]?.[partIndex] ?? defaults[partIndex] ?? [];
}

function normalizeSnapVariantSlug(taleSlug: string) {
	return taleSlug.replace(/-snap-(off|on)$/, "");
}
