"use client";

import { useTaleAppStore } from "../../../../contexts/TaleAppStoreContext";
import { getBranchColor } from "../../../../services/branchColors";
import type { ResolvedTaleFragment, TalePath } from "../../../../types";

/**
 * Resolves authored visual overrides for a choice button fragment.
 *
 * @param fragment - Resolved choice fragment.
 * @returns Inline style values supported by the choice control.
 *
 * @example
 * const style = getChoiceButtonStyle(fragment);
 */
function getChoiceButtonStyle(
	fragment: ResolvedTaleFragment,
): React.CSSProperties {
	return {
		background: fragment.style?.backgroundCss,
		border: fragment.style?.border,
		borderRadius: fragment.style?.borderRadius,
		boxShadow: fragment.style?.boxShadow,
		color: fragment.style?.color,
	};
}

export function ChoiceButtonFragment({
	fragment,
	onChoosePath,
}: {
	fragment: ResolvedTaleFragment;
	onChoosePath: (path: TalePath) => void;
}): React.JSX.Element | null {
	const tale = useTaleAppStore((state) => state.document.tale);
	const path = fragment.pathId
		? tale.indexMap.pathsById[fragment.pathId]
		: null;
	if (!path) return null;

	const color = getBranchColor(tale, path.toBranchId);
	const isReturn = path.type === "return";
	const isTeleport = path.type === "teleport";
	return (
		<button
			data-reader-ui="true"
			data-reader-component="ChoiceButtonFragment"
			data-reader-role="choice-control"
			data-reader-fragment-id={fragment.id}
			type="button"
			className="pointer-events-auto w-full rounded-lg border px-4 py-3 text-left shadow-2xl backdrop-blur-md transition hover:scale-[1.02] hover:bg-foreground/12"
			style={{
				...getChoiceButtonStyle(fragment),
				backgroundColor:
					isReturn || isTeleport ? "rgba(255,255,255,0.08)" : `${color}2e`,
				borderColor:
					isReturn || isTeleport ? "rgba(255,255,255,0.14)" : `${color}96`,
				color: isReturn || isTeleport ? undefined : color,
			}}
			onClick={() => onChoosePath(path)}
		>
			<span className="block font-black text-sm">
				{fragment.label ?? path.label}
			</span>
			<span className="mt-1 block text-foreground/62 text-xs leading-5">
				{fragment.text ?? path.description}
			</span>
		</button>
	);
}
