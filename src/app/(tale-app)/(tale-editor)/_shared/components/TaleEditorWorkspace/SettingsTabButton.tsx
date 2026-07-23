"use client";

import clsx from "clsx";

/**
 * Renders one editor settings tab button.
 *
 * @param props - Tab button props.
 * @param props.active - Whether this tab is selected.
 * @param props.label - Visible tab label.
 * @param props.onClick - Selects this tab.
 * @returns Settings tab button.
 *
 * @example
 * <SettingsTabButton active label="Tale" onClick={selectTale} />
 */
export function SettingsTabButton({
	active,
	label,
	onClick,
}: {
	active: boolean;
	label: string;
	onClick: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			className={clsx(
				"rounded px-3 py-1.5 font-semibold text-xs",
				active
					? "bg-primary text-primary-foreground"
					: "text-foreground/54 hover:bg-foreground/8 hover:text-foreground",
			)}
			onClick={onClick}
		>
			{label}
		</button>
	);
}
