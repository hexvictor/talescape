"use client";

import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import type { ReaderNavigationEntry } from "../../../../services/readerNavigationView";
import { ReaderTypeIcon } from "../EntryNavigator/ReaderTypeIcon";
import { getReaderPartTheme } from "../readerPartTheme";

/**
 * Renders the route-visible pages belonging to a contents entry.
 *
 * @param props - Entry pages, current block, and navigation callback.
 * @returns A compact page button grid or nothing for single-page entries.
 *
 * @example
 * <EntryPagesGrid entry={entry} currentSceneId={sceneId} onNavigate={jump} />
 */
export function EntryPagesGrid({
	currentPageId,
	entry,
	onNavigate,
}: {
	currentPageId: string | null;
	entry: ReaderNavigationEntry;
	onNavigate: (keyframeId: string) => void;
}): React.JSX.Element | null {
	if (entry.pages.length <= 1) return null;

	return (
		<div
			data-reader-component="EntryPagesGrid"
			data-reader-role="entry-page-list"
			className="mt-2 flex flex-wrap gap-2 px-2 pb-3 pl-10"
		>
			{entry.pages.map((page) => (
				<Button
					key={page.id}
					data-reader-component="EntryPagesGrid"
					data-reader-role="page-control"
					data-reader-page-id={page.id}
					type="button"
					size="icon"
					variant="ghost"
					motion="flat"
					title={`${page.label}: ${page.title}`}
					aria-label={`Go to ${page.label}: ${page.title}`}
					style={getReaderPartTheme(page.partNumber)}
					className={cn(
						"group/page h-9 w-9 rounded-full border p-0 font-bold text-[10px] transition",
						page.id === currentPageId
							? "border-primary bg-primary text-background shadow-[0_0_0_3px_rgba(217,181,111,0.12)]"
							: page.hasChoiceScene
								? "border-emerald-600/45 bg-emerald-500/12 text-emerald-900 hover:border-emerald-600/75 hover:bg-emerald-500/18 hover:text-foreground dark:border-[#8bcf90]/50 dark:bg-[#8bcf90]/12 dark:text-[#d8f5da] dark:hover:border-[#8bcf90]/75"
								: "border-[color:var(--reader-part-border)] bg-[color:var(--reader-part-soft)] text-[color:var(--reader-part-solid)] hover:bg-[color:var(--reader-part-soft-strong)] hover:text-foreground",
					)}
					onClick={() => onNavigate(page.firstKeyframeId)}
				>
					{page.number ?? <ReaderTypeIcon type={page.type} size={12} />}
				</Button>
			))}
		</div>
	);
}
