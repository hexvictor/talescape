import type {
	FragmentAnimationConfig,
	ReaderStyle,
	TaleNode,
} from "~/app/(tale-reader)/_shared/types";
import type {
	NodeAnimationConfig,
	NodeConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { formatAnimationSelection } from "./formatAnimationSelection";

/**
 * Formats database node rows into the reader node model.
 *
 * @param rows - Node rows returned from the relational query.
 * @returns Frontend reader nodes with child node ids remapped to database ids.
 *
 * @example
 * const nodes = formatNodes(record.nodes);
 */
export function formatNodes(rows: unknown[]): TaleNode[] {
	const rawNodes = rows.map((row) => {
		const item = row as {
			animationConfig?: NodeAnimationConfig;
			config?: NodeConfig;
			id: number;
			parentNodeId?: number | null;
			stableId?: string | null;
			styleConfig?: ReaderStyle | null;
		};
		const config = item.config ?? {
			children: [],
			id: item.stableId ?? String(item.id),
			mode: "stack",
			parentNodeId:
				item.parentNodeId == null ? null : String(item.parentNodeId),
		};
		return {
			...config,
			animations: formatNodeAnimations(item.animationConfig),
			id: String(item.id),
			stableId: item.stableId ?? String(item.id),
			parentNodeId:
				item.parentNodeId == null ? null : String(item.parentNodeId),
			style: {
				...config.style,
				...(item.styleConfig ?? {}),
			},
		};
	});
	const nodeIdsByStableId = new Map(
		rawNodes.map((node) => [node.stableId, node.id]),
	);
	return rawNodes.map((node) => {
		const { stableId: _stableId, ...formatted } = node;
		return {
			...formatted,
			children: formatted.children.map((child) =>
				child.type === "node"
					? {
							...child,
							nodeId: nodeIdsByStableId.get(child.nodeId) ?? child.nodeId,
						}
					: child,
			),
		};
	}) as TaleNode[];
}

/**
 * Formats persisted node animation selections into the reader animation model.
 *
 * @param config - Persisted node animation configuration.
 * @returns Node animation selections with normalized defaults.
 */
function formatNodeAnimations(
	config?: NodeAnimationConfig,
): FragmentAnimationConfig {
	return {
		ambient: {
			...formatAnimationSelection(config?.ambient),
			cycleDurationMs: config?.ambient?.cycleDurationMs ?? 2400,
			playback: config?.ambient?.playback ?? "alternate",
		},
		entering: formatAnimationSelection(config?.entering),
		leaving: formatAnimationSelection(config?.leaving),
		scrolling: formatAnimationSelection(config?.scrolling),
	};
}
