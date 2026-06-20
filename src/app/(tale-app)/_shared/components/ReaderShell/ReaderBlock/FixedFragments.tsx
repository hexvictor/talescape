"use client";

import type { Anchor, ResolvedTaleFragment, TalePath } from "../../../types";
import { ReaderFragment } from "../ReaderFragment/ReaderFragment";
import { positionedStyle } from "./positionedStyle";

/**
 * Renders fixed fragments inside block-owned viewport layers.
 *
 * @param props - Anchor and choice callback used by fixed fragments.
 * @returns Clipped and overflowing fixed-fragment layers.
 *
 * @example
 * <FixedFragments anchor={anchor} onChoosePath={choosePath} />
 */
export function FixedFragments({
	anchor,
	onChoosePath,
}: {
	anchor: Anchor;
	onChoosePath: (path: TalePath) => void;
}): React.JSX.Element | null {
	if (anchor.block.fixedFragments.length === 0) return null;
	const clipped = anchor.block.fixedFragments.filter(
		(fragment) => fragment.placement.overflow !== "visible",
	);
	const overflowing = anchor.block.fixedFragments.filter(
		(fragment) => fragment.placement.overflow === "visible",
	);

	return (
		<>
			{clipped.length > 0 ? (
				<FixedFragmentLayer
					anchor={anchor}
					fragments={clipped}
					overflow="hidden"
					onChoosePath={onChoosePath}
				/>
			) : null}
			{overflowing.length > 0 ? (
				<FixedFragmentLayer
					anchor={anchor}
					fragments={overflowing}
					overflow="visible"
					onChoosePath={onChoosePath}
				/>
			) : null}
		</>
	);
}

/**
 * Renders one block-local viewport layer with a shared clipping policy.
 *
 * @param props - Layer anchor, fragments, overflow, and path callback.
 * @returns One engine-positioned fixed layer.
 *
 * @example
 * <FixedFragmentLayer anchor={anchor} fragments={fragments} overflow="hidden" onChoosePath={choosePath} />
 */
function FixedFragmentLayer({
	anchor,
	fragments,
	onChoosePath,
	overflow,
}: {
	anchor: Anchor;
	fragments: ResolvedTaleFragment[];
	onChoosePath: (path: TalePath) => void;
	overflow: "hidden" | "visible";
}): React.JSX.Element {
	return (
		<div
			data-reader-component="FixedFragments"
			data-reader-fixed-block-id={anchor.block.id}
			data-reader-role={
				overflow === "hidden"
					? "clipped-fixed-fragment-layer"
					: "overflowing-fixed-fragment-layer"
			}
			className="pointer-events-none invisible absolute top-0 left-0"
			style={{ overflow }}
		>
			{fragments.map((fragment, index) => (
				<div
					key={fragment.id}
					data-reader-component="FixedFragments"
					data-reader-role="fixed-fragment-frame"
					className="pointer-events-auto absolute flex items-center justify-center"
					style={{
						fontSize: fragment.style?.fontSize,
						fontWeight: fragment.style?.fontWeight,
						height: fragment.style?.height,
						lineHeight: fragment.style?.lineHeight,
						maxHeight: fragment.style?.maxHeight,
						maxWidth: fragment.style?.maxWidth,
						minHeight: fragment.style?.minHeight,
						minWidth: fragment.style?.minWidth,
						textAlign: fragment.style?.textAlign,
						...positionedStyle(fragment.placement),
					}}
				>
					<div
						data-reader-component="FixedFragments"
						data-reader-role="fixed-fragment-content"
						className="w-full"
					>
						<ReaderFragment
							fragment={fragment}
							index={index}
							onChoosePath={onChoosePath}
						/>
					</div>
				</div>
			))}
		</div>
	);
}
