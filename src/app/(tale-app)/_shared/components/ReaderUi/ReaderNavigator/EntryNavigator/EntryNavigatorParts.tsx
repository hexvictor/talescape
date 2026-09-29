"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Fragment } from "react";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import type {
	ReaderNavigationEntry,
	ReaderNavigationPart,
} from "../../../../services/readerNavigationView";
import { getReaderPartLabel, getReaderPartTheme } from "../readerPartTheme";
import { ReaderTypeIcon } from "./ReaderTypeIcon";

type PartSelectorProps = {
	className?: string;
	currentPart: ReaderNavigationPart | undefined;
	onOpenChange: (open: boolean) => void;
	onSelect: (part: ReaderNavigationPart) => void;
	open: boolean;
	parts: ReaderNavigationPart[];
	showKeyframeButtons?: boolean;
};

/**
 * Renders the active part control and part selection popover.
 *
 * @param props - Part selection state and callbacks.
 * @returns The part selector.
 */
export function PartSelector({
	className,
	currentPart,
	onOpenChange,
	onSelect,
	open,
	parts,
	showKeyframeButtons = true,
}: PartSelectorProps): React.JSX.Element {
	const currentIndex = Math.max(
		parts.findIndex((part) => part.id === currentPart?.id),
		0,
	);
	const currentPartTheme = getReaderPartTheme(currentIndex + 1);
	return (
		<div
			data-reader-component="PartSelector"
			data-reader-role="part-selection"
			className={cn("relative mb-3 flex items-center gap-0.5", className)}
		>
			{showKeyframeButtons ? (
				<Button
					data-reader-component="PartSelector"
					data-reader-role="previous-part-control"
					type="button"
					size="icon"
					variant="ghost"
					motion="flat"
					aria-label="Previous part"
					disabled={currentIndex === 0}
					className="h-7 w-6 border border-transparent p-0 text-foreground/55 transition hover:border-foreground hover:bg-primary hover:text-primary-foreground disabled:opacity-20 disabled:hover:border-transparent disabled:hover:bg-transparent disabled:hover:text-foreground/55"
					onClick={() => {
						const previous = parts[currentIndex - 1];
						if (previous) onSelect(previous);
					}}
				>
					<ChevronLeft size={12} strokeWidth={2.5} />
				</Button>
			) : null}
			<Button
				data-reader-component="PartSelector"
				data-reader-role="part-selector-control"
				type="button"
				size="icon"
				variant="ghost"
				motion="flat"
				aria-label="Select story part"
				aria-expanded={open}
				className="reader-part-selector-control h-8 w-8 rotate-45 border p-0 font-black text-[color:var(--reader-part-solid)] transition hover:bg-[color:var(--reader-part-soft)]"
				style={{
					...currentPartTheme,
					borderColor: "var(--reader-part-border)",
					backgroundColor: "var(--reader-part-soft-strong)",
				}}
				onClick={() => onOpenChange(!open)}
			>
				<span className="-rotate-45 text-[11px]">{currentIndex + 1}</span>
			</Button>
			{showKeyframeButtons ? (
				<Button
					data-reader-component="PartSelector"
					data-reader-role="next-part-control"
					type="button"
					size="icon"
					variant="ghost"
					motion="flat"
					aria-label="Next part"
					disabled={currentIndex >= parts.length - 1}
					className="h-7 w-6 border border-transparent p-0 text-foreground/55 transition hover:border-foreground hover:bg-primary hover:text-primary-foreground disabled:opacity-20 disabled:hover:border-transparent disabled:hover:bg-transparent disabled:hover:text-foreground/55"
					onClick={() => {
						const next = parts[currentIndex + 1];
						if (next) onSelect(next);
					}}
				>
					<ChevronRight size={12} strokeWidth={2.5} />
				</Button>
			) : null}
			<AnimatePresence>
				{open ? (
					<motion.div
						data-reader-component="PartSelector"
						data-reader-role="part-options-bridge"
						className="absolute top-0 right-full z-30 pr-2"
						initial={{ opacity: 0, x: 6 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 6 }}
						transition={{ duration: 0.14 }}
					>
						<div
							data-reader-component="PartSelector"
							data-reader-role="part-options"
							className="reader-part-options w-64 border border-foreground/12 bg-background/92 p-2 shadow-2xl backdrop-blur-md"
						>
							<p className="px-2 py-1 font-semibold text-[10px] text-foreground/45 uppercase">
								Select part
							</p>
							{parts.map((part, index) => (
								<Button
									data-reader-component="PartSelector"
									data-reader-role="part-option"
									data-reader-part-id={part.id}
									key={part.id}
									type="button"
									variant="ghost"
									motion="flat"
									style={getReaderPartTheme(index + 1)}
									className={cn(
										"h-auto w-full justify-start gap-3 px-2 py-2 text-left normal-case transition",
										part.id === currentPart?.id
											? "border border-[color:var(--reader-part-border)] bg-[color:var(--reader-part-soft)] text-foreground"
											: "text-foreground/68 hover:bg-[color:var(--reader-part-soft)] hover:text-foreground",
									)}
									onClick={() => onSelect(part)}
								>
									<span
										className="grid h-8 w-8 place-items-center rounded border font-bold text-[11px] text-[color:var(--reader-part-solid)]"
										style={{
											borderColor: "var(--reader-part-border)",
											backgroundColor: "var(--reader-part-soft-strong)",
										}}
									>
										{getReaderPartLabel(index + 1)}
									</span>
									<span className="min-w-0">
										<span className="block truncate font-semibold text-xs">
											{part.title}
										</span>
										<span className="block text-[10px] text-foreground/42">
											{part.entries.length}{" "}
											{part.entries.length === 1 ? "entry" : "entries"} ·{" "}
											{part.pageCount} {part.pageCount === 1 ? "page" : "pages"}
										</span>
									</span>
								</Button>
							))}
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

type EntryPageFlyoutProps = {
	currentPageId: string | null;
	entry: ReaderNavigationEntry;
	onNavigate: (keyframeId: string) => void;
};

/**
 * Renders entry pages in a horizontal flyout beside the entry rail.
 *
 * @param props - Entry pages and active page navigation state.
 * @returns Horizontal page flyout.
 *
 * @example
 * <EntryPageFlyout entry={entry} currentPageId={pageId} onNavigate={jump} />
 */
export function EntryPageFlyout({
	currentPageId,
	entry,
	onNavigate,
}: EntryPageFlyoutProps): React.JSX.Element {
	return (
		<div
			data-reader-component="EntryPageFlyout"
			data-reader-role="entry-page-window"
			className="reader-entry-page-window pointer-events-auto w-[min(20rem,calc(100vw-8rem))] max-w-[20rem] overflow-hidden border border-foreground/12 bg-background/94 shadow-2xl backdrop-blur-md"
		>
			<div className="border-foreground/10 border-b px-3 py-2">
				<p className="truncate font-semibold text-foreground/84 text-xs">
					{entry.title}
				</p>
				<p className="text-[10px] text-foreground/42">
					{entry.pageCount} {entry.pageCount === 1 ? "page" : "pages"}
				</p>
			</div>
			<div
				data-reader-component="EntryPageFlyout"
				data-reader-role="page-grid"
				className="grid max-h-[16rem] grid-cols-3 gap-2 overflow-y-auto p-3"
			>
				{entry.pages.map((page, index) => {
					const previousPage = index > 0 ? entry.pages[index - 1] : null;
					const showPartStart =
						page.isFirstInPart || previousPage?.partId !== page.partId;
					return (
						<Fragment key={page.id}>
							{showPartStart ? (
								<div
									data-reader-component="EntryPageFlyout"
									data-reader-role="part-section-header"
									data-reader-part-id={page.partId}
									className="col-span-full flex items-center gap-2 pt-1"
								>
									<span
										className="inline-flex items-center justify-center rounded-md border px-1.5 py-1 font-semibold text-[9px] text-[color:var(--reader-part-solid)] leading-none"
										style={{
											...getReaderPartTheme(page.partNumber),
											borderColor: "var(--reader-part-border)",
											backgroundColor: "var(--reader-part-soft-strong)",
										}}
									>
										{getReaderPartLabel(page.partNumber)}
									</span>
									<span className="truncate text-[10px] text-foreground/54">
										{page.partTitle}
									</span>
								</div>
							) : null}
							<Button
								data-reader-component="EntryPageFlyout"
								data-reader-page-id={page.id}
								data-reader-part-id={page.partId}
								data-reader-role="page-control"
								type="button"
								variant="ghost"
								motion="flat"
								title={`${page.label}: ${page.title} · Part ${page.partNumber}: ${page.partTitle}`}
								style={getReaderPartTheme(page.partNumber)}
								className={cn(
									"relative aspect-square h-auto min-w-0 flex-col items-start justify-between border p-2 text-left normal-case transition",
									page.id === currentPageId
										? "border-primary bg-primary text-background shadow-[0_0_0_3px_rgba(217,181,111,0.12)]"
										: page.hasChoiceScene
											? "border-emerald-600/45 bg-emerald-500/12 text-emerald-900 hover:border-emerald-600/75 hover:bg-emerald-500/18 hover:text-foreground dark:border-[#8bcf90]/50 dark:bg-[#8bcf90]/12 dark:text-[#d8f5da] dark:hover:border-[#8bcf90]/75"
											: "border-[color:var(--reader-part-border)] bg-[color:var(--reader-part-soft)] text-foreground hover:bg-[color:var(--reader-part-soft-strong)]",
								)}
								onClick={() => onNavigate(page.firstKeyframeId)}
							>
								<div className="flex w-full items-start justify-between gap-2">
									<span className="font-semibold text-[11px] leading-none">
										{page.number ?? page.label}
									</span>
									<span
										className={cn(
											"grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[8px]",
											page.id === currentPageId
												? "border-background/20 bg-background/12 text-background"
												: "border-[color:var(--reader-part-border)] bg-background/80 text-[color:var(--reader-part-solid)]",
										)}
									>
										<ReaderTypeIcon type={page.type} size={10} />
									</span>
								</div>
								<div className="w-full">
									<p className="line-clamp-2 text-[9px] leading-tight opacity-90">
										{page.title}
									</p>
								</div>
							</Button>
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
