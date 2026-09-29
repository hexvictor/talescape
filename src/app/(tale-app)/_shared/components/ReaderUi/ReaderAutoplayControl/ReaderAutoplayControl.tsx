"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "~/components/ui/button";
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
				"pointer-events-auto absolute bottom-1 left-14 flex h-10 items-center overflow-hidden border border-foreground/30 bg-background/88 text-foreground shadow-[3px_3px_0_rgb(var(--foreground-rgb))] backdrop-blur-md transition-opacity duration-200",
				!reduceInactiveUiOpacity || playing
					? "opacity-100"
					: "opacity-30 hover:opacity-100",
			)}
		>
			<Button
				aria-label={playing ? "Pause autoplay" : "Resume autoplay"}
				className="h-10 w-10 border-0 p-0"
				motion="flat"
				size="icon"
				variant="ghost"
				onPress={toggle}
			>
				<Icon size={17} />
			</Button>
			{playing ? (
				<div className="flex items-center gap-1.5 pr-3 font-semibold text-[10px] uppercase">
					<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
					Autoplay
				</div>
			) : null}
		</div>
	);
}
