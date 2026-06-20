import type {
	AmbientAnimationSelection,
	AnimationSelection,
	BlockSize,
	Tale,
	TaleBlock,
	TaleFragment,
	TaleNode,
} from "~/app/(tale-app)/_shared/types";

/**
 * Creates the normalized save payload for existing editable tale rows.
 *
 * @param tale - Current in-memory tale state.
 * @returns Payload accepted by the tale editor save mutation.
 *
 * @example
 * const payload = createTaleEditorDraftPayload(tale);
 */
export function createTaleEditorDraftPayload(tale: Tale) {
	return {
		branches: tale.structure.branches
			.filter((branch) => Number.isFinite(Number(branch.id)))
			.map((branch) => ({
				description: branch.description ?? null,
				id: Number(branch.id),
				order: branch.order,
				parentBranchId:
					branch.parentBranchId === null ? null : Number(branch.parentBranchId),
				title: branch.title,
			})),
		blocks: tale.structure.blocks
			.filter((block) => Number.isFinite(Number(block.id)))
			.map((block) => ({
				branchId: Number(block.branchId),
				description: block.description ?? null,
				id: Number(block.id),
				isChoiceBlock: block.isChoiceBlock,
				order: block.order,
				readingConfig: serializeReadingConfig(block),
				sizeConfig: serializeSizeConfig(block.size),
				sizeMode: (block.size.mode === "manual"
					? "fixed"
					: "contentResponsive") as "fixed" | "contentResponsive",
				snap: block.snap,
				styleConfig: block.style ?? null,
				title: block.title,
				transitionConfig: serializeTransitionConfig(block),
			})),
		description: tale.description ?? "",
		firstBlockTransitionMode: tale.firstBlockTransitionMode ?? "fromPlacement",
		fragments: tale.structure.fragments
			.filter((fragment) => Number.isFinite(Number(fragment.id)))
			.map((fragment) => ({
				animationConfig: serializeFragmentAnimationConfig(fragment),
				content: serializeFragmentContent(fragment),
				data: serializeFragmentContent(fragment),
				id: Number(fragment.id),
				nodeId: fragment.nodeId === null ? null : Number(fragment.nodeId),
				order: fragment.order,
				placementConfig: fragment.placement,
				styleConfig: fragment.style ?? null,
				type: fragment.type,
				visibleRange: fragment.visibleRange ?? null,
			})),
		nodes: tale.structure.nodes
			.filter((node) => Number.isFinite(Number(node.id)))
			.map((node) => ({
				animationConfig: node.animations,
				config: serializeNodeConfig(node),
				id: Number(node.id),
				name: null,
				order: node.style?.order ?? 0,
				parentNodeId:
					node.parentNodeId === null ? null : Number(node.parentNodeId),
				styleConfig: node.style ?? null,
			})),
		paths: tale.structure.paths
			.filter((path) => Number.isFinite(Number(path.id)))
			.map((path) => ({
				description: path.description ?? null,
				fromBlockId: Number(path.fromBlockId),
				fromBranchId: Number(path.fromBranchId),
				id: Number(path.id),
				label: path.label,
				order: path.order,
				toBlockId: Number(path.toBlockId),
				toBranchId: Number(path.toBranchId),
				type: path.type,
			})),
		taleId: tale.id,
		title: tale.title ?? "Untitled Tale",
		transitionFirstBlock: tale.transitionFirstBlock ?? false,
	};
}

/**
 * Converts a frontend block size into persisted size config.
 *
 * @param size - Frontend block size.
 * @returns Persisted reader size config.
 *
 * @example
 * const config = serializeSizeConfig(block.size);
 */
function serializeSizeConfig(size: BlockSize) {
	if (size.mode === "manual") {
		return {
			height: { unit: size.heightUnit, value: size.height },
			horizontalAlignment: size.horizontalAlignment,
			verticalAlignment: size.verticalAlignment,
			width: { unit: size.widthUnit, value: size.width },
		};
	}

	return {
		horizontalAlignment: size.horizontalAlignment,
		maxHeight:
			size.maxHeight === undefined
				? undefined
				: { unit: size.maxHeightUnit ?? "px", value: size.maxHeight },
		maxWidth:
			size.maxWidth === undefined
				? undefined
				: { unit: size.maxWidthUnit ?? "px", value: size.maxWidth },
		minHeight:
			size.minHeight === undefined
				? undefined
				: { unit: size.minHeightUnit ?? "px", value: size.minHeight },
		minWidth:
			size.minWidth === undefined
				? undefined
				: { unit: size.minWidthUnit ?? "px", value: size.minWidth },
		verticalAlignment: size.verticalAlignment,
	};
}

/**
 * Converts frontend block reading settings into persisted reading config.
 *
 * @param block - Frontend tale block.
 * @returns Persisted reading config.
 *
 * @example
 * const config = serializeReadingConfig(block);
 */
function serializeReadingConfig(block: TaleBlock) {
	return {
		animationConfig: {
			ambient: serializeAmbientSelection(block.reading.animations.ambient),
			scrolling: serializeSelection(block.reading.animations.scrolling),
		},
		cameraPath: block.reading.cameraPath,
		pauses: block.reading.pauses,
		readingLength: block.reading.readingLength,
		readingLengthMode: block.reading.readingLengthMode,
	};
}

/**
 * Converts frontend block transition settings into persisted transition config.
 *
 * @param block - Frontend tale block.
 * @returns Persisted transition config.
 *
 * @example
 * const config = serializeTransitionConfig(block);
 */
function serializeTransitionConfig(block: TaleBlock) {
	return {
		animationConfig: {
			entering: serializeSelection(block.transition.animations.entering),
			leaving: serializeSelection(block.transition.animations.leaving),
		},
		enteringLength: block.transition.enteringLength,
		flow: block.transition.flow,
		leavingLength: block.transition.leavingLength,
	};
}

/**
 * Converts fragment animation selections into persisted animation config.
 *
 * @param fragment - Frontend tale fragment.
 * @returns Persisted fragment animation config.
 *
 * @example
 * const config = serializeFragmentAnimationConfig(fragment);
 */
function serializeFragmentAnimationConfig(fragment: TaleFragment) {
	return {
		ambient: serializeAmbientSelection(fragment.animations.ambient),
		entering: serializeSelection(fragment.animations.entering),
		leaving: serializeSelection(fragment.animations.leaving),
		scrolling: serializeSelection(fragment.animations.scrolling),
	};
}

/**
 * Converts a frontend animation selection into persisted selection shape.
 *
 * @param selection - Frontend animation selection.
 * @returns Persisted selection.
 *
 * @example
 * const selection = serializeSelection(fragment.animations.entering);
 */
function serializeSelection(selection: AnimationSelection) {
	return { tracks: selection.animations };
}

/**
 * Converts a frontend ambient animation selection into persisted selection shape.
 *
 * @param selection - Frontend ambient animation selection.
 * @returns Persisted ambient selection.
 *
 * @example
 * const selection = serializeAmbientSelection(fragment.animations.ambient);
 */
function serializeAmbientSelection(selection: AmbientAnimationSelection) {
	return {
		cycleDurationMs: selection.cycleDurationMs,
		playback: selection.playback,
		tracks: selection.animations,
	};
}

/**
 * Converts a fragment into its persisted content payload.
 *
 * @param fragment - Frontend tale fragment.
 * @returns Persisted content payload.
 *
 * @example
 * const content = serializeFragmentContent(fragment);
 */
function serializeFragmentContent(
	fragment: TaleFragment,
): Record<string, unknown> {
	return {
		alt: fragment.alt,
		attribution: fragment.attribution,
		caption: fragment.caption,
		content: fragment.text,
		fallbackSrc: fragment.fallbackSrc,
		fallbackUrl: fragment.fallbackSrc,
		label: fragment.label,
		mood: fragment.mood,
		pathId: fragment.pathId,
		pathIds: fragment.pathIds,
		prompt: fragment.prompt,
		src: fragment.src,
		text: fragment.text,
		url: fragment.src,
	};
}

/**
 * Converts a frontend node into its persisted node config.
 *
 * @param node - Frontend tale node.
 * @returns Persisted node config.
 *
 * @example
 * const config = serializeNodeConfig(node);
 */
function serializeNodeConfig(node: TaleNode): Record<string, unknown> {
	return {
		align: "align" in node ? node.align : undefined,
		children: node.children,
		columns: "columns" in node ? node.columns : undefined,
		direction: "direction" in node ? node.direction : undefined,
		gap: "gap" in node ? node.gap : undefined,
		justify: "justify" in node ? node.justify : undefined,
		mode: node.mode,
		overflow: node.overflow,
		rows: "rows" in node ? node.rows : undefined,
		wrap: "wrap" in node ? node.wrap : undefined,
	};
}
