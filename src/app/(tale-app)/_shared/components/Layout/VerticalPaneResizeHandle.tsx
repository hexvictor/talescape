"use client";

/**
 * Renders a draggable vertical separator between adjacent panes.
 *
 * @param props - Resize handle properties.
 * @param props.label - Accessible control label.
 * @param props.onDrag - Receives the current pointer X coordinate.
 * @param props.onDragEnd - Receives the final pointer X coordinate.
 * @returns Draggable pane separator.
 *
 * @example
 * <VerticalPaneResizeHandle label="Resize sidebar" onDrag={resizeSidebar} />
 */
export function VerticalPaneResizeHandle({
	label,
	onDrag,
	onDragEnd,
}: {
	label: string;
	onDrag: (clientX: number) => void;
	onDragEnd?: (clientX: number) => void;
}): React.JSX.Element {
	/**
	 * Starts pointer tracking for pane resizing.
	 *
	 * @param event - Pointer down event from the resize control.
	 * @returns Nothing.
	 */
	const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
		event.preventDefault();
		let lastClientX = event.clientX;
		const handlePointerMove = (moveEvent: PointerEvent): void => {
			lastClientX = moveEvent.clientX;
			onDrag(moveEvent.clientX);
		};
		const handlePointerUp = (): void => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			onDragEnd?.(lastClientX);
		};
		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
	};

	return (
		<button
			type="button"
			aria-label={label}
			data-reader-component="VerticalPaneResizeHandle"
			data-reader-role="pane-resizer"
			className="group relative z-30 w-2 cursor-col-resize bg-foreground/5 hover:bg-primary/20"
			onPointerDown={handlePointerDown}
		>
			<span className="-translate-x-1/2 absolute top-1/2 left-1/2 h-14 w-1 rounded-full bg-foreground/20 group-hover:bg-primary" />
		</button>
	);
}
