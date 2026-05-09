import type { TaleSchema } from "~/server/db/schema";
import type { PublicUserInfo } from "../../../users/queries/users.types";
import type { Tale } from "../../types/tales";

export async function getTaleDeprecated(
	_tale: TaleSchema,
	_creator?: PublicUserInfo | null,
): Promise<Tale> {
	throw new Error("getTaleDeprecated was replaced by getTale.");
}
