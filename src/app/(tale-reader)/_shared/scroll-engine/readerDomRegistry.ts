type ReaderDomRegistry = {
	blockElementById: Map<string, HTMLElement>;
	fixedElementsByBlockId: Map<string, Set<HTMLElement>>;
	fragmentElementById: Map<string, HTMLElement>;
	getRevision: () => number;
	disconnect: () => void;
};

/**
 * Indexes mounted reader elements and keeps the indexes synchronized as React
 * mounts and unmounts the render window.
 *
 * @param root - Reader viewport root containing the stage and fixed layer.
 * @returns Direct element indexes and a cleanup function.
 *
 * @example
 * const registry = createReaderDomRegistry(viewport);
 * const block = registry.blockElementById.get(blockId);
 */
export function createReaderDomRegistry(root: HTMLElement): ReaderDomRegistry {
	const blockElementById = new Map<string, HTMLElement>();
	const fixedElementsByBlockId = new Map<string, Set<HTMLElement>>();
	const fragmentElementById = new Map<string, HTMLElement>();
	let revision = 0;

	const visitElements = (
		node: Node,
		visit: (element: HTMLElement) => void,
	): boolean => {
		if (!(node instanceof HTMLElement)) return false;
		let found = false;
		if (
			node.matches(
				"[data-reader-block-id], [data-reader-fragment-id], [data-reader-fixed-block-id]",
			)
		) {
			visit(node);
			found = true;
		}
		for (const element of node.querySelectorAll<HTMLElement>(
			"[data-reader-block-id], [data-reader-fragment-id], [data-reader-fixed-block-id]",
		)) {
			visit(element);
			found = true;
		}
		return found;
	};

	const registerElement = (element: HTMLElement): void => {
		const blockId = element.dataset.readerBlockId;
		if (blockId) blockElementById.set(blockId, element);

		const fragmentId = element.dataset.readerFragmentId;
		if (fragmentId) fragmentElementById.set(fragmentId, element);

		const fixedBlockId = element.dataset.readerFixedBlockId;
		if (fixedBlockId) {
			const elements =
				fixedElementsByBlockId.get(fixedBlockId) ?? new Set<HTMLElement>();
			elements.add(element);
			fixedElementsByBlockId.set(fixedBlockId, elements);
		}
	};

	const unregisterElement = (element: HTMLElement): void => {
		const blockId = element.dataset.readerBlockId;
		if (blockId && blockElementById.get(blockId) === element) {
			blockElementById.delete(blockId);
		}

		const fragmentId = element.dataset.readerFragmentId;
		if (fragmentId && fragmentElementById.get(fragmentId) === element) {
			fragmentElementById.delete(fragmentId);
		}

		const fixedBlockId = element.dataset.readerFixedBlockId;
		if (fixedBlockId) {
			const elements = fixedElementsByBlockId.get(fixedBlockId);
			elements?.delete(element);
			if (elements?.size === 0) fixedElementsByBlockId.delete(fixedBlockId);
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
		blockElementById,
		disconnect: () => observer.disconnect(),
		fixedElementsByBlockId,
		fragmentElementById,
		getRevision: () => revision,
	};
}

export type { ReaderDomRegistry };
