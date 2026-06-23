"use client";

import { motion } from "motion/react";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";

/**
 * Confirms that Motion has committed an animation before exposing the reader.
 *
 * @returns A zero-size probe only during the Motion readiness phase.
 *
 * @example
 * <ReaderMotionReadiness />
 */
export function ReaderMotionReadiness(): React.JSX.Element | null {
	const { phase, setProgress } = useTaleReaderStoreShallow((state) => ({
		phase: state.engine.phase,
		setProgress: state.engine.setProgress,
	}));

	if (phase !== "preparing-motion") return null;

	return (
		<motion.div
			aria-hidden="true"
			data-reader-component="ReaderMotionReadiness"
			data-reader-role="motion-readiness-probe"
			className="pointer-events-none absolute h-0 w-0"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.04 }}
			onAnimationComplete={() => setProgress(100)}
		/>
	);
}
