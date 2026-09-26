import type {
	AmbientAnimationSelection,
	ElementAnimationConfig,
	ReaderStyle,
	TaleFrame,
} from "~/app/(tale-app)/_shared/types";
import type {
	FrameAnimationConfig,
	FrameConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { formatAnimationSelection } from "./formatAnimationSelection";

/**
 * Formats database node rows into the reader node model.
 *
 * @param rows - Node rows returned from the relational query.
 * @returns Frontend reader frames with child node ids remapped to database ids.
 *
 * @example
 * const frames = formatFrames(record.frames);
 */
export function formatFrames(rows: unknown[]): TaleFrame[] {
	const rawNodes = rows.map((row) => {
		const item = row as {
			animationConfig?: FrameAnimationConfig;
			config?: FrameConfig;
			id: number;
			name?: string | null;
			parentFrameId?: number | null;
			stableId?: string | null;
			styleConfig?: ReaderStyle | null;
		};
		const config = item.config ?? {
			children: [],
			id: item.stableId ?? String(item.id),
			mode: "stack",
			parentFrameId:
				item.parentFrameId == null ? null : String(item.parentFrameId),
		};
		return {
			...config,
			animations: formatFrameAnimations(item.animationConfig),
			id: String(item.id),
			name: item.name ?? null,
			stableId: item.stableId ?? String(item.id),
			parentFrameId:
				item.parentFrameId == null ? null : String(item.parentFrameId),
			style: {
				...config.style,
				...(item.styleConfig ?? {}),
			},
		};
	});
	const frameIdsByStableId = new Map(
		rawNodes.map((node) => [node.stableId, node.id]),
	);
	return rawNodes.map((node) => {
		const { stableId: _stableId, ...formatted } = node;
		return {
			...formatted,
			children: formatted.children.map((child) =>
				child.type === "frame"
					? {
							...child,
							frameId: frameIdsByStableId.get(child.frameId) ?? child.frameId,
						}
					: child,
			),
		};
	}) as TaleFrame[];
}

/**
 * Formats persisted node animation selections into the reader animation model.
 *
 * @param config - Persisted node animation configuration.
 * @returns Node animation selections with normalized defaults.
 */
function formatFrameAnimations(
	config?: FrameAnimationConfig,
): ElementAnimationConfig {
	return {
		ambient: {
			...formatAnimationSelection(config?.ambient),
			cycleDurationMs: config?.ambient?.cycleDurationMs ?? 2400,
			endFrameId: config?.ambient?.endFrameId ?? null,
			playback: config?.ambient?.playback ?? "alternate",
			startFrameId: config?.ambient?.startFrameId ?? null,
		},
		previousFrameBridge: formatAnimationSelection(config?.previousFrameBridge),
		previousFrameBridgeLoop: formatAmbientSelection(
			config?.previousFrameBridgeLoop,
		),
		frameIntro: formatAnimationSelection(config?.frameIntro),
		frameOutro: formatAnimationSelection(config?.frameOutro),
		nextFrameBridge: formatAnimationSelection(config?.nextFrameBridge),
		nextFrameBridgeLoop: formatAmbientSelection(config?.nextFrameBridgeLoop),
		previousBridge: formatAnimationSelection(config?.previousBridge),
		previousBridgeLoop: formatAmbientSelection(config?.previousBridgeLoop),
		sceneIntro: formatAnimationSelection(config?.sceneIntro),
		sceneOutro: formatAnimationSelection(config?.sceneOutro),
		nextBridge: formatAnimationSelection(config?.nextBridge),
		nextBridgeLoop: formatAmbientSelection(config?.nextBridgeLoop),
		intro: formatAnimationSelection(config?.intro),
		introLoop: formatAmbientSelection(config?.introLoop),
		hover: formatAnimationSelection(config?.hover),
		outro: formatAnimationSelection(config?.outro),
		outroLoop: formatAmbientSelection(config?.outroLoop),
		active: formatAnimationSelection(config?.active),
		activeLoop: formatAmbientSelection(config?.activeLoop),
	};
}

function formatAmbientSelection(
	selection?: FrameAnimationConfig["ambient"],
): AmbientAnimationSelection {
	return {
		...formatAnimationSelection(selection),
		cycleDurationMs: selection?.cycleDurationMs ?? 2400,
		endFrameId: selection?.endFrameId ?? null,
		playback: selection?.playback ?? "alternate",
		startFrameId: selection?.startFrameId ?? null,
	};
}
