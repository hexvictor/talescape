"use client";

import type { ComponentProps, KeyboardEvent, PointerEvent } from "react";
import cn from "~/lib/utils/cn";

export type ResizeHandleProps = Omit<
	ComponentProps<"button">,
	"children" | "onDrag" | "onDragEnd" | "onPointerDown"
> & {
	axis?: "x" | "y";
	onDrag: (position: number) => void;
	onDragEnd?: (position: number) => void;
	onStep?: (delta: number) => void;
	step?: number;
};

/**
 * Pointer-driven pane resize control with optional keyboard stepping.
 */
export function ResizeHandle({
	axis = "x",
	className,
	onDrag,
	onDragEnd,
	onKeyDown,
	onStep,
	step = 16,
	...props
}: ResizeHandleProps): React.JSX.Element {
	const handlePointerDown = (event: PointerEvent<HTMLButtonElement>): void => {
		event.preventDefault();
		let lastPosition = axis === "x" ? event.clientX : event.clientY;
		const handlePointerMove = (moveEvent: globalThis.PointerEvent): void => {
			lastPosition = axis === "x" ? moveEvent.clientX : moveEvent.clientY;
			onDrag(lastPosition);
		};
		const handlePointerUp = (): void => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			onDragEnd?.(lastPosition);
		};
		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
		onKeyDown?.(event);
		if (event.defaultPrevented || !onStep) return;

		const decrementKey = axis === "x" ? "ArrowLeft" : "ArrowUp";
		const incrementKey = axis === "x" ? "ArrowRight" : "ArrowDown";
		if (event.key !== decrementKey && event.key !== incrementKey) return;

		event.preventDefault();
		onStep(event.key === decrementKey ? -step : step);
	};

	return (
		<button
			data-reader-component="ResizeHandle"
			data-reader-role="resize-handle"
			{...props}
			type="button"
			data-axis={axis}
			data-slot="resize-handle"
			className={cn(
				"group relative z-30 touch-none bg-foreground/5 outline-none hover:bg-primary/20 focus-visible:ring-4 focus-visible:ring-ring/40",
				axis === "x"
					? "w-4 cursor-col-resize md:w-2"
					: "h-4 cursor-row-resize md:h-2",
				className,
			)}
			onKeyDown={handleKeyDown}
			onPointerDown={handlePointerDown}
		>
			<span
				aria-hidden="true"
				className={cn(
					"-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 rounded-full bg-foreground/24 group-hover:bg-primary",
					axis === "x"
						? "h-16 w-1.5 md:h-14 md:w-1"
						: "h-1.5 w-16 md:h-1 md:w-14",
				)}
			/>
		</button>
	);
}
