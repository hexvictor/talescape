import type {
	FragmentPlacement,
	ReaderStyle,
	TaleFragment,
} from "~/app/(tale-reader)/_shared/types";
import type { AnimationSelection as DbAnimationSelection } from "~/server/db/types/tale-reader/readerConfig";
import type { AmbientAnimationSelection as DbAmbientAnimationSelection } from "~/server/db/types/tale-reader/readerConfig";
import { formatAnimationSelection } from "./formatAnimationSelection";

/**
 * Formats database fragment rows into the reader fragment model.
 *
 * @param rows - Fragment rows returned from the tale query.
 * @returns Reader fragments with normalized placement and animation configs.
 *
 * @example
 * const fragments = formatFragments(record.fragments);
 */
export function formatFragments(rows: unknown[]): TaleFragment[] {
	return rows.map((row) => {
		const item = row as {
			animationConfig?: {
				ambient?: DbAmbientAnimationSelection;
				entering?: DbAnimationSelection;
				leaving?: DbAnimationSelection;
				scrolling?: DbAnimationSelection;
			};
			blockId: number;
			content?: Record<string, unknown>;
			data?: Record<string, unknown>;
			id: number;
			nodeId?: number | null;
			placementConfig?: FragmentPlacement;
			order?: number;
			styleConfig?: ReaderStyle | null;
			type: string;
			visibleRange?: TaleFragment["visibleRange"];
		};
		const content = item.content ?? item.data ?? {};
		const type = formatFragmentType(item.type, content);
		return {
			alt: getString(content.alt),
			animations: {
				ambient: {
					...formatAnimationSelection(item.animationConfig?.ambient),
					cycleDurationMs:
						item.animationConfig?.ambient?.cycleDurationMs ?? 2400,
					playback: item.animationConfig?.ambient?.playback ?? "alternate",
				},
				entering: formatAnimationSelection(item.animationConfig?.entering),
				leaving: formatAnimationSelection(item.animationConfig?.leaving),
				scrolling: formatAnimationSelection(item.animationConfig?.scrolling),
			},
			attribution: getString(content.attribution),
			caption: getString(content.caption),
			fallbackSrc:
				getString(content.fallbackSrc) ??
				getString(content.fallbackUrl) ??
				null,
			id: String(item.id),
			label: getString(content.label),
			mood: getString(content.mood),
			nodeId: item.nodeId == null ? null : String(item.nodeId),
			order: item.order ?? 0,
			pathId: getString(content.pathId),
			pathIds: getStringArray(content.pathIds),
			placement: normalizePlacement(
				item.placementConfig ?? defaultPlacement(),
				item.nodeId,
			),
			prompt: getString(content.prompt),
			src: getString(content.src) ?? getString(content.url) ?? null,
			style: item.styleConfig ?? undefined,
			text: getString(content.text) ?? getString(content.content),
			type,
			visibleRange: item.visibleRange,
		};
	});
}

/**
 * Normalizes raw database fragment type data for the reader.
 *
 * @param type - Persisted fragment type.
 * @param content - Fragment content payload.
 * @returns The reader fragment type.
 *
 * @example
 * const type = formatFragmentType(row.type, row.content);
 */
function formatFragmentType(
	type: string,
	content: Record<string, unknown>,
): TaleFragment["type"] {
	if (type === "audio") return "soundCue";
	if (type === "choiceButton") return "choiceButton";
	if (type === "quote") return "quote";
	if (type === "image") return "image";
	if (type === "soundCue") return "soundCue";
	if (content.pathId) return "choiceButton";
	return "text";
}

/**
 * Provides the default fragment placement used when none is stored.
 *
 * @returns A normal-flow fragment placement.
 *
 * @example
 * const placement = defaultPlacement();
 */
function defaultPlacement(): FragmentPlacement {
	return { mode: "normal" };
}

/**
 * Normalizes placement configs into the current normal/absolute/fixed model.
 *
 * @param placement - Placement data from the database.
 * @param nodeId - Optional node id relation from the fragment row.
 * @returns A placement supported by the current reader engine.
 *
 * @example
 * const placement = normalizePlacement(row.placementConfig, row.nodeId);
 */
function normalizePlacement(
	placement: FragmentPlacement,
	nodeId?: number | null,
): FragmentPlacement {
	const resolvedNodeId = nodeId == null ? placement.nodeId : String(nodeId);

	if (placement.mode === "absolute" || placement.mode === "fixed") {
		return {
			...placement,
			nodeId: resolvedNodeId,
		};
	}

	return {
		mode: "normal",
		nodeId: resolvedNodeId,
		overflow: placement.overflow,
	};
}

/**
 * Reads a string value from an unknown content payload field.
 *
 * @param value - Unknown content field.
 * @returns The field when it is a string.
 *
 * @example
 * const text = getString(content.text);
 */
function getString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

/**
 * Reads a string array from an unknown content payload field.
 *
 * @param value - Unknown content field.
 * @returns The field when it is an array of strings.
 *
 * @example
 * const ids = getStringArray(content.pathIds);
 */
function getStringArray(value: unknown): string[] | undefined {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: undefined;
}
