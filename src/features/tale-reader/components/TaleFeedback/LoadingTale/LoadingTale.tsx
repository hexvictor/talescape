"use client";

import { useEffect, useState } from "react";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import AnimationReadyProbe from "./AnimationReadyProbe";

export default function LoadingTale({
	children,
}: {
	children: React.ReactNode;
}) {
	const isLayoutReady = useReaderStore((s) => s.isLayoutReady);
	const isInitialLoadComplete = useReaderStore((s) => s.isInitialLoadComplete);
	const [isMotionReady, setIsMotionReady] = useState(false);

	const isReady = isMotionReady && isInitialLoadComplete;

	useEffect(() => {
		console.log("[LoadingTale] state", {
			isMotionReady,
			isLayoutReady,
			isInitialLoadComplete,
			isReady,
		});
	}, [isMotionReady, isLayoutReady, isInitialLoadComplete, isReady]);

	return (
		<>
			{!isReady && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
					<p className="animate-pulse font-semibold text-xl">Loading...</p>
				</div>
			)}

			{!isMotionReady && (
				<AnimationReadyProbe
					onReady={() => {
						console.log("[LoadingTale] motion ready");
						setIsMotionReady(true);
					}}
				/>
			)}

			<div
				className={isReady ? "" : "pointer-events-none invisible"}
				aria-hidden={!isReady}
			>
				{children}
			</div>
		</>
	);
}
