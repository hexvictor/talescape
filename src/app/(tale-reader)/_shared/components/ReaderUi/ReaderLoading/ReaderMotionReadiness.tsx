"use client";

import { motion } from "motion/react";
import { useReaderMotionReadinessState } from "../../../hooks/store/useReaderRuntimeSelectors";

/**
 * Confirms that Motion has committed an animation before exposing the reader.
 *
 * @returns A zero-size probe only during the Motion readiness phase.
 *
 * @example
 * <ReaderMotionReadiness />
 */
export function ReaderMotionReadiness() {
	const { phase, setProgress } = useReaderMotionReadinessState();

	if (phase !== "preparing-motion") return null;

	return (
		<motion.div
			aria-hidden="true"
			className="pointer-events-none absolute h-0 w-0"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.04 }}
			onAnimationComplete={() => setProgress(100)}
		/>
	);
}
