import type { FragmentSchema } from "~/server/db/schema";
import type { StructurePosition } from "./shared";

export type TaleFragment = FragmentSchema & {
	blockId: number;
	sectionId: number;
	links: {
		previousFragmentId: number | null;
		nextFragmentId: number | null;
		previousFragmentIdInBlock: number | null;
		nextFragmentIdInBlock: number | null;
	};
	position: StructurePosition & {
		isFirstInBlock: boolean;
		isLastInBlock: boolean;
	};
};

export type Fragment = TaleFragment;
