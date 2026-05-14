"use client";

import { useCallback, useState } from "react";
import { useReaderStore } from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";

export function useLoadingTaleReadiness() {
	const isInitialLoadComplete = useReaderStore(
		(s) => s.reader.isInitialLoadComplete,
	);
	const [isMotionReady, setIsMotionReady] = useState(false);

	const isReady = isMotionReady && isInitialLoadComplete;

	const markMotionReady = useCallback(() => {
		setIsMotionReady(true);
	}, []);

	return {
		isInitialLoadComplete,
		isMotionReady,
		isReady,
		markMotionReady,
	};
}
