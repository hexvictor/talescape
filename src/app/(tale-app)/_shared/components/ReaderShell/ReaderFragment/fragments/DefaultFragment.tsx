"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import type { ResolvedTaleFragment } from "../../../../types";

/**
 * Renders a semantic text fragment with optional controlled inline editing.
 *
 * @param props - Text fragment presentation props.
 * @param props.editing - Whether the text is currently content-editable.
 * @param props.fragment - Resolved text fragment data and styles.
 * @param props.index - Fragment position used for alternating alignment.
 * @param props.onCommit - Receives edited text when the field loses focus.
 * @param props.onRequestEdit - Requests editor ownership after a double-click.
 * @returns Styled text fragment content.
 *
 * @example
 * <DefaultFragment fragment={fragment} index={0} />
 */
export function DefaultFragment({
	editing = false,
	fragment,
	index,
	onCommit,
	onRequestEdit,
}: {
	editing?: boolean;
	fragment: ResolvedTaleFragment;
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
			data-reader-component="DefaultFragment"
			data-reader-role="text-content"
			data-reader-fragment-id={fragment.id}
			className={clsx(
				"max-w-3xl p-5 text-base leading-8 backdrop-blur-md md:text-lg",
				index % 2 === 0 ? "justify-self-start" : "justify-self-end",
			)}
			style={{
				background: fragment.style?.backgroundCss,
				border: fragment.style?.border,
				borderRadius: fragment.style?.borderRadius,
				boxShadow: fragment.style?.boxShadow,
				color: fragment.style?.color,
				fontSize: fragment.style?.fontSize,
				fontWeight: fragment.style?.fontWeight,
				lineHeight: fragment.style?.lineHeight,
				textAlign: fragment.style?.textAlign,
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
				{fragment.text}
			</p>
		</div>
	);
}
