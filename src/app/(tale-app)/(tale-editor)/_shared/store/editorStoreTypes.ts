import type { TalePath } from "~/app/(tale-app)/_shared/types";

export type EditorEdgeType = "default" | "smoothstep" | "step" | "straight";
export type EditorGraphDirection = "horizontal" | "vertical";
export type EditorPathType = TalePath["type"];
export type PathVisibilityMode =
	| "all"
	| "linear"
	| "return"
	| "teleport"
	| "custom";
export type GraphPosition = { x: number; y: number };
export type GraphFocusMode = "ancestry" | "direct" | "off";
