import type { TalePath } from "~/app/(tale-app)/_shared/types";

export type EditorSurface = "edit" | "reading";
export type EditorEdgeType = "default" | "smoothstep" | "step" | "straight";
export type EditorGraphDirection = "horizontal" | "vertical";
export type EditorPathType = TalePath["type"];
export type PathVisibilityMode = "all" | "primary" | "custom";
export type GraphPosition = { x: number; y: number };
