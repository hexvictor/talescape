"use client";

import { useTaleRenderSlots } from "../../../contexts/TaleRenderContext";
import type { Anchor, ResolvedTaleFragment, TaleNode } from "../../../types";
import { TaleFragment } from "../TaleFragment/TaleFragment";
import { getNodeFragmentStyle, getNodeStyle } from "./nodeStyles";

/**
 * Renders a reader node and its child nodes/fragments.
 *
 * @param props - Node render props.
 * @param props.anchor - Current block anchor.
 * @param props.nodeId - Node id to render.
 * @returns The node subtree or null when the node cannot be found.
 *
 * @example
 * <NodeRenderer anchor={anchor} contentSized={false} nodeId={rootNodeId} />
 */
export function NodeRenderer({
	anchor,
	contentSized,
	fragmentsById,
	measurement = false,
	nodeId,
	nodesById,
}: {
	anchor: Anchor;
	contentSized: boolean;
	fragmentsById: Record<string, ResolvedTaleFragment>;
	measurement?: boolean;
	nodeId: string;
	nodesById: Record<string, TaleNode>;
}): React.JSX.Element | null {
	const { NodeOverlay } = useTaleRenderSlots();
	const node = nodesById[nodeId];
	if (!node) return null;

	return (
		<div
			data-reader-component="NodeRenderer"
			data-reader-node-id={node.id}
			data-reader-role="layout-node"
			className="group/node relative"
			style={getNodeStyle(node, measurement)}
		>
			{NodeOverlay ? (
				<NodeOverlay blockId={anchor.blockId} nodeId={node.id} />
			) : null}
			{node.children.map((child, index) => {
				if (child.type === "node") {
					return (
						<NodeRenderer
							key={child.nodeId}
							anchor={anchor}
							contentSized={contentSized}
							fragmentsById={fragmentsById}
							measurement={measurement}
							nodeId={child.nodeId}
							nodesById={nodesById}
						/>
					);
				}
				const fragment = fragmentsById[child.fragmentId];
				if (!fragment || fragment.placement.mode !== "normal") return null;
				return (
					<FragmentFrame
						key={fragment.id}
						fragment={fragment}
						index={index}
						anchor={anchor}
						contentSized={contentSized}
						parentNode={node}
					/>
				);
			})}
		</div>
	);
}

/**
 * Wraps a fragment with node-aware style before rendering its content.
 *
 * @param props - Fragment frame props.
 * @param props.anchor - Current block anchor.
 * @param props.fragment - Fragment to render.
 * @param props.index - Fragment index within the parent node.
 * @param props.parentNode - Node that owns the fragment.
 * @returns The styled fragment frame.
 *
 * @example
 * <FragmentFrame anchor={anchor} fragment={fragment} index={0} parentNode={node} onChoosePath={choose} />
 */
function FragmentFrame({
	anchor,
	contentSized,
	fragment,
	index,
	parentNode,
}: {
	anchor: Anchor;
	contentSized: boolean;
	fragment: ResolvedTaleFragment;
	index: number;
	parentNode: TaleNode;
}) {
	return (
		<div
			data-reader-component="FragmentFrame"
			data-reader-fragment-id={fragment.id}
			data-reader-role="node-fragment-frame"
			className="relative min-w-0"
			style={getNodeFragmentStyle(fragment.style, parentNode)}
		>
			<TaleFragment
				contentSized={contentSized}
				fragment={fragment}
				index={index}
			/>
		</div>
	);
}
