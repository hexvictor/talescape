"use client";

import { useEffect, useRef } from "react";
import cn from "~/lib/utils/cn";
import type { ResolvedTaleElement } from "../../../../types";

/**
 * Renders a semantic text element with optional controlled inline editing.
 *
 * @param props - Text element presentation props.
 * @param props.editing - Whether the text is currently content-editable.
 * @param props.element - Resolved text element data and styles.
 * @param props.index - Element position used for alternating alignment.
 * @param props.onCommit - Receives edited text when the field loses focus.
 * @param props.onRequestEdit - Requests Studio editing after a double-click.
 * @returns Styled text element content.
 *
 * @example
 * <DefaultElement element={element} index={0} />
 */
export function DefaultElement({
	editing = false,
	element,
	index,
	onCommit,
	onRequestEdit,
}: {
	editing?: boolean;
	element: ResolvedTaleElement;
	index: number;
	onCommit?: (text: string) => void;
	onRequestEdit?: () => void;
}): React.JSX.Element {
	const textRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		if (!editing || !textRef.current) return;
		textRef.current.focus();
		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(textRef.current);
		selection?.removeAllRanges();
		selection?.addRange(range);
	}, [editing]);

	return (
		<div
			data-reader-component="DefaultElement"
			data-reader-role="text-content"
			data-reader-element-id={element.id}
			className={cn(
				"max-w-3xl p-5 text-base leading-8 backdrop-blur-md md:text-lg",
				index % 2 === 0 ? "justify-self-start" : "justify-self-end",
			)}
			style={{
				background: element.style?.backgroundCss,
				border: element.style?.border,
				borderRadius: element.style?.borderRadius,
				boxShadow: element.style?.boxShadow,
				color: element.style?.color,
				fontSize: element.style?.fontSize,
				fontWeight: element.style?.fontWeight,
				lineHeight: element.style?.lineHeight,
				textAlign: element.style?.textAlign,
			}}
		>
			<p
				ref={textRef}
				contentEditable={editing}
				suppressContentEditableWarning={editing}
				onBlur={(event) => onCommit?.(event.currentTarget.textContent ?? "")}
				onDoubleClick={(event) => {
					event.stopPropagation();
					onRequestEdit?.();
				}}
				onKeyDown={(event) => {
					if (event.key === "Escape") event.currentTarget.blur();
					if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
						event.currentTarget.blur();
					}
				}}
			>
				{element.text}
			</p>
		</div>
	);
}
