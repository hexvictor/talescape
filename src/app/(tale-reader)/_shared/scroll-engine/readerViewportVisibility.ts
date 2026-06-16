import type { Anchor, CompiledReader, Point, ViewportSize } from "../types";

type AnchorBounds = {
	anchor: Anchor;
	bottom: number;
	left: number;
	right: number;
	top: number;
};

export type ReaderViewportVisibilityResolver = {
	getNearbyAnchors: (
		camera: Point,
		requiredAnchors: Anchor[],
		margin: number,
	) => Anchor[];
	getVisibleAnchors: (camera: Point, requiredAnchors: Anchor[]) => Anchor[];
};

/**
 * Compiles a spatial index used to find every block intersecting the camera viewport.
 *
 * @param compiled - Compiled reader route and positioned anchors.
 * @param viewport - Active camera viewport dimensions.
 * @returns Resolver that performs bounded spatial lookups during frame painting.
 *
 * @example
 * const visibility = createReaderViewportVisibilityResolver(compiled, viewport);
 * const anchors = visibility.getVisibleAnchors(camera, transitionAnchors);
 */
export function createReaderViewportVisibilityResolver(
	compiled: CompiledReader,
	viewport: ViewportSize,
): ReaderViewportVisibilityResolver {
	const cellWidth = Math.max(viewport.width, 1);
	const cellHeight = Math.max(viewport.height, 1);
	const boundsByBlockId = new Map<string, AnchorBounds>();
	const anchorIndicesByCell = new Map<string, number[]>();
	const candidateMarks = new Uint32Array(compiled.anchors.length);
	const visibleMarks = new Uint32Array(compiled.anchors.length);
	let lookupRevision = 0;

	for (let index = 0; index < compiled.anchors.length; index++) {
		const anchor = compiled.anchors[index];
		if (!anchor) continue;
		const centerX = anchor.point.x;
		const centerY = anchor.point.y;
		const bounds: AnchorBounds = {
			anchor,
			bottom: centerY + anchor.height / 2,
			left: centerX - anchor.width / 2,
			right: centerX + anchor.width / 2,
			top: centerY - anchor.height / 2,
		};
		boundsByBlockId.set(anchor.block.id, bounds);
		for (
			let cellX = Math.floor(bounds.left / cellWidth);
			cellX <= Math.floor(bounds.right / cellWidth);
			cellX++
		) {
			for (
				let cellY = Math.floor(bounds.top / cellHeight);
				cellY <= Math.floor(bounds.bottom / cellHeight);
				cellY++
			) {
				const key = `${cellX}:${cellY}`;
				const indices = anchorIndicesByCell.get(key);
				if (indices) indices.push(index);
				else anchorIndicesByCell.set(key, [index]);
			}
		}
	}

	return {
		getNearbyAnchors(camera, requiredAnchors, margin): Anchor[] {
			return resolveAnchors(camera, requiredAnchors, Math.max(margin, 0));
		},
		getVisibleAnchors(camera, requiredAnchors): Anchor[] {
			return resolveAnchors(camera, requiredAnchors, 0);
		},
	};

	/**
	 * Resolves blocks intersecting the camera rectangle plus an optional viewport margin.
	 *
	 * @param camera - Current world-space camera center.
	 * @param requiredAnchors - Anchors that must remain available for the active segment.
	 * @param margin - Additional viewport spans around the camera rectangle.
	 * @returns Intersecting and required anchors in route order.
	 */
	function resolveAnchors(
		camera: Point,
		requiredAnchors: Anchor[],
		margin: number,
	): Anchor[] {
		lookupRevision++;
		if (lookupRevision === 0xffffffff) {
			candidateMarks.fill(0);
			visibleMarks.fill(0);
			lookupRevision = 1;
		}
		const horizontalMargin = viewport.width * margin;
		const verticalMargin = viewport.height * margin;
		const left = camera.x - viewport.width / 2 - horizontalMargin;
		const right = camera.x + viewport.width / 2 + horizontalMargin;
		const top = camera.y - viewport.height / 2 - verticalMargin;
		const bottom = camera.y + viewport.height / 2 + verticalMargin;
		const candidateIndices: number[] = [];

		for (
			let cellX = Math.floor(left / cellWidth);
			cellX <= Math.floor(right / cellWidth);
			cellX++
		) {
			for (
				let cellY = Math.floor(top / cellHeight);
				cellY <= Math.floor(bottom / cellHeight);
				cellY++
			) {
				for (const index of anchorIndicesByCell.get(`${cellX}:${cellY}`) ??
					[]) {
					if (candidateMarks[index] === lookupRevision) continue;
					candidateMarks[index] = lookupRevision;
					candidateIndices.push(index);
				}
			}
		}

		candidateIndices.sort((first, second) => first - second);
		const visibleAnchors: Anchor[] = [];
		for (const index of candidateIndices) {
			const anchor = compiled.anchors[index];
			if (!anchor) continue;
			const bounds = boundsByBlockId.get(anchor.block.id);
			if (
				!bounds ||
				bounds.right <= left ||
				bounds.left >= right ||
				bounds.bottom <= top ||
				bounds.top >= bottom
			) {
				continue;
			}
			visibleMarks[index] = lookupRevision;
			visibleAnchors.push(anchor);
		}
		for (const anchor of requiredAnchors) {
			const index = compiled.anchorIndexByBlockId[anchor.block.id];
			if (index === undefined || visibleMarks[index] === lookupRevision)
				continue;
			visibleMarks[index] = lookupRevision;
			visibleAnchors.push(anchor);
		}
		return visibleAnchors;
	}
}
