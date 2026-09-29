"use client";

import { useReaderViewportContext } from "~/app/(tale-app)/_shared/contexts/ReaderViewportContext";
import { useTaleAppStore } from "../../../../contexts/TaleAppStoreContext";
import { getBranchColor } from "../../../../services/branchColors";
import type { ResolvedTaleElement } from "../../../../types";

/**
 * Resolves authored visual overrides for a choice button element.
 *
 * @param element - Resolved choice element.
 * @returns Inline style values supported by the choice control.
 *
 * @example
 * const style = getChoiceButtonStyle(element);
 */
function getChoiceButtonStyle(
	element: ResolvedTaleElement,
): React.CSSProperties {
	return {
		background: element.style?.backgroundCss,
		border: element.style?.border,
		borderRadius: element.style?.borderRadius,
		boxShadow: element.style?.boxShadow,
		color: element.style?.color,
	};
}

export function ChoiceButtonElement({
	element,
}: {
	element: ResolvedTaleElement;
}): React.JSX.Element | null {
	const tale = useTaleAppStore((state) => state.document.tale);
	const { onChoosePath } = useReaderViewportContext();

	const path = element.pathId ? tale.indexMap.pathsById[element.pathId] : null;
	if (!path) return null;

	const color = getBranchColor(tale, path.toBranchId);
	const isReturn = path.type === "return";
	const isTeleport = path.type === "teleport";
	return (
		<button
			data-reader-ui="true"
			data-reader-component="ChoiceButtonElement"
			data-reader-role="choice-control"
			data-reader-element-id={element.id}
			type="button"
			className="pointer-events-auto w-full rounded-lg border px-4 py-3 text-left shadow-2xl backdrop-blur-md transition hover:scale-[1.02] hover:bg-foreground/12"
			style={{
				...getChoiceButtonStyle(element),
				backgroundColor:
					isReturn || isTeleport ? "rgba(255,255,255,0.08)" : `${color}2e`,
				borderColor:
					isReturn || isTeleport ? "rgba(255,255,255,0.14)" : `${color}96`,
				color: element.style?.color ?? "var(--foreground)",
			}}
			onClick={() => onChoosePath(path)}
		>
			<span className="block font-black text-sm">
				{element.label ?? path.label}
			</span>
			<span className="mt-1 block text-foreground/62 text-xs leading-5">
				{element.text ?? path.description}
			</span>
		</button>
	);
}
