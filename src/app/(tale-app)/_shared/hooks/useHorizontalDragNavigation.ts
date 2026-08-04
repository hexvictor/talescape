"use client";

import { useRef } from "react";

type HorizontalDragNavigationOptions = {
	onStep: (direction: -1 | 1) => void;
	stepDistance?: number;
};

/**
 * Converts horizontal pointer dragging into discrete navigation steps.
 *
 * @param options - Drag step callback and optional pixel threshold.
 * @returns Pointer handlers for a horizontally browsable control.
 *
 * @example
 * const drag = useHorizontalDragNavigation({ onStep: setPage });
 */
export function useHorizontalDragNavigation({
	onStep,
	stepDistance = 34,
}: HorizontalDragNavigationOptions): {
	onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
	onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
	onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
	onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
} {
	const activePointerIdRef = useRef<number | null>(null);
	const draggingRef = useRef(false);
	const lastStepXRef = useRef<number | null>(null);
	const startXRef = useRef<number | null>(null);
	const startYRef = useRef<number | null>(null);

	/**
	 * Clears the active drag state and releases pointer capture when needed.
	 *
	 * @param event - Pointer event finishing the interaction.
	 * @returns Nothing.
	 *
	 * @example
	 * resetDrag(event);
	 */
	const resetDrag = (event: React.PointerEvent<HTMLElement>): void => {
		activePointerIdRef.current = null;
		draggingRef.current = false;
		lastStepXRef.current = null;
		startXRef.current = null;
		startYRef.current = null;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	};

	return {
		onPointerDown: (event) => {
			activePointerIdRef.current = event.pointerId;
			draggingRef.current = false;
			lastStepXRef.current = event.clientX;
			startXRef.current = event.clientX;
			startYRef.current = event.clientY;
		},
		onPointerMove: (event) => {
			if (activePointerIdRef.current !== event.pointerId) return;
			const lastX = lastStepXRef.current;
			const startX = startXRef.current;
			const startY = startYRef.current;
			if (lastX === null || startX === null || startY === null) return;
			const horizontalTravel = Math.abs(event.clientX - startX);
			const verticalTravel = Math.abs(event.clientY - startY);
			if (!draggingRef.current) {
				if (
					horizontalTravel < stepDistance ||
					horizontalTravel <= verticalTravel
				) {
					return;
				}
				draggingRef.current = true;
				event.currentTarget.setPointerCapture(event.pointerId);
			}
			const delta = event.clientX - lastX;
			if (Math.abs(delta) < stepDistance) return;
			onStep(delta < 0 ? 1 : -1);
			lastStepXRef.current = event.clientX;
		},
		onPointerUp: resetDrag,
		onPointerCancel: resetDrag,
	};
}
