import type { PathSchema } from "~/server/db/schema";
import type { TaleBranch } from "./branches";

export type TalePath = PathSchema & {
	links: {
		previousPathId: number | null;
		nextPathId: number | null;
	};
	fromBranch: TaleBranch | null;
	toBranch: TaleBranch | null;
};

export type Path = TalePath;
