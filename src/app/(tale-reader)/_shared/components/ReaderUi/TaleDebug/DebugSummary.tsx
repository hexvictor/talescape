"use client";

import type React from "react";
import { useReaderStore } from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import type {
	NavigationEntityPosition,
	NavigationPagePosition,
} from "~/app/(tale-reader)/_shared/store/types/navigation";
import { Chip, DebugField, DebugHeading } from "./DebugPrimitives";
import { round } from "./debugFormatters";
import type { SummaryDebugData } from "./types";

export function DebugSummary({
	block,
	branch,
	entry,
	effectivePage,
	navigationContext,
	page,
	part,
	section,
}: SummaryDebugData) {
	const scrollState = useReaderStore((s) => s.debug.scroll);
	const pageType = effectivePage?.type ?? page?.type ?? null;

	return (
		<div className="space-y-3 p-3 text-xs">
			<SummaryBadges
				block={block}
				effectivePage={effectivePage}
				navigationContext={navigationContext}
				pageType={pageType}
				section={section}
			/>
			<SummaryMetrics
				block={block}
				branch={branch}
				effectivePage={effectivePage}
				entry={entry}
				navigationContext={navigationContext}
				page={page}
				part={part}
				section={section}
				scrollProgress={scrollState.progress}
				scrollPx={scrollState.scrollPx}
				scrollMaxPx={scrollState.maxPx}
			/>
		</div>
	);
}

export function SummaryMetrics({
	block,
	branch,
	effectivePage,
	entry,
	navigationContext,
	page,
	part,
	scrollMaxPx,
	scrollProgress,
	scrollPx,
	section,
}: SummaryDebugData & {
	scrollMaxPx: number;
	scrollProgress: number;
	scrollPx: number;
}) {
	return (
		<div className="grid grid-cols-2 gap-2">
			<DebugField
				description="Current reader scroll compared with the maximum virtual scroll."
				label="Scroll"
				value={`${round(scrollPx)}px / ${round(scrollMaxPx)}px`}
			/>
			<DebugField
				description="Position inside the current block based on the navigation context."
				label="Block Progress"
				value={formatPercent(getPositionProgress(navigationContext?.block))}
			/>
			<DebugField
				description="Reader progress through the narrative page sequence."
				label="Narrative Progress"
				value={formatNarrativeProgress(navigationContext?.page)}
			/>
			<DebugField
				description="Raw scroll progress from top to bottom of the scroll engine."
				label="Scroll Progress"
				value={`${round(scrollProgress * 100)}%`}
			/>
		</div>
	);
}

export function DebugPeekBadges({
	block,
	navigationContext,
}: {
	block: SummaryDebugData["block"];
	navigationContext: SummaryDebugData["navigationContext"];
}) {
	return (
		<div className="flex max-w-[min(82vw,28rem)] flex-wrap gap-1.5">
			<Chip tone="sky">Block {formatNumber(navigationContext?.block)}</Chip>
			<Chip tone="zinc">#{block?.id ?? "-"}</Chip>
			<Chip tone={block?.isSnap ? "amber" : "zinc"}>
				{block?.isSnap ? "Snap on" : "Snap off"}
			</Chip>
		</div>
	);
}

export function SummaryBadges({
	block,
	effectivePage,
	navigationContext,
	pageType,
	section,
}: {
	block: SummaryDebugData["block"];
	effectivePage: SummaryDebugData["effectivePage"];
	navigationContext: SummaryDebugData["navigationContext"];
	pageType?: string | null;
	section: SummaryDebugData["section"];
}) {
	return (
		<div className="space-y-3">
			<BadgeGroup title={formatGroupTitle("Block", navigationContext?.block)}>
				<Chip tone="sky">Block {formatNumber(navigationContext?.block)}</Chip>
				<Chip tone="zinc">#{block?.id ?? "-"}</Chip>
				<Chip tone={block?.isSnap ? "amber" : "zinc"}>
					{block?.isSnap ? "Snap on" : "Snap off"}
				</Chip>
				<Chip tone="rose">
					{block?.position.isPageBlock ? "Paginated Block" : "Not Paginated"}
				</Chip>
				{isChoicePoint(block) ? <Chip tone="sky">Branch choice</Chip> : null}
				<BoundaryGroup label="First in">
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isFirstInTale}
						tone="tale"
					>
						Tale
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isFirstInBranch}
						tone="branch"
					>
						Branch
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isFirstInSection}
						tone="section"
					>
						Section
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isFirstInPart}
						tone="part"
					>
						Part
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isFirstInEntry}
						tone="entry"
					>
						Entry
					</SummaryBadge>
				</BoundaryGroup>
				<BoundaryGroup label="Last in">
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isLastInTale}
						tone="tale"
					>
						Tale
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isLastInBranch}
						tone="branch"
					>
						Branch
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isLastInSection}
						tone="section"
					>
						Section
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isLastInPart}
						tone="part"
					>
						Part
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.blockBoundaries.isLastInEntry}
						tone="entry"
					>
						Entry
					</SummaryBadge>
				</BoundaryGroup>
			</BadgeGroup>

			<BadgeGroup title={formatGroupTitle("Branch", navigationContext?.branch)}>
				<Chip tone="blue">
					Branch {formatNumber(navigationContext?.branch)}
				</Chip>
				<Chip tone="zinc">#{block?.branch.id ?? "-"}</Chip>
				{block?.branch.name ? (
					<Chip tone="blue">Title: {block.branch.name}</Chip>
				) : null}
			</BadgeGroup>

			<BadgeGroup
				title={formatGroupTitle("Section", navigationContext?.section)}
			>
				<Chip tone="emerald">
					Section {formatNumber(navigationContext?.section)}
				</Chip>
				<Chip tone="zinc">#{section?.id ?? "-"}</Chip>
				<BoundaryGroup label="Layout">
					<SummaryBadge active={!!section?.orientation} tone="section">
						Orientation: {section?.orientation}
					</SummaryBadge>
					<SummaryBadge active={!!section?.direction} tone="section">
						Direction: {section?.direction}
					</SummaryBadge>
				</BoundaryGroup>
				<BoundaryGroup label="Inputs">
					{section?.inputMode?.map((mode) => (
						<SummaryBadge key={mode} active tone="section">
							{mode}
						</SummaryBadge>
					))}
				</BoundaryGroup>
			</BadgeGroup>

			<BadgeGroup title={formatGroupTitle("Part", navigationContext?.part)}>
				<Chip tone="violet">Part {formatNumber(navigationContext?.part)}</Chip>
				<Chip tone="zinc">#{block?.part.id ?? "-"}</Chip>
				{block?.part.title ? (
					<Chip tone="violet">Title: {block.part.title}</Chip>
				) : null}
			</BadgeGroup>

			<BadgeGroup title={formatGroupTitle("Entry", navigationContext?.entry)}>
				<Chip tone="fuchsia">
					Entry {formatNumber(navigationContext?.entry)}
				</Chip>
				<Chip tone="zinc">#{block?.entry.id ?? "-"}</Chip>
				{block?.entry.title ? (
					<Chip tone="fuchsia">Title: {block.entry.title}</Chip>
				) : null}
				{block?.entry.type ? (
					<Chip tone="fuchsia">Type: {block.entry.type}</Chip>
				) : null}
			</BadgeGroup>

			<BadgeGroup
				title={formatGroupTitle("Page", navigationContext?.page.paginatedPages)}
				subtitle={`Unpaginated-aware (${formatPositionOnly(navigationContext?.page.allPages)})`}
			>
				<Chip tone="rose">
					Page {formatNumber(navigationContext?.page.paginatedPages)}
				</Chip>
				<Chip tone="zinc">#{effectivePage?.id ?? "-"}</Chip>
				{pageType ? <Chip tone="rose">Type: {pageType}</Chip> : null}
				<Chip tone={effectivePage?.isPaginated ? "rose" : "zinc"}>
					{effectivePage?.isPaginated ? "Paginated" : "Unpaginated"}
				</Chip>
			</BadgeGroup>

			{navigationContext?.paths.length ? (
				<BadgeGroup title="Path">
					{navigationContext.paths.map((pathContext) => (
						<details
							key={pathContext.path.id}
							className="rounded-xl border border-white/10 bg-black/20 p-2"
						>
							<summary className="cursor-pointer font-semibold text-[10px] text-white/70 uppercase tracking-wide">
								{pathContext.direction} path #{pathContext.path.id}
							</summary>
							<div className="mt-2 flex flex-wrap gap-1">
								<Chip tone="sky">#{pathContext.path.id}</Chip>
								<Chip tone="sky">Type: {pathContext.path.type}</Chip>
								{pathContext.path.label ? (
									<Chip tone="sky">Title: {pathContext.path.label}</Chip>
								) : null}
								<BoundaryGroup label="From">
									<SummaryBadge active tone="branch">
										{formatNumber(pathContext.fromBranch.position)}
									</SummaryBadge>
									<SummaryBadge active tone="branch">
										#{pathContext.fromBranch.id}
									</SummaryBadge>
									<SummaryBadge active tone="branch">
										{pathContext.fromBranch.name}
									</SummaryBadge>
								</BoundaryGroup>
								<BoundaryGroup label="To">
									<SummaryBadge active tone="branch">
										{formatNumber(pathContext.toBranch.position)}
									</SummaryBadge>
									<SummaryBadge active tone="branch">
										#{pathContext.toBranch.id}
									</SummaryBadge>
									<SummaryBadge active tone="branch">
										{pathContext.toBranch.name}
									</SummaryBadge>
								</BoundaryGroup>
							</div>
						</details>
					))}
				</BadgeGroup>
			) : null}

			<BadgeGroup title="Structure Boundaries">
				<BoundaryGroup label="First">
					<SummaryBadge
						active={navigationContext?.branch.isFirst}
						tone="branch"
					>
						Branch
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.section.isFirst}
						tone="section"
					>
						Section
					</SummaryBadge>
					<SummaryBadge active={navigationContext?.part.isFirst} tone="part">
						Part
					</SummaryBadge>
					<SummaryBadge active={navigationContext?.entry.isFirst} tone="entry">
						Entry
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.page.allPages.isFirst}
						tone="page"
					>
						Page
					</SummaryBadge>
				</BoundaryGroup>
				<BoundaryGroup label="Last">
					<SummaryBadge active={navigationContext?.branch.isLast} tone="branch">
						Branch
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.section.isLast}
						tone="section"
					>
						Section
					</SummaryBadge>
					<SummaryBadge active={navigationContext?.part.isLast} tone="part">
						Part
					</SummaryBadge>
					<SummaryBadge active={navigationContext?.entry.isLast} tone="entry">
						Entry
					</SummaryBadge>
					<SummaryBadge
						active={navigationContext?.page.allPages.isLast}
						tone="page"
					>
						Page
					</SummaryBadge>
				</BoundaryGroup>
			</BadgeGroup>
		</div>
	);
}

function formatNumber(position: NavigationEntityPosition | null | undefined) {
	if (!position || position.index == null) return "-";
	return String(position.index + 1);
}

function formatPositionOnly(
	position: NavigationEntityPosition | null | undefined,
) {
	if (!position || position.index == null) return `-/${position?.total ?? 0}`;
	return `${position.index + 1}/${position.total}`;
}

function formatGroupTitle(
	label: string,
	position: NavigationEntityPosition | null | undefined,
) {
	return `${label} (${formatNumber(position)}/${position?.total ?? 0})`;
}

function isChoicePoint(block: SummaryDebugData["block"]) {
	return (
		!!block &&
		block.position.isLastInBranch &&
		block.branch.position.isChoiceBranch &&
		block.branch.links.outgoingPathIds.length > 0
	);
}

function getPositionProgress(
	position: NavigationEntityPosition | null | undefined,
) {
	if (!position || position.index == null || position.total <= 0) return null;
	return (position.index + 1) / position.total;
}

function formatNarrativeProgress(
	pagePosition: NavigationPagePosition | null | undefined,
) {
	const paginated = getPositionProgress(pagePosition?.paginatedPages);
	if (paginated != null) return formatPercent(paginated);
	return formatPercent(getPositionProgress(pagePosition?.allPages));
}

function formatPercent(value: number | null) {
	if (value == null) return "-";
	return `${round(value * 100)}%`;
}

function BadgeGroup({
	children,
	subtitle,
	title,
}: {
	children: React.ReactNode;
	subtitle?: string;
	title: string;
}) {
	return (
		<div className="space-y-1">
			<div title={subtitle ? `${title}: ${subtitle}` : title}>
				<DebugHeading
					label={title}
					description={subtitle ?? "Navigation context group."}
				/>
				{subtitle ? (
					<p className="font-semibold text-[10px] text-white/25 uppercase tracking-wide">
						{subtitle}
					</p>
				) : null}
			</div>
			<div className="flex flex-wrap gap-1.5">{children}</div>
		</div>
	);
}

function BoundaryGroup({
	children,
	label,
}: {
	children: React.ReactNode;
	label: string;
}) {
	return (
		<span
			className="flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2 py-1"
			title={label}
		>
			<span className="font-semibold text-[10px] text-white/45 uppercase tracking-wide">
				{label}
			</span>
			<span className="flex flex-wrap gap-1">{children}</span>
		</span>
	);
}

function SummaryBadge({
	active,
	children,
	tone = "default",
}: {
	active: boolean | null | undefined;
	children: React.ReactNode;
	tone?: "branch" | "default" | "entry" | "page" | "part" | "section" | "tale";
}) {
	if (active == null) return null;

	const activeClass = {
		branch: "border-blue-300/45 bg-blue-400/15 text-blue-100",
		default: "border-sky-300/45 bg-sky-400/15 text-sky-100",
		entry: "border-fuchsia-300/45 bg-fuchsia-400/15 text-fuchsia-100",
		page: "border-rose-300/45 bg-rose-400/15 text-rose-100",
		part: "border-violet-300/45 bg-violet-400/15 text-violet-100",
		section: "border-emerald-300/45 bg-emerald-400/15 text-emerald-100",
		tale: "border-amber-300/45 bg-amber-400/15 text-amber-100",
	}[tone];

	return (
		<span
			className={
				active
					? `rounded-full border px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wide ${activeClass}`
					: "rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-semibold text-[10px] text-white/35 uppercase tracking-wide"
			}
		>
			{children}
		</span>
	);
}
