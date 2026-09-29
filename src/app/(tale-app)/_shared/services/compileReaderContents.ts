import type {
	Anchor,
	ReaderContentsEntry,
	ReaderContentsEntryPartSpan,
	ReaderContentsPage,
	ReaderContentsPart,
	ResolvedTaleEntry,
	ResolvedTalePage,
	ResolvedTaleKeyframe,
	Tale,
} from "../types";
import { getTaleEntries, getTaleParts } from "./taleLookups";

export type CompiledReaderContents = {
	contents: ReaderContentsPart[];
	entries: ReaderContentsEntry[];
	entryIndexById: Record<string, number>;
	pageIndexById: Record<string, number>;
	pages: ReaderContentsPage[];
};

type VisibleKeyframeContent = {
	anchor: Anchor;
	page: ResolvedTalePage;
	step: ResolvedTaleKeyframe;
};

/**
 * Compiles the nested contents model consumed by reader navigation.
 *
 * @param tale - Formatted tale structure.
 * @param anchors - Active anchors for the selected branch route.
 * @returns Parts, entries, and scenes in reader order.
 *
 * @example
 * const contents = compileReaderContents(tale, anchors);
 */
export function compileReaderContents(
	tale: Tale,
	anchors: Anchor[],
	visibleKeyframeIds?: ReadonlySet<string>,
): CompiledReaderContents {
	const visibleKeyframes: VisibleKeyframeContent[] = [];
	const pageNumberById = new Map<string, number>();
	let pageNumber = 0;
	let currentPageId: string | null = null;
	for (const anchor of anchors) {
		const scene = tale.indexMap.scenesById[anchor.sceneId];
		const keyframesById = tale.indexMap.keyframesById ?? {};
		const orderedIds = visibleKeyframeIds
			? [...visibleKeyframeIds].filter((id) => {
					const keyframe = keyframesById[id];
					return (
						scene?.keyframeIds?.includes(id) ||
						keyframe?.sceneId === scene?.id ||
						(keyframe && !("sceneId" in keyframe))
					);
				})
			: (scene?.keyframeIds ?? []);
		for (const keyframeId of orderedIds) {
			if (visibleKeyframeIds && !visibleKeyframeIds.has(keyframeId)) continue;
			const step = keyframesById[keyframeId];
			if (step?.pageId) currentPageId = step.pageId;
			const page = currentPageId
				? tale.indexMap.pagesById[currentPageId]
				: null;
			if (step && page) visibleKeyframes.push({ anchor, page, step });
			if (page?.isPaginated && !pageNumberById.has(page.id)) {
				pageNumber += 1;
				pageNumberById.set(page.id, pageNumber);
			}
		}
	}
	const entriesByPartId = new Map<string, ResolvedTaleEntry[]>();
	for (const entry of getTaleEntries(tale)) {
		const partEntries = entriesByPartId.get(entry.partId);
		if (partEntries) {
			partEntries.push(entry);
		} else {
			entriesByPartId.set(entry.partId, [entry]);
		}
	}

	let chapterNumber = 0;
	const pages: ReaderContentsPage[] = [];
	const allEntries: ReaderContentsEntry[] = [];
	const contents = getTaleParts(tale).flatMap((part) => {
		const partEntries = (entriesByPartId.get(part.id) ?? []).flatMap(
			(entry) => {
				const entryKeyframes = visibleKeyframes.filter(
					(content) => content.page.entryId === entry.id,
				);
				if (entryKeyframes.length === 0) return [];
				const entryAnchors = uniqueAnchors(
					entryKeyframes.map((item) => item.anchor),
				);
				const derivedChapterNumber =
					entry.type === "chapter" ? ++chapterNumber : null;
				const entryPages = compileEntryPages(
					tale,
					entry.id,
					entryKeyframes,
					pageNumberById,
				);
				pages.push(...entryPages);
				const compiledEntry: ReaderContentsEntry = {
					sceneIds: entryAnchors.map((anchor) => anchor.sceneId),
					keyframeIds: entryPages.flatMap((page) => page.keyframeIds),
					chapterNumber: derivedChapterNumber,
					hasChoiceScene: entryAnchors.some(
						(anchor) => tale.indexMap.scenesById[anchor.sceneId]?.isChoiceScene,
					),
					id: entry.id,
					partSpans: compileEntryPartSpans(tale, entryPages),
					pageIds: entryPages.map((page) => page.id),
				};
				allEntries.push(compiledEntry);
				return [compiledEntry];
			},
		);
		if (partEntries.length === 0) return [];
		return [
			{
				entryIds: partEntries.map((entry) => entry.id),
				id: part.id,
			},
		];
	});

	return {
		contents,
		entries: allEntries,
		entryIndexById: Object.fromEntries(
			allEntries.map((entry, index) => [entry.id, index]),
		),
		pageIndexById: Object.fromEntries(
			pages.map((page, index) => [page.id, index]),
		),
		pages,
	};
}

/**
 * Compiles distinct route-visible pages for one entry.
 *
 * @param entryId - Parent entry identifier.
 * @param anchors - Visible anchors belonging to the entry.
 * @param pageNumberById - Derived paginated page numbers.
 * @returns Distinct pages in current reader order.
 */
function compileEntryPages(
	tale: Tale,
	entryId: string,
	visibleKeyframes: VisibleKeyframeContent[],
	pageNumberById: Map<string, number>,
): ReaderContentsPage[] {
	const pageContentById = new Map<
		string,
		{ anchors: Anchor[]; keyframeIds: string[] }
	>();
	for (const item of visibleKeyframes) {
		if (item.page.entryId !== entryId) continue;
		const content = pageContentById.get(item.page.id) ?? {
			anchors: [],
			keyframeIds: [],
		};
		if (
			!content.anchors.some((anchor) => anchor.sceneId === item.anchor.sceneId)
		) {
			content.anchors.push(item.anchor);
		}
		content.keyframeIds.push(item.step.id);
		pageContentById.set(item.page.id, content);
	}

	return [...pageContentById.entries()].map(([pageId, content]) => {
		const firstAnchor = content.anchors[0];
		if (!firstAnchor) {
			throw new Error(`Entry ${entryId} contains an empty compiled page.`);
		}
		const page = visibleKeyframes.find((item) => item.page.id === pageId)?.page;
		if (!page)
			throw new Error(`Entry ${entryId} references missing page ${pageId}.`);
		return {
			sceneIds: content.anchors.map((anchor) => anchor.sceneId),
			keyframeIds: content.keyframeIds,
			hasChoiceScene: content.anchors.some(
				(anchor) => tale.indexMap.scenesById[anchor.sceneId]?.isChoiceScene,
			),
			id: page.id,
			number: pageNumberById.get(page.id) ?? null,
		};
	});
}

function uniqueAnchors(anchors: Anchor[]): Anchor[] {
	const seen = new Set<string>();
	return anchors.filter((anchor) => {
		if (seen.has(anchor.sceneId)) return false;
		seen.add(anchor.sceneId);
		return true;
	});
}

function compileEntryPartSpans(
	tale: Tale,
	pages: ReaderContentsPage[],
): ReaderContentsEntryPartSpan[] {
	const spans: ReaderContentsEntryPartSpan[] = [];

	for (const page of pages) {
		const talePage = tale.indexMap.pagesById[page.id];
		if (!talePage) continue;
		const currentSpan = spans.at(-1);
		if (currentSpan && currentSpan.partId === talePage.partId) {
			currentSpan.endPageId = page.id;
			currentSpan.pageCount += 1;
			continue;
		}

		spans.push({
			endPageId: page.id,
			partId: talePage.partId,
			pageCount: 1,
			startPageId: page.id,
		});
	}

	return spans;
}
