"use client";

/**
 * Attaches the window resize listener that asks the engine to rebuild layout.
 *
 * @param requestRebuild - Callback that schedules the structural rebuild.
 *
 * This lives outside the engine factory so resize event wiring stays separate
 * from the measurement sequence that actually rebuilds ScrollTrigger state.
 */
export function attachWindowResizeRebuild(requestRebuild: () => void) {
	window.addEventListener("resize", requestRebuild);

	return () => {
		window.removeEventListener("resize", requestRebuild);
	};
}
