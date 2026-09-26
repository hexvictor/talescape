import type { KeyframeAction, TaleKeyframe } from "../types";

/** A keyframe is a complete element state, not a list of mutations to replay. */
export function getKeyframeElementState(keyframe: Pick<TaleKeyframe, "actions">, elementId: string): KeyframeAction | undefined {
	return keyframe.actions.find((action) => action.targetType === "element" && action.targetId === elementId);
}

export function resolveKeyframePages(keyframes: readonly TaleKeyframe[]): Map<string, string | null> {
	let currentPage: string | null = null;
	const result = new Map<string, string | null>();
	for (const keyframe of keyframes) {
		if (keyframe.pageId) currentPage = keyframe.pageId;
		result.set(keyframe.id, currentPage);
	}
	return result;
}
