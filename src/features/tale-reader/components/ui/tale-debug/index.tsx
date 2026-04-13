"use client";

import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";

export default function TaleDebug() {
	const debugMode = useReaderStore((s) => s.debugMode);
	if (!debugMode) return null;
	const activeBlockId = useReaderStore((s) => s.activeBlockId);

	return (
		<div className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
			<p className="text-xs">{activeBlockId}</p>
		</div>
	);
}
