"use client";

import { Settings2 } from "lucide-react";
import cn from "~/lib/utils/cn";

/**
 * Renders a presentational Studio inspection control over reader content.
 *
 * @param props - Inspection button props.
 * @param props.label - Accessible action label.
 * @param props.onClick - Studio-owned selection action.
 * @param props.position - Scene or fragment placement.
 * @param props.revealOnHover - Whether fragment hover reveals the control.
 * @returns Inspection control.
 */
export function InspectorButton({
	icon,
	label,
	onClick,
	position = "element",
	revealOnHover = false,
}: {
	icon?: React.ReactNode;
	label: string;
	onClick: () => void;
	position?: "scene" | "element";
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
			className={cn(
				"pointer-events-auto absolute top-3 z-30 grid h-8 w-8 place-items-center border-2 border-foreground bg-background text-foreground/78 shadow-[2px_2px_0_hsl(var(--secondary))] transition hover:bg-primary hover:text-primary-foreground hover:opacity-100 focus:opacity-100",
				position === "scene" ? "-translate-x-1/2 left-1/2" : "right-3",
				revealOnHover
					? "opacity-0 group-hover/element:opacity-50"
					: "opacity-50",
			)}
			onClick={onClick}
		>
			{icon ?? <Settings2 size={15} />}
		</button>
	);
}
