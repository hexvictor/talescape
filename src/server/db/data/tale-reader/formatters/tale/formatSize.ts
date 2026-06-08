import type { BlockSize } from "~/app/(tale-reader)/_shared/types";
import type {
	ReaderSizeConfig,
	ReaderSizeMode,
} from "~/server/db/types/tale-reader/readerConfig";

/**
 * Converts a database size mode and config into the frontend size model.
 *
 * @param mode - The database size mode.
 * @param config - The database size config.
 * @returns The frontend block size config.
 *
 * @example
 * const size = formatSize("contentResponsive", row.sizeConfig);
 */
export function formatSize(
	mode: ReaderSizeMode | undefined,
	config?: ReaderSizeConfig,
): BlockSize {
	if (mode === "fixed") {
		return {
			height: config?.height?.value ?? 1,
			heightUnit: config?.height?.unit ?? "viewport",
			horizontalAlignment: config?.horizontalAlignment ?? "center",
			mode: "manual",
			verticalAlignment: config?.verticalAlignment ?? "center",
			width: config?.width?.value ?? 1,
			widthUnit: config?.width?.unit ?? "viewport",
		};
	}
	return {
		horizontalAlignment: config?.horizontalAlignment ?? "center",
		maxHeight: config?.maxHeight?.value,
		maxHeightUnit: config?.maxHeight?.unit,
		maxWidth: config?.maxWidth?.value,
		maxWidthUnit: config?.maxWidth?.unit,
		minHeight: config?.minHeight?.value,
		minHeightUnit: config?.minHeight?.unit,
		minWidth: config?.minWidth?.value,
		minWidthUnit: config?.minWidth?.unit,
		mode: "content",
		verticalAlignment: config?.verticalAlignment ?? "center",
	};
}
