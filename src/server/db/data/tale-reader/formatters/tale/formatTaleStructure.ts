import { formatTale } from "~/app/(tale-reader)/_shared/services/formatTale";
import type { RawTaleRecord, Tale } from "~/app/(tale-reader)/_shared/types";
import { formatBlocks } from "../blocks/formatBlocks";
import { formatBranches } from "../branches/formatBranches";
import { formatEntries } from "../entries/formatEntries";
import { formatFragments } from "../fragments/formatFragments";
import { formatNodes } from "../nodes/formatNodes";
import { formatPages } from "../pages/formatPages";
import { formatParts } from "../parts/formatParts";
import { formatPaths } from "../paths/formatPaths";
import {
	formatAnimationPresets,
	formatStylePresets,
	formatTransitionPresets,
	formatVisibilityPresets,
} from "../presets/formatPresets";
import { withFallbackPresets } from "./fallbackPresets";
import type { DbTaleRecord, OfficialPresetRows } from "./formatTypes";

/**
 * Formats a database tale record into the production reader structure.
 *
 * @param record - The tale record and related rows loaded from the database.
 * @param officialPresets - Globally available administrator-managed presets.
 * @returns A fully resolved tale structure consumed by the reader store.
 *
 * @example
 * const tale = formatTaleStructure(record, officialPresetRows);
 */
export function formatTaleStructure(
	record: DbTaleRecord,
	officialPresets: OfficialPresetRows = {},
): Tale {
	const pages = formatPages(record.pages ?? []);
	const nodes = formatNodes(record.nodes ?? []);
	const nodesById = new Map(nodes.map((node) => [node.id, node]));
	const blocks = formatBlocks(record.blocks ?? [], pages).map((block) => {
		const blockNodes = block.nodeIds.flatMap((id) => {
			const node = nodesById.get(id);
			return node ? [node] : [];
		});
		return {
			...block,
			nodes: blockNodes,
			rootNodeId:
				block.rootNodeId ??
				blockNodes.find((node) => !node.parentNodeId)?.id ??
				undefined,
		};
	});
	const raw: RawTaleRecord = {
		animationPresets: formatAnimationPresets(
			officialPresets.animationPresets ?? [],
			"official",
		),
		blocks,
		blockStylePresets: formatStylePresets(
			officialPresets.blockStylePresets ?? [],
			"official",
		),
		branches: formatBranches(record.branches ?? []),
		entries: formatEntries(record.entries ?? []),
		fragments: formatFragments(record.fragments ?? []),
		id: record.id,
		nodes,
		pages,
		parts: formatParts(record.parts ?? []),
		paths: formatPaths(record.paths ?? []),
		slug: record.slug,
		synopsis: record.description ?? "",
		title: record.title,
		firstBlockTransitionMode:
			record.firstBlockTransitionMode ?? "fromPlacement",
		transitionFirstBlock: record.transitionFirstBlock ?? false,
		transitionPresets: formatTransitionPresets(
			officialPresets.transitionPresets ?? [],
			"official",
		),
		visibilityPresets: formatVisibilityPresets(
			officialPresets.visibilityPresets ?? [],
			"official",
		),
	};
	const tale = formatTale(withFallbackPresets(raw));
	return {
		...record,
		...tale,
		book: record.book ?? null,
		creator: record.creatorById ?? null,
		id: record.id,
	};
}
