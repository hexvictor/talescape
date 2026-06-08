"use client";

import { useReaderStore } from "../../../contexts/ReaderStoreContext";

export function ReaderProgress() {
	const compiled = useReaderStore((state) => state.reader.compiled);
	if (!compiled) return null;

	return (
		<div className="pointer-events-none absolute inset-x-0 bottom-0 z-30">
			<div className="absolute right-4 bottom-4 rounded border border-white/10 bg-black/64 px-2.5 py-1.5 font-medium text-[10px] text-white/54 uppercase backdrop-blur-md">
				<span data-reader-story-progress="true">Story 0%</span>
				<span className="mx-2 text-white/20">/</span>
				<span data-reader-inner-progress="true">Page 0 / 0</span>
			</div>
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
	);
}
