import {
	resolveEditedBlock,
	resolveEditedFragment,
} from "~/app/(tale-app)/_shared/services/formatTale";
import type {
	Tale,
	TaleBlock,
	TaleBlockResponsiveOverride,
	TaleBreakpoint,
	TaleFragment,
	TaleFragmentResponsiveOverride,
	ViewportSize,
} from "../types";

/**
 * Resolves the first authored breakpoint that matches the active viewport.
 *
 * @param tale - Current tale document containing breakpoint definitions.
 * @param viewport - Effective viewport dimensions.
 * @returns Matching breakpoint id, or null when the base tale should be used.
 *
 * @example
 * const breakpointId = selectViewportBreakpointId(tale, viewport);
 */
export function selectViewportBreakpointId(
	tale: Tale,
	viewport: ViewportSize,
): string | null {
	const matching = getOrderedBreakpoints(tale)
		.find((breakpoint) => matchesBreakpoint(breakpoint, viewport));
	return matching?.id ?? null;
}

/**
 * Resolves the editor-authored breakpoint target used for preview and edits.
 *
 * The editor does not treat the global base tale as a separate authored layer
 * once breakpoints exist. When at least one breakpoint is defined, the first
 * ordered breakpoint becomes the default editing target unless the user has
 * explicitly selected another authored breakpoint.
 *
 * @param tale - Current tale document.
 * @param selectedBreakpointId - Runtime-selected breakpoint id.
 * @returns Breakpoint id to use for editor preview and editing, or null when
 * no breakpoints exist yet.
 *
 * @example
 * const breakpointId = resolveEditorBreakpointId(tale, state.runtime.breakpointId);
 */
export function resolveEditorBreakpointId(
	tale: Tale,
	selectedBreakpointId: string | null,
): string | null {
	const breakpoints = getOrderedBreakpoints(tale);
	if (breakpoints.length === 0) return null;
	if (
		selectedBreakpointId &&
		breakpoints.some((breakpoint) => breakpoint.id === selectedBreakpointId)
	) {
		return selectedBreakpointId;
	}
	return breakpoints[0]?.id ?? null;
}

/**
 * Applies one breakpoint override layer to the formatted tale document.
 *
 * @param tale - Base formatted tale document.
 * @param breakpointId - Selected breakpoint id, or null for base.
 * @returns Tale view with resolved block and fragment overrides applied.
 *
 * @example
 * const resolved = resolveTaleBreakpoint(tale, "mobile-portrait");
 */
export function resolveTaleBreakpoint(
	tale: Tale,
	breakpointId: string | null,
): Tale {
	if (!breakpointId) return tale;

	const fragments = tale.structure.fragments.map((fragment) =>
		resolveEditedFragment(
			tale,
			applyFragmentOverride(fragment, fragment.responsiveOverrides?.[breakpointId]),
		),
	);
	const fragmentsById = Object.fromEntries(
		fragments.map((fragment) => [fragment.id, fragment]),
	) as Tale["indexMap"]["fragmentsById"];
	const fragmentSource = {
		...tale,
		indexMap: {
			...tale.indexMap,
			fragmentsById,
		},
		structure: {
			...tale.structure,
			fragments,
		},
	};
	const blocks = tale.structure.blocks.map((block) =>
		resolveEditedBlock(
			fragmentSource,
			applyBlockOverride(block, block.responsiveOverrides?.[breakpointId]),
		),
	);
	const blocksById = Object.fromEntries(
		blocks.map((block) => [block.id, block]),
	) as Tale["indexMap"]["blocksById"];

	return {
		...fragmentSource,
		indexMap: {
			...fragmentSource.indexMap,
			blocksById,
		},
		structure: {
			...fragmentSource.structure,
			blocks,
		},
	};
}

/**
 * Writes one block update either to base state or to the selected breakpoint override.
 *
 * @param block - Current authored block.
 * @param next - Updated display block fields.
 * @param breakpointId - Selected breakpoint id, or null for base editing.
 * @returns Base block carrying the updated override state.
 *
 * @example
 * const updated = writeBlockBreakpointOverride(block, nextBlock, "mobile");
 */
export function writeBlockBreakpointOverride(
	block: TaleBlock,
	next: TaleBlock,
	breakpointId: string | null,
): TaleBlock {
	if (!breakpointId) return next;
	return {
		...block,
		responsiveOverrides: {
			...(block.responsiveOverrides ?? {}),
			[breakpointId]: pickBlockOverride(next),
		},
	};
}

/**
 * Writes one fragment update either to base state or to the selected breakpoint override.
 *
 * @param fragment - Current authored fragment.
 * @param next - Updated display fragment fields.
 * @param breakpointId - Selected breakpoint id, or null for base editing.
 * @returns Base fragment carrying the updated override state.
 *
 * @example
 * const updated = writeFragmentBreakpointOverride(fragment, nextFragment, "mobile");
 */
export function writeFragmentBreakpointOverride(
	fragment: TaleFragment,
	next: TaleFragment,
	breakpointId: string | null,
): TaleFragment {
	if (!breakpointId) return next;
	return {
		...fragment,
		responsiveOverrides: {
			...(fragment.responsiveOverrides ?? {}),
			[breakpointId]: pickFragmentOverride(next),
		},
	};
}

/**
 * Returns whether one breakpoint matches the supplied viewport dimensions.
 *
 * @param breakpoint - Breakpoint definition to test.
 * @param viewport - Effective viewport dimensions.
 * @returns Whether the breakpoint should apply.
 */
function matchesBreakpoint(
	breakpoint: TaleBreakpoint,
	viewport: ViewportSize,
): boolean {
	const orientation =
		viewport.height > viewport.width ? "portrait" : "landscape";
	if (
		breakpoint.orientation &&
		breakpoint.orientation !== orientation
	) {
		return false;
	}
	if (
		breakpoint.minWidth !== undefined &&
		viewport.width < breakpoint.minWidth
	) {
		return false;
	}
	if (
		breakpoint.maxWidth !== undefined &&
		viewport.width > breakpoint.maxWidth
	) {
		return false;
	}
	if (
		breakpoint.minHeight !== undefined &&
		viewport.height < breakpoint.minHeight
	) {
		return false;
	}
	if (
		breakpoint.maxHeight !== undefined &&
		viewport.height > breakpoint.maxHeight
	) {
		return false;
	}
	return true;
}

/**
 * Returns breakpoints ordered by authored priority.
 *
 * @param tale - Current tale document.
 * @returns Breakpoints sorted by ascending order.
 */
function getOrderedBreakpoints(tale: Tale): TaleBreakpoint[] {
	return [...tale.breakpoints].sort((left, right) => left.order - right.order);
}

/**
 * Applies a stored fragment override to its base authored fragment.
 *
 * @param fragment - Base fragment.
 * @param override - Optional breakpoint override.
 * @returns Effective fragment fields for the active breakpoint.
 */
function applyFragmentOverride(
	fragment: TaleFragment,
	override: TaleFragmentResponsiveOverride | undefined,
): TaleFragment {
	return override ? { ...fragment, ...override } : fragment;
}

/**
 * Applies a stored block override to its base authored block.
 *
 * @param block - Base block.
 * @param override - Optional breakpoint override.
 * @returns Effective block fields for the active breakpoint.
 */
function applyBlockOverride(
	block: TaleBlock,
	override: TaleBlockResponsiveOverride | undefined,
): TaleBlock {
	return override ? { ...block, ...override } : block;
}

/**
 * Picks the block fields that may be customized per breakpoint.
 *
 * @param block - Display block after editing.
 * @returns Serializable breakpoint override fields.
 */
function pickBlockOverride(block: TaleBlock): TaleBlockResponsiveOverride {
	return {
		description: block.description,
		nodes: block.nodes,
		reading: block.reading,
		rootNodeId: block.rootNodeId,
		size: block.size,
		style: block.style,
		title: block.title,
		transition: block.transition,
	};
}

/**
 * Picks the fragment fields that may be customized per breakpoint.
 *
 * @param fragment - Display fragment after editing.
 * @returns Serializable breakpoint override fields.
 */
function pickFragmentOverride(
	fragment: TaleFragment,
): TaleFragmentResponsiveOverride {
	return {
		alt: fragment.alt,
		animations: fragment.animations,
		attribution: fragment.attribution,
		caption: fragment.caption,
		fallbackSrc: fragment.fallbackSrc,
		label: fragment.label,
		mood: fragment.mood,
		pathId: fragment.pathId,
		pathIds: fragment.pathIds,
		placement: fragment.placement,
		prompt: fragment.prompt,
		src: fragment.src,
		style: fragment.style,
		text: fragment.text,
		visibleRange: fragment.visibleRange,
	};
}
