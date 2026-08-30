"use client";

import { Pause, Play } from "lucide-react";
import cn from "~/lib/utils/cn";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";

/** Reader-owned pause and resume control for authored autoplay. */
export function ReaderAutoplayControl(): React.JSX.Element | null {
	const { available, reduceInactiveUiOpacity, status, toggle } =
		useTaleReaderStoreShallow((state) => ({
			available: state.playback.available,
			reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
			status: state.playback.status,
			toggle: state.playback.toggle,
		}));
	if (!available) return null;

	const playing = status === "playing";
	const Icon = playing ? Pause : Play;
	return (
		<div
			data-reader-ui="true"
			data-reader-component="ReaderAutoplayControl"
			data-reader-role="autoplay-control"
			className={cn(
				"pointer-events-auto absolute bottom-1 left-14 flex h-10 items-center overflow-hidden rounded-lg border border-foreground/12 bg-background/82 text-foreground shadow-2xl backdrop-blur-md transition-opacity duration-200",
				!reduceInactiveUiOpacity || playing
					? "opacity-100"
					: "opacity-30 hover:opacity-100",
			)}
		>
			<button
				type="button"
				aria-label={playing ? "Pause autoplay" : "Resume autoplay"}
				className="grid h-10 w-10 place-items-center"
				onClick={toggle}
			>
				<Icon size={17} />
			</button>
			{playing ? (
				<div className="flex items-center gap-1.5 pr-3 font-semibold text-[10px] uppercase">
					<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
					Autoplay
				</div>
			) : null}
		</div>
	);
}
