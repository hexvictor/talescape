"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useMemo } from "react";
import cn from "~/lib/utils/cn";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";

/** Renders the tale-wide mute control when at least one Audio Element exists. */
export function ReaderAudioControl(): React.JSX.Element | null {
	const elementsById = useTaleAppStore(
		(state) => state.document.tale.indexMap.elementsById,
	);
	const hasAudio = useMemo(
		() =>
			Object.values(elementsById).some(
				(element) => element.type === "audio" && Boolean(element.src),
			),
		[elementsById],
	);
	const { muted, reduceInactiveUiOpacity, setMuted } =
		useTaleReaderStoreShallow((state) => ({
			muted: state.ui.audioMuted,
			reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
			setMuted: state.ui.setAudioMuted,
		}));

	if (!hasAudio) return null;
	const Icon = muted ? VolumeX : Volume2;
	return (
		<button
			type="button"
			data-reader-ui="true"
			data-reader-component="ReaderAudioControl"
			data-reader-role="audio-control"
			aria-label={muted ? "Unmute tale audio" : "Mute tale audio"}
			aria-pressed={muted}
			className={cn(
				"pointer-events-auto absolute bottom-12 left-2 grid h-10 w-10 place-items-center rounded-lg border border-foreground/12 bg-background/72 text-foreground shadow-2xl backdrop-blur-md transition-opacity duration-200",
				!reduceInactiveUiOpacity || muted
					? "opacity-100"
					: "opacity-30 hover:opacity-100",
			)}
			onClick={() => setMuted(!muted)}
		>
			<Icon size={17} />
		</button>
	);
}
