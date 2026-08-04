"use client";

import clsx from "clsx";
import { Settings2 } from "lucide-react";

/**
 * Renders a presentational editor inspection control over reader content.
 *
 * @param props - Inspection button props.
 * @param props.label - Accessible action label.
 * @param props.onClick - Editor-owned selection action.
 * @param props.position - Block or fragment placement.
 * @param props.revealOnHover - Whether fragment hover reveals the control.
 * @returns Inspection control.
 */
export function InspectorButton({
	label,
	onClick,
	position = "fragment",
	revealOnHover = false,
}: {
	label: string;
	onClick: () => void;
	position?: "block" | "fragment";
	revealOnHover?: boolean;
}): React.JSX.Element {
	return (
		<button
			data-reader-ui="true"
			data-reader-component="InspectorButton"
			data-reader-role="inspector-control"
			type="button"
			aria-label={label}
			title={label}
			className={clsx(
				"pointer-events-auto absolute top-3 z-30 grid h-8 w-8 place-items-center rounded-full border border-foreground/16 bg-background/56 text-foreground/78 shadow-lg backdrop-blur-sm transition-opacity hover:opacity-100 focus:opacity-100",
				position === "block" ? "-translate-x-1/2 left-1/2" : "right-3",
				revealOnHover
					? "opacity-0 group-hover/fragment:opacity-50"
					: "opacity-50",
			)}
			onClick={onClick}
		>
			<Settings2 size={15} />
		</button>
	);
}
