"use client";

import {
	BaseEdge,
	type Edge,
	EdgeLabelRenderer,
	type EdgeProps,
	type Position,
	getBezierPath,
	getSmoothStepPath,
	getStraightPath,
} from "@xyflow/react";
import { LineDotRightHorizontal } from "lucide-react";
import { useState } from "react";
import type { TalePath } from "~/app/(tale-app)/_shared/types";

type PathType = TalePath["type"];

export type PathEditorEdgeData = {
	activeConnected: boolean;
	animated: boolean;
	dragging?: boolean;
	edgeType: string;
	fromBranchTitle: string;
	label: string;
	pathType: PathType;
	previewAvailable: boolean;
	previewReachable: boolean;
	selected: boolean;
	toBranchTitle: string;
};

export type PathEditorEdge = Edge<PathEditorEdgeData, "pathEditor">;

/**
 * Renders an editor path edge with direction, hover state, and branch labels.
 *
 * @param props - React Flow edge props.
 * @returns Path edge with direction and endpoint labels.
 *
 * @example
 * <TaleBranchGraphEdge {...edgeProps} />
 */
export function TaleBranchGraphEdge(
	props: EdgeProps<PathEditorEdge>,
): React.JSX.Element {
	const {
		data,
		id,
		markerEnd,
		sourceX,
		sourceY,
		sourcePosition,
		style,
		targetX,
		targetY,
		targetPosition,
	} = props;
	const [hovered, setHovered] = useState(false);
	const dragging = Boolean(data?.dragging);
	const activeConnected = Boolean(data?.activeConnected);
	const emphasized =
		!dragging && (hovered || activeConnected || Boolean(data?.selected));
	const edgeColor = emphasized
		? "#67e8f9"
		: getPreviewEdgeColor({
				available: Boolean(data?.previewAvailable),
				pathType: data?.pathType ?? "choice",
				reachable: data?.previewReachable ?? true,
			});
	const animated =
		!dragging && (hovered || activeConnected || Boolean(data?.animated));
	const secondaryPath =
		data?.pathType === "return" || data?.pathType === "teleport";
	const focusOpacity = typeof style?.opacity === "number" ? style.opacity : 1;
	const [edgePath, labelX, labelY] = getEditorEdgePath({
		edgeType: data?.edgeType ?? "smoothstep",
		sourcePosition,
		sourceX,
		sourceY,
		targetPosition,
		targetX,
		targetY,
	});
	const sourceLabelX = sourceX + (targetX - sourceX) * 0.18;
	const sourceLabelY = sourceY + (targetY - sourceY) * 0.18;
	const targetLabelX = sourceX + (targetX - sourceX) * 0.82;
	const targetLabelY = sourceY + (targetY - sourceY) * 0.82;

	return (
		<>
			<BaseEdge
				className={animated ? "talescape-animated-edge" : undefined}
				id={id}
				markerEnd={markerEnd}
				path={edgePath}
				style={{
					...style,
					opacity:
						secondaryPath && !animated ? focusOpacity * 0.52 : focusOpacity,
					stroke: edgeColor,
					strokeDasharray: secondaryPath || animated ? "9 7" : undefined,
					strokeWidth: emphasized ? 3 : 2,
				}}
			/>
			<path
				className="react-flow__edge-interaction"
				d={edgePath}
				fill="none"
				stroke="transparent"
				strokeWidth={18}
				style={{ pointerEvents: dragging ? "none" : undefined }}
				onMouseEnter={() => {
					if (!dragging) setHovered(true);
				}}
				onMouseLeave={() => {
					if (!dragging) setHovered(false);
				}}
			/>
			{dragging ? null : (
				<EdgeLabelRenderer>
					<div
						data-reader-component="TaleBranchGraphEdge"
						data-reader-role="edge-label"
						className={`nodrag nopan pointer-events-none absolute z-50 grid grid-rows-3 gap-2 font-semibold text-[10px] text-cyan-100 transition-opacity ${
							hovered || data?.selected ? "opacity-100" : "opacity-0"
						}`}
						style={{
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
						}}
					>
						<span className="rounded border border-cyan-300/35 bg-background/90 px-2 py-1 shadow-cyan-300/10 shadow-lg ">
							<LineDotRightHorizontal className="mr-0.5 inline-block h-4 w-4 rotate-180" />{" "}
							{data?.fromBranchTitle ?? "Source branch"}
						</span>
						<span className="rounded border border-cyan-300/35 bg-background/90 px-2 py-1 shadow-cyan-300/10 shadow-lg ">
							{data?.label}
						</span>
						<span className="rounded border border-cyan-300/35 bg-background/90 px-2 py-1 shadow-cyan-300/10 shadow-lg ">
							<LineDotRightHorizontal className="mr-0.5 inline-block h-4 w-4 " />{" "}
							{data?.toBranchTitle ?? "Target branch"}
						</span>
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
}

/**
 * Resolves edge color after preview-route reachability is applied.
 *
 * @param options - Preview visibility and path type inputs.
 * @param options.available - Whether the edge leaves the currently visible route.
 * @param options.pathType - Tale path type.
 * @param options.reachable - Whether both edge endpoints are visible in preview.
 * @returns CSS color for the rendered edge.
 *
 * @example
 * const color = getPreviewEdgeColor({ available: true, pathType: "choice", reachable: false });
 */
function getPreviewEdgeColor({
	available,
	pathType,
	reachable,
}: {
	available: boolean;
	pathType: PathType;
	reachable: boolean;
}): string {
	if (reachable || available) return getPathStrokeColor(pathType);
	return "var(--muted-foreground)";
}

/**
 * Resolves the graph color for a tale path type.
 *
 * @param type - Tale path type.
 * @returns CSS color used by edges and handles.
 *
 * @example
 * const color = getPathStrokeColor("choice");
 */
export function getPathStrokeColor(type: PathType): string {
	const colors: Record<PathType, string> = {
		choice: "#d9b56f",
		linear: "#a78bfa",
		return: "#22c55e",
		teleport: "#38bdf8",
	};
	return colors[type];
}

/**
 * Renders a branch label close to an edge endpoint.
 *
 * @param props - Endpoint label properties.
 * @returns Positioned endpoint label.
 *
 * @example
 * <EdgeEndpointLabel label="River Route" visible x={120} y={80} />
 */
function EdgeEndpointLabel({
	label,
	visible,
	x,
	y,
}: {
	label: string;
	visible: boolean;
	x: number;
	y: number;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="EdgeEndpointLabel"
			data-reader-role="edge-branch-label"
			className={`pointer-events-none absolute max-w-40 truncate rounded border border-foreground/12 bg-background/88 px-2 py-1 text-[9px] text-foreground/68 shadow-lg transition-opacity ${
				visible ? "opacity-100" : "opacity-0"
			}`}
			style={{
				transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
			}}
		>
			{label}
		</div>
	);
}

/**
 * Resolves a React Flow edge path for the configured editor shape.
 *
 * @param options - Edge endpoint coordinates and shape type.
 * @returns Edge path with label coordinates.
 *
 * @example
 * const [path] = getEditorEdgePath(options);
 */
function getEditorEdgePath({
	edgeType,
	sourcePosition,
	sourceX,
	sourceY,
	targetPosition,
	targetX,
	targetY,
}: {
	edgeType: string;
	sourcePosition: Position;
	sourceX: number;
	sourceY: number;
	targetPosition: Position;
	targetX: number;
	targetY: number;
}): [string, number, number] {
	if (edgeType === "straight") {
		const [path, labelX, labelY] = getStraightPath({
			sourceX,
			sourceY,
			targetX,
			targetY,
		});
		return [path, labelX, labelY];
	}
	if (edgeType === "default") {
		const [path, labelX, labelY] = getBezierPath({
			sourcePosition,
			sourceX,
			sourceY,
			targetPosition,
			targetX,
			targetY,
		});
		return [path, labelX, labelY];
	}
	const [path, labelX, labelY] = getSmoothStepPath({
		borderRadius: edgeType === "step" ? 0 : 12,
		sourcePosition,
		sourceX,
		sourceY,
		targetPosition,
		targetX,
		targetY,
	});
	return [path, labelX, labelY];
}
