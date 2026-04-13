"use client";

import { useEffect } from "react";
import { useReaderStore } from "../contexts/ReaderStoreContext";

export function useRestoreLastReadPosition() {
	const lastBlockId = useReaderStore((s) => s.progress.lastBlockId);
	const isLayoutReady = useReaderStore((s) => s.isLayoutReady);
	const hasRestoredInitialPosition = useReaderStore(
		(s) => s.hasRestoredInitialPosition,
	);
	const setHasRestoredInitialPosition = useReaderStore(
		(s) => s.setHasRestoredInitialPosition,
	);
	const goToBlock = useReaderStore((s) => s.goToBlock);

	useEffect(() => {
		if (!isLayoutReady) return;
		if (hasRestoredInitialPosition) return;
		if (lastBlockId == null) return;

		setHasRestoredInitialPosition(true);
		goToBlock(lastBlockId, {
			scroll: true,
			duration: 0,
		});
	}, [
		isLayoutReady,
		hasRestoredInitialPosition,
		lastBlockId,
		goToBlock,
		setHasRestoredInitialPosition,
	]);
}
