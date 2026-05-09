"use client";

import AnimationReadyProbe from "./AnimationReadyProbe";
import { useLoadingTaleReadiness } from "./useLoadingTaleReadiness";

export default function LoadingTale({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isMotionReady, isReady, markMotionReady } = useLoadingTaleReadiness();

	return (
		<>
			{!isReady && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
					<p className="animate-pulse font-semibold text-xl">Loading...</p>
				</div>
			)}

			{!isMotionReady && <AnimationReadyProbe onReady={markMotionReady} />}

			<div
				className={isReady ? "" : "pointer-events-none invisible"}
				aria-hidden={!isReady}
			>
				{children}
			</div>
		</>
	);
}
