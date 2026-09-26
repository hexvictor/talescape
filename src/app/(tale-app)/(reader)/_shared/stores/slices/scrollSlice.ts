import type { StateCreator } from "zustand/vanilla";
import type {
	Direction,
	ReaderScrollTargetOptions,
} from "../../../../_shared/types";
import type { TaleReaderState } from "../createTaleReaderStore";

/**
 * Checks whether two rendered block windows contain the same block ids.
 *
 * @param left - Previous rendered block ids.
 * @param right - Next rendered block ids.
 * @returns Whether both windows are identical.
 *
 * @example
 * const unchanged = sceneIdsMatch(previousIds, nextIds);
 */
function sceneIdsMatch(left: string[], right: string[]): boolean {
	if (left.length !== right.length) return false;
	return left.every((id, index) => id === right[index]);
}

export type ReaderScrollApi = {
	capturePosition: () => void;
	repaint: () => void;
	scrollToScene: (sceneId: string, opts?: ReaderScrollTargetOptions) => void;
	/** @deprecated Use scrollToScene. */
	scrollToBlock: (sceneId: string, opts?: ReaderScrollTargetOptions) => void;
	scrollToKeyframe: (keyframeId: string, opts?: ReaderScrollTargetOptions) => void;
};

export type ScrollSlice = {
	scroll: {
		api: ReaderScrollApi | null;
		cue: Direction | null;
		pendingRestoreSceneId: string | null;
		pendingRestoreKeyframeId: string | null;
		renderRevision: number;
		renderedSceneIds: string[];
		isApiCurrent: (api: ReaderScrollApi) => boolean;
		setApi: (api: ReaderScrollApi | null) => void;
		setCue: (direction: Direction | null) => void;
		setPendingRestoreSceneId: (sceneId: string | null) => void;
		setPendingRestoreKeyframeId: (keyframeId: string | null) => void;
		setRenderedSceneIds: (sceneIds: string[]) => void;
	};
};

/**
 * Creates imperative scroll ownership and render-window state for one reader.
 *
 * The API contains stable engine commands; frame-by-frame scroll values remain
 * outside Zustand to avoid React subscriptions during camera movement.
 *
 * @returns The initialized reader scroll slice.
 */
export const createScrollSlice: StateCreator<
	TaleReaderState,
	[],
	[],
	ScrollSlice
> = (set) => {
	let currentApi: ReaderScrollApi | null = null;
	const stableApi: ReaderScrollApi = {
		capturePosition: () => currentApi?.capturePosition(),
		repaint: () => currentApi?.repaint(),
		scrollToScene: (sceneId, opts) => currentApi?.scrollToScene(sceneId, opts),
		scrollToBlock: (sceneId, opts) => currentApi?.scrollToBlock(sceneId, opts),
		scrollToKeyframe: (keyframeId, opts) => currentApi?.scrollToKeyframe(keyframeId, opts),
	};
	return {
		scroll: {
			api: stableApi,
			cue: null,
			isApiCurrent: (api) => currentApi === api,
			pendingRestoreSceneId: null,
			pendingRestoreKeyframeId: null,
			renderRevision: 0,
			renderedSceneIds: [],
			setApi: (api) => {
				currentApi = api;
			},
			setCue: (cue) => set((state) => ({ scroll: { ...state.scroll, cue } })),
			setPendingRestoreSceneId: (pendingRestoreSceneId) =>
				set((state) => ({
					scroll: { ...state.scroll, pendingRestoreSceneId },
				})),
			setPendingRestoreKeyframeId: (pendingRestoreKeyframeId) =>
				set((state) => ({
					scroll: { ...state.scroll, pendingRestoreKeyframeId },
				})),
			setRenderedSceneIds: (renderedSceneIds) =>
				set((state) => {
					if (sceneIdsMatch(state.scroll.renderedSceneIds, renderedSceneIds)) {
						return state;
					}
					return {
						scroll: {
							...state.scroll,
							renderRevision: state.scroll.renderRevision + 1,
							renderedSceneIds,
						},
					};
				}),
		},
	};
};
