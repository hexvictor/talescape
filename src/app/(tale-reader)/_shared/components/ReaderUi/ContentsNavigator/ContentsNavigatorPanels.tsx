"use client";

import clsx from "clsx";
import { Braces, ChevronDown, ChevronRight, Layers3 } from "lucide-react";
import { useState } from "react";
import type {
	ReaderContentsEntry,
	ReaderContentsPart,
	ResolvedTaleBranch,
	ResolvedTalePath,
} from "../../../types";
import {
	EntryTypeIcon,
	getEntryTypeLabel,
} from "../EntryNavigator/EntryTypeIcon";
import { EntryPagesGrid } from "./EntryPagesGrid";

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
	const [expandedEntryIds, setExpandedEntryIds] = useState<Set<string>>(
		() => new Set(),
	);

	/**
	 * Expands a page list and navigates to the selected entry.
	 *
	 * @param entry - Selected compiled entry.
	 * @returns Nothing.
	 */
	const selectEntry = (entry: ReaderContentsEntry): void => {
		if (entry.pages.length > 1) {
			setExpandedEntryIds((current) => {
				const next = new Set(current);
				if (next.has(entry.id)) next.delete(entry.id);
				else next.add(entry.id);
				return next;
			});
		}
		onNavigate(entry.firstBlockId);
	};

	return (
		<div className="space-y-3">
			{contents.map((part, partIndex) => (
				<section
					key={part.id}
					className="rounded-md border border-white/10 bg-white/[0.025] p-2"
				>
					<button
						type="button"
						className="mb-2 flex w-full items-center gap-3 rounded px-2 py-2 text-left hover:bg-white/5"
						onClick={() => onNavigate(part.firstBlockId)}
					>
						<Layers3 size={17} className="text-[#d9b56f]" />
						<span className="min-w-0 flex-1">
							<span className="block font-semibold text-sm text-white/88">
								Part {partIndex + 1}
							</span>
							<span className="block truncate text-white/42 text-xs">
								{part.title}
							</span>
						</span>
						<span className="text-white/38 text-xs">
							{part.pageCount} pages
						</span>
					</button>
					<div className="space-y-1 border-white/8 border-l pl-3">
						{part.entries.map((entry) => {
							const active = entry.id === currentEntryId;
							const expanded =
								expandedEntryIds.has(entry.id) ||
								(active && entry.pages.length > 1);
							return (
								<div key={entry.id}>
									<button
										type="button"
										title={`${getEntryTypeLabel(entry.type)}: ${entry.title}`}
										className={clsx(
											"flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs",
											active
												? "bg-white/10 text-white"
												: "text-white/58 hover:bg-white/6 hover:text-white/84",
										)}
										onClick={() => selectEntry(entry)}
									>
										{entry.pages.length > 1 ? (
											expanded ? (
												<ChevronDown size={13} />
											) : (
												<ChevronRight size={13} />
											)
										) : (
											<span className="w-[13px]" />
										)}
										<span className="grid h-6 w-6 shrink-0 place-items-center rounded border border-white/10">
											{entry.type === "chapter" ? (
												entry.chapterNumber
											) : (
												<EntryTypeIcon type={entry.type} size={12} />
											)}
										</span>
										<span className="min-w-0 flex-1 truncate">
											{entry.title}
										</span>
										<span className="text-white/35">
											{entry.pages.length > 1 ? entry.pages.length : null}
										</span>
									</button>
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
				</section>
			))}
		</div>
	);
}

type RoutesPanelProps = {
	branches: ResolvedTaleBranch[];
	onChoosePath: (path: ResolvedTalePath) => void;
	paths: ResolvedTalePath[];
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
	onChoosePath,
	paths,
	selectedBranchIds,
}: RoutesPanelProps): React.JSX.Element {
	return (
		<div className="space-y-3">
			{branches.map((branch) => {
				const selected =
					branch.position.isRootBranch || selectedBranchIds.includes(branch.id);
				const branchPaths = paths.filter(
					(path) =>
						path.fromBranchId === branch.id || path.toBranchId === branch.id,
				);
				return (
					<section
						key={branch.id}
						className={clsx(
							"rounded-md border p-3",
							selected
								? "border-[#d9b56f]/60 bg-[#d9b56f]/8"
								: "border-white/10 bg-white/[0.025]",
						)}
					>
						<div className="flex items-center gap-2">
							<Braces
								size={16}
								className={selected ? "text-[#d9b56f]" : "text-white/35"}
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate font-semibold text-sm text-white/84">
									{branch.title}
								</p>
								<p className="text-white/38 text-xs">
									{branch.counts.blocks} blocks ·{" "}
									{selected ? "active route" : "available route"}
								</p>
							</div>
						</div>
						{branchPaths.length > 0 ? (
							<div className="mt-2 space-y-1 border-white/8 border-l pl-3">
								{branchPaths.map((path) => (
									<button
										key={path.id}
										type="button"
										className="block w-full rounded px-1 py-0.5 text-left text-[11px] text-white/45 hover:bg-white/6 hover:text-white/75"
										onClick={() => onChoosePath(path)}
									>
										{path.label}
									</button>
								))}
							</div>
						) : null}
					</section>
				);
			})}
		</div>
	);
}
