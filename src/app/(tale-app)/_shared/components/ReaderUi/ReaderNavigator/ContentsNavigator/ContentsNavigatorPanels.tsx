"use client";

import clsx from "clsx";
import {
	Braces,
	ChevronDown,
	ChevronRight,
	Layers3,
	LocateFixed,
	MousePointerClick,
} from "lucide-react";
import { useState } from "react";
import type {
	ReaderContentsEntry,
	ReaderContentsPart,
	ResolvedTaleBranch,
	ResolvedTalePath,
} from "../../../../types";
import {
	EntryTypeIcon,
	getEntryTypeLabel,
} from "../EntryNavigator/EntryTypeIcon";
import { EntryPagesGrid } from "./EntryPagesGrid";
import { RouteGraphSection } from "./RouteGraphSection";

type ContentsTreeProps = {
	contents: ReaderContentsPart[];
	currentBlockId: string | null;
	currentEntryId: string | null;
	onNavigate: (blockId: string) => void;
};

/**
 * Renders visible parts, entries, and page groups.
 *
 * @param props - Compiled contents and navigation state.
 * @returns The visible contents tree.
 */
export function ContentsTree({
	contents,
	currentBlockId,
	currentEntryId,
	onNavigate,
}: ContentsTreeProps): React.JSX.Element {
	const [collapsedPartIds, setCollapsedPartIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [expandedEntryIds, setExpandedEntryIds] = useState<Set<string>>(
		() => new Set(),
	);

	/**
	 * Navigates to the selected entry.
	 *
	 * @param entry - Selected compiled entry.
	 * @returns Nothing.
	 */
	const selectEntry = (entry: ReaderContentsEntry): void => {
		onNavigate(entry.firstBlockId);
	};

	/**
	 * Toggles the pages displayed beneath an entry.
	 *
	 * @param entryId - Entry whose pages should be expanded or collapsed.
	 * @returns Nothing.
	 */
	const toggleEntry = (entryId: string): void => {
		setExpandedEntryIds((current) => {
			const next = new Set(current);
			if (next.has(entryId)) next.delete(entryId);
			else next.add(entryId);
			return next;
		});
	};

	/**
	 * Toggles the entries displayed beneath a story part.
	 *
	 * @param partId - Part whose contents should collapse or expand.
	 * @returns Nothing.
	 */
	const togglePart = (partId: string): void => {
		setCollapsedPartIds((current) => {
			const next = new Set(current);
			if (next.has(partId)) next.delete(partId);
			else next.add(partId);
			return next;
		});
	};

	return (
		<div
			data-reader-component="ContentsTree"
			data-reader-role="contents-tree"
			className="space-y-3"
		>
			{contents.map((part, partIndex) => {
				const collapsed = collapsedPartIds.has(part.id);
				return (
					<section
						key={part.id}
						data-reader-component="ContentsTree"
						data-reader-role="part-section"
						className="rounded-md border border-foreground/10 bg-foreground/[0.025] p-2"
					>
						<div className="mb-2 flex items-center gap-1 rounded hover:bg-foreground/5">
							<button
								type="button"
								aria-label={
									collapsed ? `Expand ${part.title}` : `Collapse ${part.title}`
								}
								className="grid h-9 w-9 shrink-0 place-items-center text-foreground/48 hover:text-foreground"
								onClick={() => togglePart(part.id)}
							>
								{collapsed ? (
									<ChevronRight size={15} />
								) : (
									<ChevronDown size={15} />
								)}
							</button>
							<button
								type="button"
								className="flex min-w-0 flex-1 items-center gap-3 py-2 pr-2 text-left"
								onClick={() => onNavigate(part.firstBlockId)}
							>
								<Layers3 size={17} className="text-primary" />
								<span className="min-w-0 flex-1">
									<span className="block font-semibold text-foreground/88 text-sm">
										Part {partIndex + 1}
									</span>
									<span className="block truncate text-foreground/42 text-xs">
										{part.title}
									</span>
								</span>
								<span className="text-foreground/38 text-xs">
									{part.pageCount} pages
								</span>
							</button>
						</div>
						{collapsed ? null : (
							<div className="space-y-1 border-foreground/8 border-l pl-3">
								{part.entries.map((entry) => {
									const active = entry.id === currentEntryId;
									const expanded =
										expandedEntryIds.has(entry.id) ||
										(active && entry.pages.length > 1);
									return (
										<div
											key={entry.id}
											data-reader-component="ContentsTree"
											data-reader-role="entry-section"
											data-reader-entry-id={entry.id}
										>
											<div
												className={clsx(
													"flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs",
													active
														? "bg-foreground/10 text-foreground"
														: entry.hasChoiceBlock
															? "text-[#d8f5da] hover:bg-[#8bcf90]/10 hover:text-foreground"
															: "text-foreground/58 hover:bg-foreground/6 hover:text-foreground/84",
												)}
											>
												{entry.pages.length > 1 ? (
													<button
														type="button"
														aria-label={
															expanded
																? `Collapse pages in ${entry.title}`
																: `Expand pages in ${entry.title}`
														}
														className="grid h-6 w-6 shrink-0 place-items-center rounded hover:bg-foreground/8"
														onClick={() => toggleEntry(entry.id)}
													>
														{expanded ? (
															<ChevronDown size={13} />
														) : (
															<ChevronRight size={13} />
														)}
													</button>
												) : (
													<span className="w-6" />
												)}
												<button
													type="button"
													title={`${getEntryTypeLabel(entry.type)}: ${entry.title}`}
													className="flex min-w-0 flex-1 items-center gap-2 text-left"
													onClick={() => selectEntry(entry)}
												>
													<span className="grid h-6 w-6 shrink-0 place-items-center rounded border border-foreground/10">
														{entry.type === "chapter" ? (
															entry.chapterNumber
														) : (
															<EntryTypeIcon type={entry.type} size={12} />
														)}
													</span>
													<span className="min-w-0 flex-1 truncate">
														{entry.title}
													</span>
													<span className="rounded border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 text-[9px] text-foreground/42 uppercase">
														{getEntryTypeLabel(entry.type)}
													</span>
													{entry.hasChoiceBlock ? (
														<span className="rounded border border-[#8bcf90]/35 bg-[#8bcf90]/10 px-1.5 py-0.5 text-[#d8f5da] text-[9px] uppercase">
															Choice
														</span>
													) : null}
													<span className="text-foreground/35">
														{entry.pages.length > 1 ? entry.pages.length : null}
													</span>
												</button>
											</div>
											{expanded ? (
												<EntryPagesGrid
													currentBlockId={currentBlockId}
													entry={entry}
													onNavigate={onNavigate}
												/>
											) : null}
										</div>
									);
								})}
							</div>
						)}
					</section>
				);
			})}
		</div>
	);
}

type RoutesPanelProps = {
	branches: ResolvedTaleBranch[];
	currentBranchId: string | null;
	onChoosePath: (path: ResolvedTalePath) => void;
	onTravelToBlock: (blockId: string) => void;
	paths: ResolvedTalePath[];
	reachableBlockIds: Set<string>;
	reachableBranchIds: Set<string>;
	selectedBranchIds: string[];
};

/**
 * Renders branch and path context for the visible story graph.
 *
 * @param props - Tale branches, paths, and selected branch identifiers.
 * @returns The story routes panel.
 */
export function RoutesPanel({
	branches,
	currentBranchId,
	onChoosePath,
	onTravelToBlock,
	paths,
	reachableBlockIds,
	reachableBranchIds,
	selectedBranchIds,
}: RoutesPanelProps): React.JSX.Element {
	return (
		<div
			data-reader-component="RoutesPanel"
			data-reader-role="route-list"
			className="space-y-3"
		>
			<RouteGraphSection
				branches={branches}
				currentBranchId={currentBranchId}
				onChoosePath={onChoosePath}
				onTravelToBlock={onTravelToBlock}
				paths={paths}
				reachableBlockIds={reachableBlockIds}
				reachableBranchIds={reachableBranchIds}
				selectedBranchIds={selectedBranchIds}
			/>
			{branches.map((branch) => {
				const selected =
					branch.position.isRootBranch || selectedBranchIds.includes(branch.id);
				const reachable = reachableBranchIds.has(branch.id);
				const branchPaths = paths.filter(
					(path) => path.fromBranchId === branch.id,
				);
				return (
					<section
						key={branch.id}
						data-reader-component="RoutesPanel"
						data-reader-role="branch-section"
						className={clsx(
							"rounded-md border p-3",
							selected
								? "border-primary/60 bg-primary/8"
								: "border-foreground/10 bg-foreground/[0.025]",
							reachable ? "opacity-100" : "opacity-35",
						)}
					>
						<div className="flex items-center gap-2">
							<Braces
								size={16}
								className={selected ? "text-primary" : "text-foreground/35"}
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate font-semibold text-foreground/84 text-sm">
									{branch.title}
								</p>
								<p className="text-foreground/38 text-xs">
									{branch.counts.blocks} blocks ·{" "}
									{selected ? "active route" : "available route"}
								</p>
							</div>
						</div>
						{branchPaths.length > 0 ? (
							<div className="mt-2 space-y-1 border-foreground/8 border-l pl-3">
								{branchPaths.map((path) => {
									const pathReachable = reachableBlockIds.has(path.fromBlockId);
									const currentOption =
										path.fromBranchId === currentBranchId && pathReachable;
									return (
										<div
											key={path.id}
											className={clsx(
												"flex items-center gap-1 rounded px-1 py-1 text-[11px]",
												currentOption
													? "bg-sky-300/8 text-sky-100/75"
													: "text-foreground/45 hover:bg-foreground/6",
												pathReachable ? "opacity-100" : "opacity-30",
											)}
										>
											<span className="min-w-0 flex-1 truncate">
												{path.label}
											</span>
											<button
												type="button"
												title="Apply this path"
												aria-label={`Apply ${path.label}`}
												disabled={!pathReachable}
												className="grid h-7 w-7 shrink-0 place-items-center rounded text-foreground/48 hover:bg-foreground/10 hover:text-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent"
												onClick={() => onChoosePath(path)}
											>
												<MousePointerClick size={12} />
											</button>
											<button
												type="button"
												title="Travel to this choice"
												aria-label={`Travel to ${path.label} choice`}
												disabled={!pathReachable}
												className="grid h-7 w-7 shrink-0 place-items-center rounded text-foreground/48 hover:bg-foreground/10 hover:text-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent"
												onClick={() => onTravelToBlock(path.fromBlockId)}
											>
												<LocateFixed size={12} />
											</button>
										</div>
									);
								})}
							</div>
						) : null}
					</section>
				);
			})}
		</div>
	);
}
