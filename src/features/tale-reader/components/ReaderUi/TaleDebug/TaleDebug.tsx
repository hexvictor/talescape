"use client";

import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";

export default function TaleDebug() {
	const debugMode = useReaderStore((s) => s.ui.isDebugEnabled);
	if (!debugMode) return null;
	const currentBlockId = useReaderStore((s) => s.navigation.current?.block?.id);

	return (
		<div className="fixed top-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg">
			<p className="text-xs">{currentBlockId ? currentBlockId : "x"}</p>
		</div>
	);
}
