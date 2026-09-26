"use client";

import cn from "~/lib/utils/cn";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";

/**
 * Renders persistent story, transition, and page progress indicators.
 *
 * @param props - Whether the persistent indicators should be visible.
 * @returns Reader progress bars and textual status.
 *
 * @example
 * <ReaderProgress />
 */
export function ReaderProgress(): React.JSX.Element | null {
	const { compiled, reduceInactiveUiOpacity, statusVisible, visible } =
		useTaleReaderStoreShallow((state) => ({
			compiled: state.reader.compiled,
			reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
			statusVisible: state.ui.readerStatusVisible,
			visible: state.ui.visibilityMode !== "hidden",
		}));
	if (!compiled) return null;
	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-0 z-30 transition-opacity duration-300",
				visible ? "opacity-100" : "opacity-0",
			)}
		>
			<div
				data-reader-component="ReaderProgress"
				data-reader-role="compact-progress-status"
				className={cn(
					"pointer-events-auto absolute right-2 bottom-1 whitespace-pre-line rounded border border-foreground/10 bg-background/64 px-2.5 py-1.5 font-medium text-[10px] text-foreground/54 uppercase leading-4 backdrop-blur-md transition-opacity duration-200",
					reduceInactiveUiOpacity
						? "opacity-25 hover:opacity-100"
						: "opacity-100",
					!statusVisible && "hidden",
				)}
			>
				<span data-reader-story-progress="true">Story 0%</span>
				<span className="mx-2 text-foreground/20">/</span>
				<span data-reader-inner-progress="true">Preparing progression</span>
			</div>
			<div className="absolute inset-x-0 top-[var(--reader-mobile-toolbar-offset,0px)] transition-[top] duration-300 md:top-0">
				<div className="h-1 bg-foreground/8">
					<div
						data-reader-story-progress-fill="true"
						className="h-full origin-left bg-primary will-change-transform"
						style={{ transform: "scaleX(0)" }}
					/>
				</div>
				<div className="h-1 bg-foreground/8">
					<div
						data-reader-transition-progress-fill="true"
						className="h-full origin-left bg-amber-400 will-change-transform"
						style={{ transform: "scaleX(0)" }}
					/>
				</div>
				<div className="h-1 bg-foreground/8">
					<div
						data-reader-inner-progress-fill="true"
						data-reader-progress-phase="reading"
						className="h-full origin-left bg-emerald-400 will-change-transform data-[reader-progress-phase=enter-pause]:bg-sky-400 data-[reader-progress-phase=leave-pause]:bg-fuchsia-500"
						style={{ transform: "scaleX(0)" }}
					/>
				</div>
			</div>
		</div>
	);
}
