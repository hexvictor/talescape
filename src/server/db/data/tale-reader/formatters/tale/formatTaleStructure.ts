import { formatTale } from "~/app/(tale-app)/_shared/services/formatTale";
import { normalizeTalePlaybackConfig } from "~/app/(tale-app)/_shared/services/readerPlaybackSettings";
import { normalizeTaleSnapConfig } from "~/app/(tale-app)/_shared/services/readerSnapSettings";
import { normalizeResponsiveSceneFrames } from "~/app/(tale-app)/_shared/services/responsiveFrames";
import { normalizeTaleBackgroundConfig } from "~/app/(tale-app)/_shared/services/taleBackgroundSettings";
import type { RawTaleRecord, Tale } from "~/app/(tale-app)/_shared/types";
import { formatBranches } from "../branches/formatBranches";
import { formatElements } from "../elements/formatElements";
import { formatEntries } from "../entries/formatEntries";
import { formatFrames } from "../frames/formatFrames";
import { formatPages } from "../pages/formatPages";
import { formatParts } from "../parts/formatParts";
import { formatPaths } from "../paths/formatPaths";
import {
	formatAnimationPresets,
	formatStylePresets,
	formatTransitionPresets,
	formatVisibilityPresets,
} from "../presets/formatPresets";
import { formatScenes } from "../scenes/formatScenes";
import { withFallbackPresets } from "./fallbackPresets";
import { formatKeyframes } from "./formatKeyframes";
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
		scenes: rawScenes,
		backgroundConfig,
		book,
		branches: rawBranches,
		breakpointConfig,
		creatorById,
		entries: rawEntries,
		elements: rawElements,
		frames: rawFrames,
		pages: rawPages,
		parts: rawParts,
		paths: rawPaths,
		keyframes: rawKeyframes,
		playbackConfig,
		snapConfig,
	} = record;
	const pages = formatPages(rawPages ?? []);
	const responsiveFrames = formatScenes(rawScenes ?? [], pages).map(
		normalizeResponsiveSceneFrames,
	);
	const scenes = responsiveFrames.map((result) => result.scene);
	const frames = [
		...formatFrames(rawFrames ?? []),
		...responsiveFrames.flatMap((result) => result.frames),
	];
	const keyframes = formatKeyframes(rawKeyframes ?? [], scenes);
	const keyframeIdsByScene = new Map<string, string[]>();
	for (const step of keyframes) {
		const ids = keyframeIdsByScene.get(step.sceneId) ?? [];
		ids.push(step.id);
		keyframeIdsByScene.set(step.sceneId, ids);
	}
	for (const scene of scenes)
		scene.keyframeIds = keyframeIdsByScene.get(scene.id) ?? [];
	const raw: RawTaleRecord = {
		animationPresets: formatAnimationPresets(
			officialPresets.animationPresets ?? [],
			"official",
		),
		scenes,
		backgroundConfig: normalizeTaleBackgroundConfig(backgroundConfig),
		sceneStylePresets: formatStylePresets(
			officialPresets.sceneStylePresets ?? [],
			"official",
		),
		breakpoints: breakpointConfig ?? [],
		branches: formatBranches(rawBranches ?? []),
		entries: formatEntries(rawEntries ?? []),
		elements: formatElements(rawElements ?? []),
		id: record.id,
		frames,
		pages,
		parts: formatParts(rawParts ?? []),
		paths: formatPaths(rawPaths ?? []),
		keyframes,
		playbackConfig: normalizeTalePlaybackConfig(playbackConfig),
		slug: record.slug,
		snapConfig: normalizeTaleSnapConfig(snapConfig),
		synopsis: record.description ?? "",
		title: record.title,
		firstSceneTransitionMode:
			record.firstSceneTransitionMode ?? "fromPlacement",
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
