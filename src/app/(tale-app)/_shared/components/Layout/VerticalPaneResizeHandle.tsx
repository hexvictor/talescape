"use client";

import { ResizeHandle } from "~/components/ui/resize-handle";

/**
 * Renders a draggable vertical separator between adjacent panes.
 *
 * @param props - Resize handle properties.
 * @param props.className - Optional extra classes for responsive visibility.
 * @param props.label - Accessible control label.
 * @param props.onDrag - Receives the current pointer X coordinate.
 * @param props.onDragEnd - Receives the final pointer X coordinate.
 * @returns Draggable pane separator.
 *
 * @example
 * <VerticalPaneResizeHandle label="Resize sidebar" onDrag={resizeSidebar} />
 */
export function VerticalPaneResizeHandle({
	className,
	label,
	onDrag,
	onDragEnd,
}: {
	className?: string;
	label: string;
	onDrag: (clientX: number) => void;
	onDragEnd?: (clientX: number) => void;
}): React.JSX.Element {
	return (
		<ResizeHandle
			aria-label={label}
			data-reader-component="VerticalPaneResizeHandle"
			data-reader-role="pane-resizer"
			className={className}
			onDrag={onDrag}
			onDragEnd={onDragEnd}
		/>
	);
}
