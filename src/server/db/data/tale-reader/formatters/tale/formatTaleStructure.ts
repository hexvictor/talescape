import { formatTale } from "~/app/(tale-app)/_shared/services/formatTale";
import { normalizeTalePlaybackConfig } from "~/app/(tale-app)/_shared/services/readerPlaybackSettings";
import { normalizeTaleSnapConfig } from "~/app/(tale-app)/_shared/services/readerSnapSettings";
import { normalizeResponsiveBlockNodes } from "~/app/(tale-app)/_shared/services/responsiveNodes";
import { normalizeTaleBackgroundConfig } from "~/app/(tale-app)/_shared/services/taleBackgroundSettings";
import type { RawTaleRecord, Tale } from "~/app/(tale-app)/_shared/types";
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
	const {
		blocks: rawBlocks,
		backgroundConfig,
		book,
		branches: rawBranches,
		breakpointConfig,
		creatorById,
		entries: rawEntries,
		fragments: rawFragments,
		nodes: rawNodes,
		pages: rawPages,
		parts: rawParts,
		paths: rawPaths,
		playbackConfig,
		snapConfig,
	} = record;
	const pages = formatPages(rawPages ?? []);
	const responsiveNodes = formatBlocks(rawBlocks ?? [], pages).map(
		normalizeResponsiveBlockNodes,
	);
	const blocks = responsiveNodes.map((result) => result.block);
	const nodes = [
		...formatNodes(rawNodes ?? []),
		...responsiveNodes.flatMap((result) => result.nodes),
	];
	const raw: RawTaleRecord = {
		animationPresets: formatAnimationPresets(
			officialPresets.animationPresets ?? [],
			"official",
		),
		blocks,
		backgroundConfig: normalizeTaleBackgroundConfig(backgroundConfig),
		blockStylePresets: formatStylePresets(
			officialPresets.blockStylePresets ?? [],
			"official",
		),
		breakpoints: breakpointConfig ?? [],
		branches: formatBranches(rawBranches ?? []),
		entries: formatEntries(rawEntries ?? []),
		fragments: formatFragments(rawFragments ?? []),
		id: record.id,
		nodes,
		pages,
		parts: formatParts(rawParts ?? []),
		paths: formatPaths(rawPaths ?? []),
		playbackConfig: normalizeTalePlaybackConfig(playbackConfig),
		slug: record.slug,
		snapConfig: normalizeTaleSnapConfig(snapConfig),
		synopsis: record.description ?? "",
		title: record.title,
		firstBlockTransitionMode:
			record.firstBlockTransitionMode ?? "fromPlacement",
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
		...tale,
		bookId: record.bookId,
		backgroundConfig: raw.backgroundConfig,
		breakpoints: raw.breakpoints,
		book: book ?? null,
		cloneable: record.cloneable,
		createdAt: record.createdAt,
		creator: creatorById ?? null,
		creatorId: record.creatorId,
		description: record.description,
		editable: record.editable,
		id: record.id,
		isOfficial: record.isOfficial,
		isVerified: record.isVerified,
		playbackConfig: raw.playbackConfig,
		snapConfig: raw.snapConfig,
		status: record.status,
		type: record.type,
		updatedAt: record.updatedAt,
		visibility: record.visibility,
	};
}
