import type { TalePath } from "~/app/(tale-app)/_shared/types";

/**
 * Formats database path rows into the reader path model.
 *
 * @param rows - Path rows returned from the tale query.
 * @returns Reader branch paths with ids normalized to strings.
 *
 * @example
 * const paths = formatPaths(record.paths);
 */
export function formatPaths(rows: unknown[]): TalePath[] {
	return rows.map((row) => {
		const item = row as {
			description?: string | null;
			fromSceneId?: number | null;
			fromKeyframeId?: number | null;
			fromBranchId: number;
			id: number;
			label?: string | null;
			order?: number;
			toSceneId?: number | null;
			toKeyframeId?: number | null;
			toBranchId: number;
			type: string;
		};
		return {
			description: item.description ?? "",
			fromSceneId: String(item.fromSceneId ?? ""),
			fromKeyframeId: item.fromKeyframeId == null ? null : String(item.fromKeyframeId),
			fromBranchId: String(item.fromBranchId),
			id: String(item.id),
			label: item.label ?? "Continue",
			order: item.order ?? 0,
			toSceneId: String(item.toSceneId ?? ""),
			toKeyframeId: item.toKeyframeId == null ? null : String(item.toKeyframeId),
			toBranchId: String(item.toBranchId),
			type: normalizePathType(item.type),
		};
	});
}

/**
 * Normalizes legacy persisted path categories into the current path model.
 *
 * @param type - Persisted path category.
 * @returns Current reader path type.
 *
 * @example
 * const type = normalizePathType("convergence");
 */
function normalizePathType(type: string): TalePath["type"] {
	if (type === "convergence" || type === "ending") return "linear";
	if (type === "return" || type === "teleport" || type === "choice")
		return type;
	return "linear";
}
