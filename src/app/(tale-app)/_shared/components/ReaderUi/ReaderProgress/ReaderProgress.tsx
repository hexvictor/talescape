"use client";

import clsx from "clsx";
import { useTaleStore } from "../../../contexts/TaleStoreContext";

type ReaderProgressProps = {
	statusVisible: boolean;
	visible: boolean;
};

/**
 * Renders persistent story and page progress indicators.
 *
 * @param props - Whether the persistent indicators should be visible.
 * @returns Reader progress bars and textual status.
 *
 * @example
 * <ReaderProgress visible />
 */
export function ReaderProgress({
	statusVisible,
	visible,
}: ReaderProgressProps): React.JSX.Element | null {
	const compiled = useTaleStore((state) => state.reader.compiled);
	if (!compiled) return null;

	return (
		<div
			className={clsx(
				"pointer-events-none absolute inset-0 z-30 transition-opacity duration-300",
				visible ? "opacity-100" : "opacity-0",
			)}
		>
			<div
				data-reader-component="ReaderProgress"
				data-reader-role="compact-progress-status"
				className={clsx(
					"pointer-events-auto absolute right-2 bottom-1 rounded border border-white/10 bg-black/64 px-2.5 py-1.5 font-medium text-[10px] text-white/54 uppercase opacity-25 backdrop-blur-md transition-opacity duration-200 hover:opacity-100",
					!statusVisible && "hidden",
				)}
			>
				<span data-reader-story-progress="true">Story 0%</span>
				<span className="mx-2 text-white/20">/</span>
				<span data-reader-inner-progress="true">Page 0 / 0</span>
			</div>
			<div className="absolute inset-x-0 top-0">
				<div className="h-1 bg-white/8">
					<div
						data-reader-story-progress-fill="true"
						className="h-full origin-left bg-[#d9b56f] will-change-transform"
						style={{ transform: "scaleX(0)" }}
					/>
				</div>
				<div className="h-1 bg-white/8">
					<div
						data-reader-inner-progress-fill="true"
						className="h-full origin-left bg-[#9fbf8f] will-change-transform"
						style={{ transform: "scaleX(0)" }}
					/>
				</div>
			</div>
		</div>
	);
}
