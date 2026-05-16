"use client";

import { useState } from "react";
import { DebugCard, DebugField, DebugTabList } from "./DebugPrimitives";
import { formatIndex, yesNo } from "./debugFormatters";
import type { NavigationDebugData, NavigationDebugTab } from "./types";

const navigationTabs: { id: NavigationDebugTab; label: string }[] = [
	{ id: "tale", label: "Tale" },
	{ id: "block", label: "Block" },
	{ id: "branch", label: "Branch" },
	{ id: "section", label: "Section" },
	{ id: "part", label: "Part" },
	{ id: "entry", label: "Entry" },
	{ id: "page", label: "Page" },
	{ id: "path", label: "Path" },
];

export function NavigationDebugPanel({
	block,
	branch,
	entry,
	effectivePage,
	navigationContext,
	page,
	part,
	section,
	taleTitle,
}: NavigationDebugData) {
	const [activeTab, setActiveTab] = useState<NavigationDebugTab>("tale");

	return (
		<div className="-m-3 sm:-m-4">
			<DebugTabList
				activeTab={activeTab}
				onChange={setActiveTab}
				tabs={navigationTabs}
			/>

			<div className="p-3 sm:p-4">
				{activeTab === "tale" ? (
					<DebugCard title="Tale">
						<DebugField label="Title" value={taleTitle} />
						<DebugField
							label="Active Path Blocks"
							value={navigationContext?.block.total}
						/>
						<DebugField
							label="Current Block In Path"
							value={formatIndex(navigationContext?.block.index)}
						/>
						<DebugField
							label="Active Path Pages"
							value={navigationContext?.page.allPages.total}
						/>
						<DebugField
							label="Paginated Pages"
							value={navigationContext?.page.paginatedPages.total}
						/>
					</DebugCard>
				) : null}

				{activeTab === "block" ? (
					<DebugCard title="Block">
						<DebugField label="Id" value={block?.id} />
						<DebugField
							label="Global Index"
							value={formatIndex(block?.position.index)}
						/>
						<DebugField
							label="Path Index"
							value={formatIndex(navigationContext?.block.index)}
						/>
						<DebugField
							label="Page Block"
							value={yesNo(block?.position.isPageBlock)}
						/>
						<DebugField label="Snap" value={yesNo(block?.isSnap)} />
						<DebugField
							label="First In Tale"
							value={yesNo(block?.position.isFirst)}
						/>
						<DebugField
							label="Last In Tale"
							value={yesNo(block?.position.isLast)}
						/>
					</DebugCard>
				) : null}

				{activeTab === "branch" ? (
					<DebugCard title="Branch">
						<DebugField label="Id" value={branch?.id} />
						<DebugField label="Name" value={branch?.name} />
						<DebugField
							label="Index"
							value={formatIndex(branch?.position.index)}
						/>
						<DebugField
							label="Root Branch"
							value={yesNo(branch?.position.isRootBranch)}
						/>
						<DebugField
							label="Choice Branch"
							value={yesNo(branch?.position.isChoiceBranch)}
						/>
						<DebugField
							label="Active Path Index"
							value={formatIndex(navigationContext?.branch.index)}
						/>
						<DebugField
							label="First Branch In Path"
							value={yesNo(navigationContext?.branch.isFirst)}
						/>
						<DebugField
							label="Last Branch In Path"
							value={yesNo(navigationContext?.branch.isLast)}
						/>
					</DebugCard>
				) : null}

				{activeTab === "section" ? (
					<DebugCard title="Section">
						<DebugField label="Id" value={section?.id} />
						<DebugField
							label="Index"
							value={formatIndex(section?.position.index)}
						/>
						<DebugField label="Orientation" value={section?.orientation} />
						<DebugField label="Direction" value={section?.direction} />
						<DebugField
							label="Active Path Index"
							value={formatIndex(navigationContext?.section.index)}
						/>
						<DebugField
							label="First Section In Path"
							value={yesNo(navigationContext?.section.isFirst)}
						/>
						<DebugField
							label="Last Section In Path"
							value={yesNo(navigationContext?.section.isLast)}
						/>
					</DebugCard>
				) : null}

				{activeTab === "part" ? (
					<DebugCard title="Part">
						<DebugField label="Id" value={part?.id} />
						<DebugField
							label="Index"
							value={formatIndex(part?.position.index)}
						/>
						<DebugField
							label="Active Path Index"
							value={formatIndex(navigationContext?.part.index)}
						/>
						<DebugField
							label="First Part In Path"
							value={yesNo(navigationContext?.part.isFirst)}
						/>
						<DebugField
							label="Last Part In Path"
							value={yesNo(navigationContext?.part.isLast)}
						/>
					</DebugCard>
				) : null}

				{activeTab === "entry" ? (
					<DebugCard title="Entry">
						<DebugField label="Id" value={entry?.id} />
						<DebugField label="Title" value={entry?.title} />
						<DebugField
							label="Index"
							value={formatIndex(entry?.position.index)}
						/>
						<DebugField
							label="Entry Number"
							value={entry?.position.entryNumber}
						/>
						<DebugField
							label="Active Path Index"
							value={formatIndex(navigationContext?.entry.index)}
						/>
						<DebugField
							label="First Entry In Path"
							value={yesNo(navigationContext?.entry.isFirst)}
						/>
						<DebugField
							label="Last Entry In Path"
							value={yesNo(navigationContext?.entry.isLast)}
						/>
					</DebugCard>
				) : null}

				{activeTab === "page" ? (
					<DebugCard title="Page">
						<DebugField label="Direct Page Id" value={page?.id} />
						<DebugField label="Effective Page Id" value={effectivePage?.id} />
						<DebugField label="Type" value={effectivePage?.type} />
						<DebugField
							label="Paginated"
							value={yesNo(effectivePage?.isPaginated)}
						/>
						<DebugField
							label="All Page Index"
							value={formatIndex(navigationContext?.page.allPages.index)}
						/>
						<DebugField
							label="All Pages Count"
							value={navigationContext?.page.allPages.total}
						/>
						<DebugField
							label="Paginated Page Index"
							value={formatIndex(navigationContext?.page.paginatedPages.index)}
						/>
						<DebugField
							label="Paginated Pages Count"
							value={navigationContext?.page.paginatedPages.total}
						/>
						<DebugField
							label="Schema Page Number"
							value={effectivePage?.position.pageNumber}
						/>
						<DebugField
							label="Schema Global Page"
							value={effectivePage?.position.globalPageNumber}
						/>
					</DebugCard>
				) : null}

				{activeTab === "path" ? (
					<div className="grid gap-3">
						{navigationContext?.paths.length ? (
							navigationContext.paths.map((pathContext) => (
								<DebugCard
									key={pathContext.path.id}
									title={`Path #${pathContext.path.id}`}
								>
									<DebugField label="Type" value={pathContext.path.type} />
									<DebugField label="Label" value={pathContext.path.label} />
									<DebugField
										label="From Branch"
										value={`${pathContext.fromBranch.position.index != null ? pathContext.fromBranch.position.index + 1 : "-"} / ${pathContext.fromBranch.position.total} (#${pathContext.fromBranch.id}) ${pathContext.fromBranch.name}`}
									/>
									<DebugField
										label="To Branch"
										value={`${pathContext.toBranch.position.index != null ? pathContext.toBranch.position.index + 1 : "-"} / ${pathContext.toBranch.position.total} (#${pathContext.toBranch.id}) ${pathContext.toBranch.name}`}
									/>
								</DebugCard>
							))
						) : (
							<DebugCard title="Path">
								<DebugField
									label="Current Block"
									value="No outgoing path here"
								/>
							</DebugCard>
						)}
					</div>
				) : null}
			</div>
		</div>
	);
}
