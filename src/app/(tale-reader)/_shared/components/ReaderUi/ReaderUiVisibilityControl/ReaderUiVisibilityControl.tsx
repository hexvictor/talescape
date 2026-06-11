"use client";

import clsx from "clsx";
import { Bug, Eye, EyeOff, Gauge, Navigation } from "lucide-react";
import { useState } from "react";
import type { ReaderUiVisibilityMode } from "../../../store/slices/uiSlice";

type ReaderUiVisibilityControlProps = {
	mode: ReaderUiVisibilityMode;
	onChange: (mode: ReaderUiVisibilityMode) => void;
	onToggle: () => void;
};

const VISIBILITY_OPTIONS: Array<{
	icon: typeof Eye;
	label: string;
	mode: ReaderUiVisibilityMode;
}> = [
	{ icon: Eye, label: "Everything", mode: "all" },
	{ icon: Navigation, label: "Navigation", mode: "navigation" },
	{ icon: Gauge, label: "Progress only", mode: "minimal" },
	{ icon: EyeOff, label: "Hide all", mode: "hidden" },
];

/**
 * Renders the reader overlay visibility button and its preset menu.
 *
 * @param props - Current visibility mode and mode change callback.
 * @returns The reader UI visibility control.
 *
 * @example
 * <ReaderUiVisibilityControl mode="all" onChange={setMode} />
 */
export function ReaderUiVisibilityControl({
	mode,
	onChange,
	onToggle,
}: ReaderUiVisibilityControlProps): React.JSX.Element {
	const [open, setOpen] = useState(false);
	const CurrentIcon =
		VISIBILITY_OPTIONS.find((option) => option.mode === mode)?.icon ?? Bug;

	return (
		<div
			data-reader-ui="true"
			data-reader-component="ReaderUiVisibilityControl"
			data-reader-role="visibility-control"
			className="pointer-events-auto absolute bottom-1 left-2"
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
		>
			{open ? (
				<div className="absolute bottom-full left-0 pb-2">
					<div className="flex w-40 flex-col gap-1 rounded-md border border-white/12 bg-black/88 p-1.5 shadow-2xl backdrop-blur-md">
						{VISIBILITY_OPTIONS.map((option) => {
							const Icon = option.icon;
							return (
								<button
									key={option.mode}
									data-reader-component="ReaderUiVisibilityControl"
									data-reader-role="visibility-option"
									type="button"
									className={clsx(
										"flex items-center gap-2 rounded px-2 py-2 text-left text-xs transition",
										option.mode === mode
											? "bg-white/14 text-white"
											: "text-white/58 hover:bg-white/8 hover:text-white",
									)}
									onClick={() => onChange(option.mode)}
								>
									<Icon size={14} />
									{option.label}
								</button>
							);
						})}
					</div>
				</div>
			) : null}
			<button
				type="button"
				aria-label="Change reader UI visibility"
				aria-expanded={open}
				className={clsx(
					"grid h-10 w-10 place-items-center rounded-lg border border-white/12 bg-black/72 text-white opacity-25 shadow-2xl backdrop-blur-md transition-opacity duration-200 hover:opacity-100",
					mode === "hidden" && "opacity-15",
				)}
				onClick={onToggle}
			>
				<CurrentIcon size={17} />
			</button>
		</div>
	);
}
