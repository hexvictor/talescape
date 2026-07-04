"use client";

import clsx from "clsx";
import { Magnet, MagnetIcon } from "lucide-react";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";
import type { ReaderSnapModeOverride } from "../../../store/slices/inputSettingsSlice";

const overrideOptions: Array<{
	icon: "magnet" | "muted";
	label: string;
	value: ReaderSnapModeOverride;
}> = [
	{ icon: "muted", label: "Default", value: "default" },
	{ icon: "magnet", label: "Snap on", value: "snap" },
	{ icon: "magnet", label: "Scroll snap", value: "scroll-snap" },
	{ icon: "muted", label: "Snap off", value: "snap-off" },
];

/**
 * Applies a runtime snap-mode override while the debug panel is open.
 *
 * @returns Global block snap controls.
 *
 * @example
 * <GlobalSnapControls />
 */
export function GlobalSnapControls(): React.JSX.Element {
	const { mode, setMode } = useTaleReaderStoreShallow((state) => ({
		mode: state.inputSettings.snapModeOverride,
		setMode: state.inputSettings.setSnapModeOverride,
	}));

	return (
		<div
			data-reader-component="GlobalSnapControls"
			data-reader-role="snap-settings"
			className="flex flex-wrap items-center gap-1 border-foreground/10 border-b px-3 py-2"
		>
			<span className="mr-auto text-[10px] text-foreground/42 uppercase">
				Snap debug
			</span>
			{overrideOptions.map((option) => (
				<button
					key={option.value}
					type="button"
					className={clsx(
						"flex h-8 items-center gap-1.5 rounded border px-2 text-[10px] hover:bg-foreground/8",
						mode === option.value
							? "border-primary/55 text-primary"
							: "border-foreground/10 text-foreground/58 hover:text-foreground",
					)}
					onClick={() => setMode(option.value)}
				>
					{option.icon === "magnet" ? (
						<Magnet size={12} />
					) : (
						<MagnetIcon size={12} className="opacity-45" />
					)}
					{option.label}
				</button>
			))}
		</div>
	);
}
