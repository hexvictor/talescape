import type {
	TaleFrame,
	TaleScene,
	TaleSceneResponsiveOverride,
} from "../types";
import { resolveIds } from "./taleLookups";

type PersistedResponsiveOverride = TaleSceneResponsiveOverride & {
	frames?: TaleFrame[];
};

export function normalizeResponsiveSceneFrames(block: TaleScene): {
	scene: TaleScene;
	frames: TaleFrame[];
} {
	const frames: TaleFrame[] = [];
	const responsiveOverrides = Object.fromEntries(
		Object.entries(block.responsiveOverrides ?? {}).map(
			([breakpointId, value]) => {
				const { frames: persistedFrames, ...override } =
					value as PersistedResponsiveOverride;
				if (!persistedFrames?.length) return [breakpointId, override];

				const idBySourceId = new Map(
					persistedFrames.map((frame) => [
						frame.id,
						responsiveFrameId(block.id, breakpointId, frame.id),
					]),
				);
				const normalizedFrames = persistedFrames.map((frame) => ({
					...frame,
					children: frame.children.map((child) =>
						child.type === "frame"
							? {
									...child,
									frameId: idBySourceId.get(child.frameId) ?? child.frameId,
								}
							: child,
					),
					id: idBySourceId.get(frame.id) ?? frame.id,
					parentFrameId: frame.parentFrameId
						? (idBySourceId.get(frame.parentFrameId) ?? frame.parentFrameId)
						: null,
				})) as TaleFrame[];
				frames.push(...normalizedFrames);
				return [
					breakpointId,
					{
						...override,
						frameIds: normalizedFrames.map((frame) => frame.id),
						rootFrameId: override.rootFrameId
							? (idBySourceId.get(override.rootFrameId) ?? override.rootFrameId)
							: undefined,
					},
				];
			},
		),
	) as Record<string, TaleSceneResponsiveOverride>;

	return {
		scene: { ...block, responsiveOverrides },
		frames,
	};
}

export function serializeResponsiveSceneFrames(
	block: TaleScene,
	framesById: Record<string, TaleFrame>,
): Record<string, PersistedResponsiveOverride> {
	return Object.fromEntries(
		Object.entries(block.responsiveOverrides ?? {}).map(
			([breakpointId, value]) => {
				if (!value.frameIds?.length) return [breakpointId, value];
				const prefix = responsiveFramePrefix(block.id, breakpointId);
				const frames = resolveIds(value.frameIds, framesById).map((frame) => ({
					...frame,
					children: frame.children.map((child) =>
						child.type === "frame"
							? { ...child, frameId: removePrefix(child.frameId, prefix) }
							: child,
					),
					id: removePrefix(frame.id, prefix),
					parentFrameId: frame.parentFrameId
						? removePrefix(frame.parentFrameId, prefix)
						: null,
				})) as TaleFrame[];
				const { frameIds: _frameIds, ...override } = value;
				return [
					breakpointId,
					{
						...override,
						frames,
						rootFrameId: override.rootFrameId
							? removePrefix(override.rootFrameId, prefix)
							: undefined,
					},
				];
			},
		),
	);
}

export function scopeResponsiveFrames(
	sceneId: string,
	breakpointId: string,
	frames: TaleFrame[],
	rootFrameId: string,
): { frames: TaleFrame[]; rootFrameId: string } {
	const prefix = responsiveFramePrefix(sceneId, breakpointId);
	const idBySourceId = new Map(
		frames.map((frame) => [
			frame.id,
			frame.id.startsWith(prefix) ? frame.id : `${prefix}${frame.id}`,
		]),
	);
	return {
		frames: frames.map((frame) => ({
			...frame,
			children: frame.children.map((child) =>
				child.type === "frame"
					? {
							...child,
							frameId: idBySourceId.get(child.frameId) ?? child.frameId,
						}
					: child,
			),
			id: idBySourceId.get(frame.id) ?? frame.id,
			parentFrameId: frame.parentFrameId
				? (idBySourceId.get(frame.parentFrameId) ?? frame.parentFrameId)
				: null,
		})) as TaleFrame[],
		rootFrameId: idBySourceId.get(rootFrameId) ?? rootFrameId,
	};
}

function responsiveFrameId(
	sceneId: string,
	breakpointId: string,
	frameId: string,
): string {
	return `${responsiveFramePrefix(sceneId, breakpointId)}${frameId}`;
}

function responsiveFramePrefix(sceneId: string, breakpointId: string): string {
	return `responsive:${sceneId}:${breakpointId}:`;
}

function removePrefix(value: string, prefix: string): string {
	return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}
