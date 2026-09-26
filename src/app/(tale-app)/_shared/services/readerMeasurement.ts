import type {
	ResolvedSceneSize,
	SceneSize,
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

function measureContentSceneSize(
	size: Extract<SceneSize, { mode: "content" }>,
	viewport: ViewportSize,
	element: HTMLElement | null | undefined,
) {
	const container = element?.querySelector<HTMLElement>(
		'[data-reader-role="scene-container"]',
	);
	// scrollHeight is an integer and includes descendant overflow. For a
	// content-responsive Scene we need the authored container's actual layout
	// box: it preserves fractional Frame sizing and excludes visual overflow
	// that should not silently extend camera travel.
	const bounds =
		container?.getBoundingClientRect() ?? element?.getBoundingClientRect();
	return {
		height: clampSize(
			bounds?.height ?? viewport.height,
			contentLimit(size.minHeight, size.minHeightUnit, "height", viewport),
			contentLimit(size.maxHeight, size.maxHeightUnit, "height", viewport),
		),
		width: clampSize(
			bounds?.width ?? viewport.width,
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
	sceneIds: string[],
	viewport: ViewportSize,
	root: HTMLElement | null,
) {
	countReaderDiagnostic("measureBlocks()", { sceneCount: sceneIds.length });
	const result: Record<string, ResolvedSceneSize> = {};
	for (const id of sceneIds) {
		const block = tale.indexMap.scenesById[id];
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
		result[id] = measureContentSceneSize(size, viewport, element);
		logReaderDiagnostic("content-sized block measured", {
			sceneId: id,
			height: result[id].height,
			width: result[id].width,
		});
	}
	return result;
}

/**
 * Measures rendered Frame boxes in the offscreen content-size layer. Frame
 * measurements intentionally start at the Frame element, so Scene container
 * padding never becomes part of a Frame's reading span.
 */
export function measureFrames(
	root: HTMLElement | null,
): Record<string, ResolvedSceneSize> {
	const result: Record<string, ResolvedSceneSize> = {};
	if (!root) return result;
	for (const element of root.querySelectorAll<HTMLElement>(
		"[data-reader-frame-id]",
	)) {
		const frameId = element.dataset.readerFrameId;
		if (!frameId) continue;

		result[frameId] = {
			height: Math.max(element.scrollHeight, 1),
			width: Math.max(element.scrollWidth, 1),
		};
	}
	return result;
}
