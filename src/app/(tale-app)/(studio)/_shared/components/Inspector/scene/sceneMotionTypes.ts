import type {
	ResolvedTaleScene,
	TaleScene,
} from "~/app/(tale-app)/_shared/types";

/**
 * Applies an immutable update to the inspected scene.
 */
export type BlockChangeHandler = (
	update: (scene: ResolvedTaleScene) => TaleScene,
) => void;
