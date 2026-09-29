type ReaderDomRegistry = {
	sceneElementById: Map<string, HTMLElement>;
	fixedElementsBySceneId: Map<string, Set<HTMLElement>>;
	elementById: Map<string, HTMLElement>;
	frameElementById: Map<string, HTMLElement>;
	getRevision: () => number;
	disconnect: () => void;
};

const readerDomSelector =
	"[data-reader-scene-id], [data-reader-element-id], [data-reader-fixed-scene-id], [data-reader-frame-id]";

/**
 * Indexes mounted reader elements and keeps the indexes synchronized as React
 * mounts and unmounts the render window.
 *
 * @param root - Reader viewport root containing the stage and fixed layer.
 * @returns Direct element indexes and a cleanup function.
 *
 * @example
 * const registry = createReaderDomRegistry(viewport);
 * const block = registry.sceneElementById.get(sceneId);
 */
export function createReaderDomRegistry(root: HTMLElement): ReaderDomRegistry {
	const sceneElementById = new Map<string, HTMLElement>();
	const fixedElementsBySceneId = new Map<string, Set<HTMLElement>>();
	const elementById = new Map<string, HTMLElement>();
	const frameElementById = new Map<string, HTMLElement>();
	let revision = 0;

	const visitElements = (
		node: Node,
		visit: (element: HTMLElement) => void,
	): boolean => {
		if (!(node instanceof HTMLElement)) return false;
		let found = false;
		if (node.matches(readerDomSelector)) {
			visit(node);
			found = true;
		}
		for (const element of node.querySelectorAll<HTMLElement>(
			readerDomSelector,
		)) {
			visit(element);
			found = true;
		}
		return found;
	};

	const registerElement = (element: HTMLElement): void => {
		const sceneId = element.dataset.readerSceneId;
		if (sceneId) sceneElementById.set(sceneId, element);

		const elementId = element.dataset.readerElementId;
		// An Element has an outer layout wrapper and an inner semantic renderer.
		// Keep the first registered wrapper so animation writes can override its
		// default-before-intro opacity instead of styling only the inner child.
		if (elementId && !elementById.has(elementId)) {
			elementById.set(elementId, element);
		}
		const frameId = element.dataset.readerFrameId;
		if (frameId) frameElementById.set(frameId, element);

		const fixedSceneId = element.dataset.readerFixedSceneId;
		if (fixedSceneId) {
			const elements =
				fixedElementsBySceneId.get(fixedSceneId) ?? new Set<HTMLElement>();
			elements.add(element);
			fixedElementsBySceneId.set(fixedSceneId, elements);
		}
	};

	const unregisterElement = (element: HTMLElement): void => {
		const sceneId = element.dataset.readerSceneId;
		if (sceneId && sceneElementById.get(sceneId) === element) {
			sceneElementById.delete(sceneId);
		}

		const elementId = element.dataset.readerElementId;
		if (elementId && elementById.get(elementId) === element) {
			elementById.delete(elementId);
		}
		const frameId = element.dataset.readerFrameId;
		if (frameId && frameElementById.get(frameId) === element) {
			frameElementById.delete(frameId);
		}

		const fixedSceneId = element.dataset.readerFixedSceneId;
		if (fixedSceneId) {
			const elements = fixedElementsBySceneId.get(fixedSceneId);
			elements?.delete(element);
			if (elements?.size === 0) fixedElementsBySceneId.delete(fixedSceneId);
		}
	};

	visitElements(root, registerElement);

	const observer = new MutationObserver((mutations) => {
		let changed = false;
		for (const mutation of mutations) {
			for (const node of mutation.removedNodes) {
				changed = visitElements(node, unregisterElement) || changed;
			}
			for (const node of mutation.addedNodes) {
				changed = visitElements(node, registerElement) || changed;
			}
		}
		if (changed) revision += 1;
	});
	observer.observe(root, { childList: true, subtree: true });

	return {
		sceneElementById,
		disconnect: () => observer.disconnect(),
		fixedElementsBySceneId,
		elementById,
		frameElementById,
		getRevision: () => revision,
	};
}

export type { ReaderDomRegistry };
