"use client";

import { useTaleRenderSlots } from "../../../contexts/TaleRenderContext";
import type { ResolvedTaleFragment } from "../../../types";
import { ReaderFragment } from "../ReaderFragment/ReaderFragment";

/**
 * Chooses the base or application-extended fragment renderer.
 *
 * @param props - Tale fragment properties.
 * @param props.contentSized - Whether the owning block uses content-derived sizing.
 * @param props.fragment - Fragment to render.
 * @param props.index - Fragment index inside its owning node or layer.
 * @returns Base reader fragment or the active application extension.
 *
 * @example
 * <TaleFragment fragment={fragment} index={0} />
 */
export function TaleFragment({
	contentSized = false,
	fragment,
	index,
}: {
	contentSized?: boolean;
	fragment: ResolvedTaleFragment;
	index: number;
}): React.JSX.Element {
	const { Fragment } = useTaleRenderSlots();

	if (Fragment) {
		return (
			<Fragment contentSized={contentSized} fragment={fragment} index={index} />
		);
	}

	return (
		<ReaderFragment
			contentSized={contentSized}
			fragment={fragment}
			index={index}
		/>
	);
}
