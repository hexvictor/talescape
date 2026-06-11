"use client";

import clsx from "clsx";
import { Settings2 } from "lucide-react";
import { useInspectorButtonState } from "../../../hooks/store/useReaderEditorSelectors";
import type { ReaderInspectorTarget } from "../../../types";

export function InspectorButton({
	label,
	position = "fragment",
	revealOnHover = false,
	target,
}: {
	label: string;
	position?: "block" | "fragment";
	revealOnHover?: boolean;
	target: ReaderInspectorTarget;
}): React.JSX.Element | null {
	const { inspectorControlsOpen, mode, openInspector } =
		useInspectorButtonState();
	if (mode !== "edit" || !inspectorControlsOpen) return null;

	return (
		<button
			data-reader-ui="true"
			data-reader-component="InspectorButton"
			data-reader-role="inspector-control"
			type="button"
			aria-label={label}
			title={label}
			className={clsx(
				"pointer-events-auto absolute top-3 z-30 grid h-8 w-8 place-items-center rounded-full border border-white/16 bg-black/56 text-white/78 shadow-lg backdrop-blur-sm transition-opacity hover:opacity-100 focus:opacity-100",
				position === "block" ? "-translate-x-1/2 left-1/2" : "right-3",
				revealOnHover
					? "opacity-0 group-hover/fragment:opacity-50"
					: "opacity-50",
			)}
			onClick={() => openInspector(target)}
		>
			<Settings2 size={15} />
		</button>
	);
}
