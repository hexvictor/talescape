import type { Tale } from "~/app/(tale-app)/_shared/types";

const TALE_JSON_EXPORT_FORMAT = "talescape.tale-export";

export type TaleJsonExport = {
	exportedAt: string;
	format: typeof TALE_JSON_EXPORT_FORMAT;
	tale: Tale;
	version: 1;
};

/**
 * Creates a portable JSON export envelope for the current tale document.
 *
 * @param tale - Current editor tale document.
 * @param exportedAt - Export timestamp.
 * @returns Versioned export envelope.
 *
 * @example
 * const exportData = createTaleJsonExport(tale);
 */
export function createTaleJsonExport(
	tale: Tale,
	exportedAt = new Date(),
): TaleJsonExport {
	return {
		exportedAt: exportedAt.toISOString(),
		format: TALE_JSON_EXPORT_FORMAT,
		tale,
		version: 1,
	};
}

/**
 * Creates a stable JSON filename for one tale export.
 *
 * @param tale - Exported tale document.
 * @param exportedAt - Export timestamp.
 * @returns Safe JSON filename.
 *
 * @example
 * const name = getTaleJsonExportFileName(tale);
 */
export function getTaleJsonExportFileName(
	tale: Tale,
	exportedAt = new Date(),
): string {
	const name = tale.slug ?? tale.title ?? "tale";
	const safeName = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
	const date = exportedAt.toISOString().slice(0, 10);
	return `${safeName || "tale"}-${date}.json`;
}

/**
 * Parses a tale JSON import from either an export envelope or a raw tale object.
 *
 * @param text - Uploaded JSON file contents.
 * @returns Parsed tale document.
 *
 * @example
 * const tale = parseTaleJsonImport(await file.text());
 */
export function parseTaleJsonImport(text: string): Tale {
	const parsed: unknown = JSON.parse(text);
	const tale = isTaleJsonExport(parsed) ? parsed.tale : parsed;
	if (!isImportableTale(tale)) {
		throw new Error("The selected file is not a valid Talescape tale export.");
	}
	return tale;
}

/**
 * Checks whether a parsed value is a Talescape export envelope.
 *
 * @param value - Parsed JSON value.
 * @returns True when the value is a supported export envelope.
 *
 * @example
 * if (isTaleJsonExport(value)) useImport(value.tale);
 */
function isTaleJsonExport(value: unknown): value is TaleJsonExport {
	return (
		isRecord(value) &&
		value.format === TALE_JSON_EXPORT_FORMAT &&
		value.version === 1 &&
		isImportableTale(value.tale)
	);
}

/**
 * Performs a lightweight structural check before importing a tale document.
 *
 * @param value - Parsed JSON value.
 * @returns True when the value has the minimum editor tale shape.
 *
 * @example
 * if (!isImportableTale(value)) throw new Error("Invalid tale");
 */
function isImportableTale(value: unknown): value is Tale {
	if (!isRecord(value)) return false;
	return (
		typeof value.id === "number" &&
		typeof value.title === "string" &&
		isRecord(value.structure) &&
		Array.isArray(value.structure.blocks) &&
		Array.isArray(value.structure.branches) &&
		Array.isArray(value.structure.entries) &&
		Array.isArray(value.structure.pages) &&
		Array.isArray(value.structure.parts)
	);
}

/**
 * Checks whether a value is a non-null object record.
 *
 * @param value - Unknown value.
 * @returns True when the value can be safely read as a record.
 *
 * @example
 * if (isRecord(value)) read(value.id);
 */
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
