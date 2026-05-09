"use client";

import { useCallback, useEffect, useState } from "react";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";

export function useLoadingTaleReadiness() {
	const isLayoutReady = useReaderStore((s) => s.reader.isLayoutReady);
	const isInitialLoadComplete = useReaderStore(
		(s) => s.reader.isInitialLoadComplete,
	);
	const [isMotionReady, setIsMotionReady] = useState(false);

	const isReady = isMotionReady && isInitialLoadComplete;

	const markMotionReady = useCallback(() => {
		console.log("[LoadingTale] motion ready");
		setIsMotionReady(true);
	}, []);

	useEffect(() => {
		console.log("[LoadingTale] state", {
			isMotionReady,
			isLayoutReady,
			isInitialLoadComplete,
			isReady,
		});
	}, [isMotionReady, isLayoutReady, isInitialLoadComplete, isReady]);

	return {
		isLayoutReady,
		isInitialLoadComplete,
		isMotionReady,
		isReady,
		markMotionReady,
	};
}
