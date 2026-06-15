"use client";

import type {
	Anchor,
	ResolvedTaleFragment,
	TaleNode,
	TalePath,
} from "../../../types";
import { ReaderFragment } from "../ReaderFragment/ReaderFragment";
import { getNodeFragmentStyle, getNodeStyle } from "./nodeStyles";

/**
 * Renders a reader node and its child nodes/fragments.
 *
 * @param props - Node render props.
 * @param props.anchor - Current block anchor.
 * @param props.nodeId - Node id to render.
 * @param props.onChoosePath - Callback used by choice button fragments.
 * @returns The node subtree or null when the node cannot be found.
 *
 * @example
 * <NodeRenderer anchor={anchor} nodeId={anchor.block.rootNodeId} onChoosePath={choose} />
 */
export function NodeRenderer({
	anchor,
	measurement = false,
	nodeId,
	onChoosePath,
}: {
	anchor: Anchor;
	measurement?: boolean;
	nodeId: string;
	onChoosePath: (path: TalePath) => void;
}): React.JSX.Element | null {
	const node = anchor.block.nodesById[nodeId];
	if (!node) return null;

	return (
		<div
			data-reader-component="NodeRenderer"
			data-reader-node-id={node.id}
			data-reader-role="layout-node"
			style={getNodeStyle(node, measurement)}
		>
			{node.children.map((child, index) => {
				if (child.type === "node") {
					return (
						<NodeRenderer
							key={child.nodeId}
							anchor={anchor}
							measurement={measurement}
							nodeId={child.nodeId}
							onChoosePath={onChoosePath}
						/>
					);
				}
				const fragment = anchor.block.fragmentsById[child.fragmentId];
				if (!fragment || fragment.placement.mode !== "normal") return null;
				return (
					<FragmentFrame
						key={fragment.id}
						fragment={fragment}
						index={index}
						anchor={anchor}
						parentNode={node}
						onChoosePath={onChoosePath}
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
 * @param props.onChoosePath - Callback used by choice button fragments.
 * @param props.parentNode - Node that owns the fragment.
 * @returns The styled fragment frame.
 *
 * @example
 * <FragmentFrame anchor={anchor} fragment={fragment} index={0} parentNode={node} onChoosePath={choose} />
 */
function FragmentFrame({
	anchor,
	fragment,
	index,
	onChoosePath,
	parentNode,
}: {
	anchor: Anchor;
	fragment: ResolvedTaleFragment;
	index: number;
	onChoosePath: (path: TalePath) => void;
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
			<ReaderFragment
				contentSized={anchor.block.size.mode === "content"}
				fragment={fragment}
				index={index}
				onChoosePath={onChoosePath}
			/>
		</div>
	);
}
