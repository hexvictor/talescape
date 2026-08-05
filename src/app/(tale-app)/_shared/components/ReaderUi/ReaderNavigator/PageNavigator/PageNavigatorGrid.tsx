"use client";

import clsx from "clsx";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type {
	ReaderContentsEntry,
	ReaderContentsPage,
} from "~/app/(tale-app)/_shared/types";
import {
	EntryTypeIcon,
	getEntryTypeLabel,
} from "../EntryNavigator/EntryTypeIcon";
import { ReaderTypeIcon } from "../EntryNavigator/ReaderTypeIcon";
import { getReaderPartLabel, getReaderPartTheme } from "../readerPartTheme";

type PageNavigatorGridProps = {
	currentPageId: string;
	entries: ReaderContentsEntry[];
	onNavigate: (page: ReaderContentsPage) => void;
	pages: ReaderContentsPage[];
};

type PartTab = {
	id: string;
	number: number;
	pageCount: number;
	title: string;
};

/**
 * Renders route pages as part tabs containing expandable entries.
 *
 * @param props - Compiled pages, entries, active page, and navigation callback.
 * @returns A tabbed page browser where only page controls navigate.
 */
export function PageNavigatorGrid({
	currentPageId,
	entries,
	onNavigate,
	pages,
}: PageNavigatorGridProps): React.JSX.Element {
	const currentPage = pages.find((page) => page.id === currentPageId) ?? null;
	const currentEntryId = currentPage?.entryId ?? null;
	const partTabs = useMemo(() => {
		const tabsById = new Map<string, PartTab>();
		for (const page of pages) {
			const tab = tabsById.get(page.partId);
			if (tab) {
				tab.pageCount += 1;
				continue;
			}
			tabsById.set(page.partId, {
				id: page.partId,
				number: page.partNumber,
				pageCount: 1,
				title: page.partTitle,
			});
		}
		return [...tabsById.values()];
	}, [pages]);
	const [activePartId, setActivePartId] = useState(
		currentPage?.partId ?? partTabs[0]?.id ?? "",
	);
	const [expandedEntryIds, setExpandedEntryIds] = useState<Set<string>>(
		() => new Set(currentEntryId ? [currentEntryId] : []),
	);

	useEffect(() => {
		if (!currentPage) return;
		setActivePartId(currentPage.partId);
		setExpandedEntryIds(new Set([currentPage.entryId]));
	}, [currentPage]);

	const activePages = pages.filter((page) => page.partId === activePartId);
	const activePageIdsByEntry = new Map<string, ReaderContentsPage[]>();
	for (const page of activePages) {
		const entryPages = activePageIdsByEntry.get(page.entryId);
		if (entryPages) entryPages.push(page);
		else activePageIdsByEntry.set(page.entryId, [page]);
	}
	const activeEntries = entries.filter((entry) =>
		activePageIdsByEntry.has(entry.id),
	);

	const toggleEntry = (entryId: string): void => {
		setExpandedEntryIds((current) => {
			const next = new Set(current);
			if (next.has(entryId)) next.delete(entryId);
			else next.add(entryId);
			return next;
		});
	};

	return (
		<div
			data-reader-component="PageNavigatorGrid"
			data-reader-role="page-window"
			className="max-h-[min(68vh,32rem)] overflow-hidden"
		>
			<div
				data-reader-component="PageNavigatorGrid"
				data-reader-role="part-tabs"
				className="reader-scrollbar-hidden flex gap-1 overflow-x-auto border-foreground/10 border-b px-4 pt-3"
				role="tablist"
				aria-label="Story parts"
			>
				{partTabs.map((part) => {
					const active = part.id === activePartId;
					return (
						<motion.button
							data-reader-component="PageNavigatorGrid"
							data-reader-role="part-tab"
							data-reader-part-id={part.id}
							key={part.id}
							type="button"
							role="tab"
							aria-selected={active}
							style={getReaderPartTheme(part.number)}
							className={clsx(
								"relative flex shrink-0 items-center gap-2 rounded-t-md border border-b-0 px-3 py-2 text-left",
								active
									? "border-[color:var(--reader-part-border)] bg-[color:var(--reader-part-soft-strong)] text-foreground"
									: "border-transparent text-foreground/48 hover:bg-[color:var(--reader-part-soft)] hover:text-foreground",
							)}
							whileHover={{ y: -1 }}
							whileTap={{ scale: 0.97 }}
							transition={{ duration: 0.14 }}
							onClick={() => setActivePartId(part.id)}
						>
							<span className="font-bold text-[10px] text-[color:var(--reader-part-solid)]">
								{getReaderPartLabel(part.number)}
							</span>
							<span className="max-w-28 truncate font-medium text-[10px]">
								{part.title}
							</span>
							<span className="text-[9px] opacity-55">{part.pageCount}</span>
						</motion.button>
					);
				})}
			</div>
			<div
				data-reader-component="PageNavigatorGrid"
				data-reader-role="entry-groups"
				className="reader-scrollbar-hidden max-h-[min(58vh,27rem)] space-y-2 overflow-y-auto p-3"
			>
				{activeEntries.map((entry) => {
					const entryPages = activePageIdsByEntry.get(entry.id) ?? [];
					const isCurrentEntry = entry.id === currentEntryId;
					const expanded = expandedEntryIds.has(entry.id);

					return (
						<motion.section
							data-reader-component="PageNavigatorGrid"
							data-reader-role="entry-group"
							data-reader-entry-id={entry.id}
							data-reader-current={isCurrentEntry ? "true" : "false"}
							key={entry.id}
							layout="position"
							className={clsx(
								"overflow-hidden rounded-lg border",
								isCurrentEntry
									? "border-primary/30 bg-primary/[0.055]"
									: "border-foreground/10 bg-foreground/[0.025]",
							)}
						>
							<motion.button
								data-reader-component="PageNavigatorGrid"
								data-reader-role="entry-toggle"
								type="button"
								aria-expanded={expanded}
								className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-foreground/[0.045]"
								whileTap={{ scale: 0.99 }}
								transition={{ duration: 0.12 }}
								onClick={() => toggleEntry(entry.id)}
							>
								<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-foreground/10 bg-background/80">
									{entry.type === "chapter" ? (
										<span className="font-semibold text-[10px]">
											{entry.chapterNumber}
										</span>
									) : (
										<EntryTypeIcon type={entry.type} size={12} />
									)}
								</span>
								<span className="min-w-0 flex-1">
									<span className="block truncate font-semibold text-[11px] text-foreground/84">
										{entry.title}
									</span>
									<span className="block text-[9px] text-foreground/46 uppercase">
										{getEntryTypeLabel(entry.type)} · {entryPages.length}{" "}
										{entryPages.length === 1 ? "page" : "pages"}
									</span>
								</span>
								<motion.span
									className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-foreground/48"
									animate={{ rotate: expanded ? 90 : 0 }}
									transition={{ duration: 0.16 }}
								>
									{expanded ? (
										<ChevronDown className="rotate-[-90deg]" size={13} />
									) : (
										<ChevronRight size={13} />
									)}
								</motion.span>
							</motion.button>
							<AnimatePresence initial={false}>
								{expanded ? (
									<motion.div
										data-reader-component="PageNavigatorGrid"
										data-reader-role="entry-pages"
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.18, ease: "easeOut" }}
										className="overflow-hidden"
									>
										<div className="grid grid-cols-3 gap-2 border-foreground/8 border-t p-2 sm:grid-cols-4">
											{entryPages.map((page) => {
												const active = page.id === currentPageId;
												return (
													<motion.button
														data-reader-component="PageNavigatorGrid"
														data-reader-page-id={page.id}
														data-reader-part-id={page.partId}
														data-reader-role="page-control"
														key={page.id}
														type="button"
														title={`${page.label}: ${page.title}`}
														style={getReaderPartTheme(page.partNumber)}
														className={clsx(
															"relative flex aspect-square min-w-0 flex-col items-start justify-between rounded-lg border p-2 text-left",
															active
																? "border-primary bg-primary text-background shadow-[0_0_0_3px_rgba(217,181,111,0.12)]"
																: page.hasChoiceBlock
																	? "border-emerald-600/45 bg-emerald-500/12 text-emerald-900 hover:border-emerald-600/75 hover:bg-emerald-500/18 hover:text-foreground dark:border-[#8bcf90]/50 dark:bg-[#8bcf90]/12 dark:text-[#d8f5da] dark:hover:border-[#8bcf90]/75"
																	: "border-[color:var(--reader-part-border)] bg-[color:var(--reader-part-soft)] text-foreground hover:bg-[color:var(--reader-part-soft-strong)]",
														)}
														whileHover={{ y: -2 }}
														whileTap={{ scale: 0.96 }}
														transition={{ duration: 0.13 }}
														onClick={() => onNavigate(page)}
													>
														<div className="flex w-full items-start justify-between gap-2">
															<span className="font-semibold text-[11px] leading-none">
																{page.label}
															</span>
															<span
																className={clsx(
																	"grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[8px]",
																	active
																		? "border-background/18 bg-background/12 text-background"
																		: "border-[color:var(--reader-part-border)] bg-background/80 text-[color:var(--reader-part-solid)]",
																)}
															>
																<ReaderTypeIcon type={page.type} size={10} />
															</span>
														</div>
														<p className="line-clamp-2 w-full text-[9px] leading-tight opacity-90">
															{page.title}
														</p>
														<div className="flex w-full items-center justify-between gap-2 text-[8px] uppercase opacity-72">
															<span className="truncate">
																{page.type.replaceAll("_", " ")}
															</span>
															{page.hasChoiceBlock ? <span>Choice</span> : null}
														</div>
													</motion.button>
												);
											})}
										</div>
									</motion.div>
								) : null}
							</AnimatePresence>
						</motion.section>
					);
				})}
			</div>
		</div>
	);
}
