"use client";

/**
 * Renders a draggable vertical separator between editor panes.
 *
 * @param props - Resize handle properties.
 * @param props.label - Accessible control label.
 * @param props.onDrag - Receives the current pointer X coordinate.
 * @returns Draggable pane separator.
 *
 * @example
 * <EditorPaneResizeHandle label="Resize preview" onDrag={resizePreview} />
 */
export function EditorPaneResizeHandle({
	label,
	onDrag,
}: {
	label: string;
	onDrag: (clientX: number) => void;
}): React.JSX.Element {
	const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const handlePointerMove = (moveEvent: PointerEvent): void => {
			onDrag(moveEvent.clientX);
		};
		const handlePointerUp = (): void => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
		};
		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
	};

	return (
		<button
			type="button"
			aria-label={label}
			data-reader-component="EditorPaneResizeHandle"
			data-reader-role="pane-resizer"
			className="group relative z-30 w-2 cursor-col-resize bg-white/5 hover:bg-[#d9b56f]/20"
			onPointerDown={handlePointerDown}
		>
			<span className="-translate-x-1/2 absolute top-1/2 left-1/2 h-14 w-1 rounded-full bg-white/20 group-hover:bg-[#d9b56f]" />
		</button>
	);
}
