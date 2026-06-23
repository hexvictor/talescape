"use client";

import clsx from "clsx";
import { Bug, Eye, EyeOff, Gauge, Navigation } from "lucide-react";
import { useState } from "react";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";
import type { ReaderUiVisibilityMode } from "../../../store/slices/uiSlice";

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
 * <ReaderUiVisibilityControl />
 */
export function ReaderUiVisibilityControl(): React.JSX.Element {
	const { mode, setMode, toggle } = useTaleReaderStoreShallow((state) => ({
		mode: state.ui.visibilityMode,
		setMode: state.ui.setVisibilityMode,
		toggle: state.ui.toggleReaderUi,
	}));
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
					<div className="flex w-40 flex-col gap-1 rounded-md border border-foreground/12 bg-background/88 p-1.5 shadow-2xl backdrop-blur-md">
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
											? "bg-foreground/14 text-foreground"
											: "text-foreground/58 hover:bg-foreground/8 hover:text-foreground",
									)}
									onClick={() => setMode(option.mode)}
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
					"grid h-10 w-10 place-items-center rounded-lg border border-foreground/12 bg-background/72 text-foreground opacity-25 shadow-2xl backdrop-blur-md transition-opacity duration-200 hover:opacity-100",
					mode === "hidden" && "opacity-15",
				)}
				onClick={toggle}
			>
				<CurrentIcon size={17} />
			</button>
		</div>
	);
}
