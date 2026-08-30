"use client";

import type { TaleInspectorTarget } from "~/app/(tale-app)/_shared/types";
import { BlockInspectorPanel } from "./block/BlockInspectorPanel";
import { FragmentInspectorPanel } from "./fragment/FragmentInspectorPanel";

/**
 * Routes an inspector target to its isolated editor panel.
 *
 * @param props - Inspector router props.
 * @param props.target - Block or fragment target selected in the reader.
 * @returns Target-specific inspector panel.
 *
 * @example
 * <TaleInspectorPanel target={target} />
 */
export function TaleInspectorPanel({
	target,
}: {
	target: TaleInspectorTarget;
}) {
	return target.type === "block" ? (
		<BlockInspectorPanel key={`block:${target.id}`} blockId={target.id} />
	) : target.type === "node" ? (
		<BlockInspectorPanel
			key={`node:${target.id}`}
			blockId={target.blockId}
			initialNodeId={target.id}
			initialTab="layout"
		/>
	) : (
		<FragmentInspectorPanel
			key={`fragment:${target.id}:${target.initialTab ?? "summary"}`}
			blockId={target.blockId}
			fragmentId={target.id}
			initialTab={target.initialTab}
		/>
	);
}
