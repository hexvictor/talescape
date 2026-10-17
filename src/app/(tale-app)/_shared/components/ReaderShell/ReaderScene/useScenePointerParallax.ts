import { useEffect } from "react";

export function useScenePointerParallax(
	root: HTMLElement | null,
	enabled: boolean,
) {
	useEffect(() => {
		if (!root || !enabled) return;
		const viewport = root.closest<HTMLElement>(
			'[data-reader-role="camera-viewport"]',
		);
		if (!viewport) return;
		let frame = 0;
		let x = 0;
		let y = 0;
		const paint = () => {
			frame = 0;
			root.style.setProperty("--reader-pointer-x", String(x));
			root.style.setProperty("--reader-pointer-y", String(y));
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(paint);
		};
		const move = (event: PointerEvent) => {
			if (
				event.pointerType === "touch" ||
				window.matchMedia("(prefers-reduced-motion: reduce)").matches
			)
				return;
			const bounds = viewport.getBoundingClientRect();
			x = Math.max(
				-1,
				Math.min(
					1,
					((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1,
				),
			);
			y = Math.max(
				-1,
				Math.min(
					1,
					((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1,
				),
			);
			schedule();
		};
		const reset = () => {
			x = 0;
			y = 0;
			schedule();
		};
		viewport.addEventListener("pointermove", move, { passive: true });
		viewport.addEventListener("pointerleave", reset);
		return () => {
			cancelAnimationFrame(frame);
			viewport.removeEventListener("pointermove", move);
			viewport.removeEventListener("pointerleave", reset);
			root.style.removeProperty("--reader-pointer-x");
			root.style.removeProperty("--reader-pointer-y");
		};
	}, [root, enabled]);
}
