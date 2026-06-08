import type {
	BlockSize,
	ResolvedBlockSize,
	Tale,
	ViewportSize,
} from "../types";
import {
	countReaderDiagnostic,
	logReaderDiagnostic,
} from "./readerDiagnostics";

function clampSize(value: number, min?: number, max?: number) {
	return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? 0, value));
}

function contentLimit(
	value: number | undefined,
	unit: "px" | "viewport" | undefined,
	axis: "height" | "width",
	viewport: ViewportSize,
) {
	if (value === undefined) return undefined;
	if (unit !== "viewport") return value;
	return value * (axis === "width" ? viewport.width : viewport.height);
}

function manualSize(
	value: number,
	unit: "px" | "viewport",
	axis: "height" | "width",
	viewport: ViewportSize,
) {
	return unit === "viewport"
		? value * (axis === "width" ? viewport.width : viewport.height)
		: value;
}

function measureContentBlockSize(
	size: Extract<BlockSize, { mode: "content" }>,
	viewport: ViewportSize,
	element: HTMLElement | null | undefined,
) {
	return {
		height: clampSize(
			element?.scrollHeight ?? viewport.height,
			contentLimit(size.minHeight, size.minHeightUnit, "height", viewport),
			contentLimit(size.maxHeight, size.maxHeightUnit, "height", viewport),
		),
		width: clampSize(
			element?.scrollWidth ?? viewport.width,
			contentLimit(size.minWidth, size.minWidthUnit, "width", viewport),
			contentLimit(size.maxWidth, size.maxWidthUnit, "width", viewport),
		),
	};
}

export async function waitForReaderAssets(root: HTMLElement | null) {
	if (!root) return;
	logReaderDiagnostic("waiting for measurement assets", {
		images: root.querySelectorAll("img").length,
	});
	await document.fonts?.ready;
	const images = Array.from(root.querySelectorAll("img"));
	await Promise.all(
		images.map((image) => {
			if (image.complete) return Promise.resolve();
			return new Promise<void>((resolve) => {
				image.addEventListener("load", () => resolve(), { once: true });
				image.addEventListener("error", () => resolve(), { once: true });
			});
		}),
	);
}

export function measureBlocks(
	tale: Tale,
	blockIds: string[],
	viewport: ViewportSize,
	root: HTMLElement | null,
) {
	countReaderDiagnostic("measureBlocks()", { blockCount: blockIds.length });
	const result: Record<string, ResolvedBlockSize> = {};
	for (const id of blockIds) {
		const block = tale.indexMap.blocksById[id];
		if (!block) continue;
		const size = block.size;
		if (size.mode === "manual") {
			result[id] = {
				height: manualSize(size.height, size.heightUnit, "height", viewport),
				width: manualSize(size.width, size.widthUnit, "width", viewport),
			};
			continue;
		}

		const element = root?.querySelector<HTMLElement>(
			`[data-reader-measure-block="${id}"]`,
		);
		result[id] = measureContentBlockSize(size, viewport, element);
		logReaderDiagnostic("content-sized block measured", {
			blockId: id,
			height: result[id].height,
			width: result[id].width,
		});
	}
	return result;
}
