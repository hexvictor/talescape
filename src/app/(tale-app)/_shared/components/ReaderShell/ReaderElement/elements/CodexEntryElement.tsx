"use client";

import { BookMarked } from "lucide-react";
import { useTaleReaderStoreShallow } from "../../../../contexts/TaleReaderStoreContext";
import type { ResolvedTaleElement } from "../../../../types";

/**
 * Renders a element button that opens the Reader Hub on the Codex panel.
 *
 * @param props - Codex entry element properties.
 * @param props.element - Element containing optional label and text.
 * @returns Interactive codex entry launcher.
 *
 * @example
 * <CodexEntryElement element={element} />
 */
export function CodexEntryElement({
	element,
}: {
	element: ResolvedTaleElement;
}): React.JSX.Element {
	const { openCodex } = useTaleReaderStoreShallow((state) => ({
		openCodex: state.hub.openCodex,
	}));

	return (
		<button
			data-reader-ui="true"
			data-reader-component="CodexEntryElement"
			data-reader-element-id={element.id}
			data-reader-role="codex-entry-control"
			type="button"
			className="pointer-events-auto inline-flex max-w-full items-center gap-3 rounded-lg border border-primary/35 bg-primary/12 px-4 py-3 text-left text-primary shadow-xl backdrop-blur-md transition hover:bg-primary/18"
			onClick={openCodex}
		>
			<BookMarked size={17} className="shrink-0" />
			<span className="min-w-0">
				<span className="block truncate font-black text-sm">
					{element.label ?? "Open codex"}
				</span>
				{element.text ? (
					<span className="mt-1 block text-foreground/62 text-xs leading-5">
						{element.text}
					</span>
				) : null}
			</span>
		</button>
	);
}
