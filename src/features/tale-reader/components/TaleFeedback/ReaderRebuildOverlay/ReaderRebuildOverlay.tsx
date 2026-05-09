"use client";

import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";

export default function ReaderRebuildOverlay() {
	const isViewportRebuilding = useReaderStore(
		(s) => s.reader.isViewportRebuilding,
	);

	if (!isViewportRebuilding) return null;

	return (
		<div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
			<div className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white shadow-xl">
				<p className="animate-pulse font-medium text-sm sm:text-base">
					Adjusting layout...
				</p>
			</div>
		</div>
	);
}
