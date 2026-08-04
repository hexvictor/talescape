"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import clsx from "clsx";
import type { RouteGraphNode as RouteGraphNodeType } from "./compileRouteGraph";

/**
 * Renders one branch node with a distinct handle for every incoming and outgoing path.
 *
 * @param props - React Flow node props containing branch and handle metadata.
 * @returns One route graph branch node.
 *
 * @example
 * const nodeTypes = { route: RouteGraphNode };
 */
export function RouteGraphNode({
	data,
}: NodeProps<RouteGraphNodeType>): React.JSX.Element {
	return (
		<div
			data-reader-component="RouteGraphNode"
			data-reader-role="route-branch"
			className={clsx(
				"relative w-52 rounded-md border px-3 py-2.5 shadow-lg transition-opacity",
				data.current
					? "border-sky-300/75 bg-sky-300/12 text-sky-100"
					: data.selected
						? "border-primary/75 bg-primary/12 text-primary"
						: "border-foreground/14 bg-[#151515] text-foreground/72",
				data.reachable ? "opacity-100" : "opacity-35",
			)}
		>
			<p className="truncate font-semibold text-xs">{data.label}</p>
			<p className="mt-0.5 text-[9px] text-current/55">
				{data.branch.counts.blocks} blocks
			</p>
			{data.incomingPathIds.map((pathId, index) => (
				<Handle
					key={pathId}
					id={pathId}
					type="target"
					position={Position.Left}
					style={{
						top: getHandlePosition(index, data.incomingPathIds.length),
					}}
				/>
			))}
			{data.outgoingPathIds.map((pathId, index) => (
				<Handle
					key={pathId}
					id={pathId}
					type="source"
					position={Position.Right}
					style={{
						top: getHandlePosition(index, data.outgoingPathIds.length),
					}}
				/>
			))}
		</div>
	);
}

/**
 * Spaces route handles evenly along one side of a branch node.
 *
 * @param index - Zero-based handle index.
 * @param count - Number of handles on the same side.
 * @returns Percentage position for the handle.
 */
function getHandlePosition(index: number, count: number): string {
	return `${((index + 1) / (count + 1)) * 100}%`;
}
