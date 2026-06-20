"use client";

import { useEffect, useRef, useState } from "react";

const MINIMUM_STEP = 0.025;
const SETTLE_DISTANCE = 0.08;

/**
 * Smoothly approaches engine loading milestones without indefinite stalls.
 *
 * @param target - Latest real loading percentage reported by the engine.
 * @returns Display percentage that eases toward the target.
 *
 * @example
 * const displayedProgress = useSmoothedLoadingProgress(engineProgress);
 */
export function useSmoothedLoadingProgress(target: number): number {
	const safeTarget = Math.max(0, Math.min(100, target));
	const displayedRef = useRef(0);
	const frameRef = useRef<number | null>(null);
	const [displayed, setDisplayed] = useState(0);

	useEffect(() => {
		const tick = () => {
			const distance = safeTarget - displayedRef.current;
			if (Math.abs(distance) <= SETTLE_DISTANCE) {
				displayedRef.current = safeTarget;
				setDisplayed(safeTarget);
				frameRef.current = null;
				return;
			}

			const easedStep = Math.max(Math.abs(distance) * 0.055, MINIMUM_STEP);
			displayedRef.current +=
				Math.sign(distance) * Math.min(Math.abs(distance), easedStep);
			setDisplayed(displayedRef.current);
			frameRef.current = window.requestAnimationFrame(tick);
		};

		if (frameRef.current === null) {
			frameRef.current = window.requestAnimationFrame(tick);
		}

		return () => {
			if (frameRef.current !== null) {
				window.cancelAnimationFrame(frameRef.current);
				frameRef.current = null;
			}
		};
	}, [safeTarget]);

	return displayed;
}
