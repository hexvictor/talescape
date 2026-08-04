"use client";

import { BookMarked } from "lucide-react";
import { useTaleReaderStoreShallow } from "../../../../contexts/TaleReaderStoreContext";
import type { ResolvedTaleFragment } from "../../../../types";

/**
 * Renders a fragment button that opens the Reader Hub on the Codex panel.
 *
 * @param props - Codex entry fragment properties.
 * @param props.fragment - Fragment containing optional label and text.
 * @returns Interactive codex entry launcher.
 *
 * @example
 * <CodexEntryFragment fragment={fragment} />
 */
export function CodexEntryFragment({
	fragment,
}: {
	fragment: ResolvedTaleFragment;
}): React.JSX.Element {
	const { openCodex } = useTaleReaderStoreShallow((state) => ({
		openCodex: state.hub.openCodex,
	}));

	return (
		<button
			data-reader-ui="true"
			data-reader-component="CodexEntryFragment"
			data-reader-fragment-id={fragment.id}
			data-reader-role="codex-entry-control"
			type="button"
			className="pointer-events-auto inline-flex max-w-full items-center gap-3 rounded-lg border border-primary/35 bg-primary/12 px-4 py-3 text-left text-primary shadow-xl backdrop-blur-md transition hover:bg-primary/18"
			onClick={openCodex}
		>
			<BookMarked size={17} className="shrink-0" />
			<span className="min-w-0">
				<span className="block truncate font-black text-sm">
					{fragment.label ?? "Open codex"}
				</span>
				{fragment.text ? (
					<span className="mt-1 block text-foreground/62 text-xs leading-5">
						{fragment.text}
					</span>
				) : null}
			</span>
		</button>
	);
}
