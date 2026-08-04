"use client";

import { EditorNodeOverlay } from "~/app/(tale-app)/(tale-editor)/_shared/components/TaleEditor/EditorNodeOverlay";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import type { Anchor, ResolvedTaleFragment, TaleNode } from "../../../types";
import { TaleFragment } from "../TaleFragment/TaleFragment";
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
}: {
	anchor: Anchor;
	measurement?: boolean;
	nodeId: string;
}): React.JSX.Element | null {
	const isEditor = useTaleAppStore((state) => state.derived.isEditor);
	const node = anchor.block.nodesById[nodeId];
	if (!node) return null;

	return (
		<div
			data-reader-component="NodeRenderer"
			data-reader-node-id={node.id}
			data-reader-role="layout-node"
			className="group/node relative"
			style={getNodeStyle(node, measurement)}
		>
			{isEditor ? (
				<EditorNodeOverlay blockId={anchor.block.id} nodeId={node.id} />
			) : null}
			{node.children.map((child, index) => {
				if (child.type === "node") {
					return (
						<NodeRenderer
							key={child.nodeId}
							anchor={anchor}
							measurement={measurement}
							nodeId={child.nodeId}
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
	fragment,
	index,
	parentNode,
}: {
	anchor: Anchor;
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
				contentSized={anchor.block.size.mode === "content"}
				fragment={fragment}
				index={index}
			/>
		</div>
	);
}
