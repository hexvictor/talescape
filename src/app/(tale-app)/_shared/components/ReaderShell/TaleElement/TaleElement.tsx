"use client";

import { useTaleRenderSlots } from "../../../contexts/TaleRenderContext";
import type { ResolvedTaleElement } from "../../../types";
import { ReaderElement } from "../ReaderElement/ReaderElement";

/**
 * Chooses the base or application-extended element renderer.
 *
 * @param props - Tale element properties.
 * @param props.contentSized - Whether the owning block uses content-derived sizing.
 * @param props.element - Element to render.
 * @param props.index - Element index inside its owning node or layer.
 * @returns Base reader element or the active application extension.
 *
 * @example
 * <TaleElement element={element} index={0} />
 */
export function TaleElement({
	contentSized = false,
	element,
	index,
}: {
	contentSized?: boolean;
	element: ResolvedTaleElement;
	index: number;
}): React.JSX.Element {
	const { Element } = useTaleRenderSlots();

	if (Element) {
		return (
			<Element contentSized={contentSized} element={element} index={index} />
		);
	}

	return (
		<ReaderElement
			contentSized={contentSized}
			element={element}
			index={index}
		/>
	);
}
