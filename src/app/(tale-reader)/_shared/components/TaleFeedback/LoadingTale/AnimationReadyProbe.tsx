"use client";

import { motion } from "motion/react";

export default function AnimationReadyProbe({
	onReady,
}: { onReady: () => void }) {
	return (
		<motion.div
			style={{
				position: "absolute",
				width: 0,
				height: 0,
				pointerEvents: "none",
			}}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.01 }}
			onAnimationComplete={onReady}
		/>
	);
}
