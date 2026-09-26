import Link from "next/link";
import type { ReactNode } from "react";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import cn from "~/lib/utils/cn";
import {
	getLibraryBlocks,
	getLibraryBranches,
	getLibraryFragments,
} from "~/server/db/data/library/queries";
import {
	BlocksPanel,
	BranchesPanel,
	FragmentsPanel,
} from "../../_shared/components/LibraryNodePanels";

type NodeTab = "branches" | "scenes" | "elements";

type LibraryNodesPageProps = {
	searchParams?: Promise<{
		tab?: string;
	}>;
};

const nodeTabs = [
	{ key: "branches", label: "Branches" },
	{ key: "scenes", label: "Scenes" },
	{ key: "elements", label: "Elements" },
] as const;

export default async function LibraryNodesPage({
	searchParams,
}: LibraryNodesPageProps) {
	const params = await searchParams;
	const activeTab = getNodeTab(params?.tab);
	const counts = await getNodeCounts();

	return (
		<div className="grid gap-5">
			<ComicPanel accent="secondary" className="p-5" shape="corners-right">
				<ComicRail accent="secondary">Story nodes</ComicRail>
				<p className="mt-1 text-muted-foreground text-sm">
					Branches, scenes, and elements visible from the library.
				</p>
				<nav
					aria-label="Node types"
					className="scrollbar-none mt-4 overflow-x-auto"
				>
					<div className="flex min-w-max gap-2">
						{nodeTabs.map((tab) => {
							const isActive = activeTab === tab.key;

							return (
								<Link
									key={tab.key}
									href={`/library/frames?tab=${tab.key}`}
									aria-current={isActive ? "page" : undefined}
									className={cn(
										"inline-flex h-9 items-center gap-2 border-2 border-transparent px-3 font-black text-xs uppercase transition-colors",
										isActive
											? "border-foreground bg-primary text-primary-foreground"
											: "text-muted-foreground hover:border-foreground hover:bg-secondary hover:text-secondary-foreground",
									)}
								>
									{tab.label}
									<span
										className={cn(
											"border border-current px-1.5 py-0.5 text-xs",
											isActive ? "bg-primary-foreground/15" : "bg-muted",
										)}
									>
										{counts[tab.key]}
									</span>
								</Link>
							);
						})}
					</div>
				</nav>
			</ComicPanel>

			<NodeTabPanel activeTab={activeTab} />
		</div>
	);
}

async function NodeTabPanel({ activeTab }: { activeTab: NodeTab }) {
	if (activeTab === "branches") {
		const branches = await getLibraryBranches();

		return (
			<NodeShelf title="Branches" count={branches.length}>
				<BranchesPanel branches={branches} />
			</NodeShelf>
		);
	}

	if (activeTab === "scenes") {
		const scenes = await getLibraryBlocks();

		return (
			<NodeShelf title="Scenes" count={scenes.length}>
				<BlocksPanel scenes={scenes} />
			</NodeShelf>
		);
	}

	const elements = await getLibraryFragments();

	return (
		<NodeShelf title="Elements" count={elements.length}>
			<FragmentsPanel elements={elements} />
		</NodeShelf>
	);
}

async function getNodeCounts() {
	const [branches, scenes, elements] = await Promise.all([
		getLibraryBranches(),
		getLibraryBlocks(),
		getLibraryFragments(),
	]);

	return {
		branches: branches.length,
		scenes: scenes.length,
		elements: elements.length,
	};
}

function NodeShelf({
	title,
	count,
	children,
}: {
	title: string;
	count: number;
	children: ReactNode;
}) {
	return (
		<section className="grid gap-3">
			<div className="flex items-center justify-between gap-3">
				<h3 className="font-semibold">{title}</h3>
				<p className="text-muted-foreground text-sm">{count}</p>
			</div>
			{children}
		</section>
	);
}

function getNodeTab(value: string | undefined): NodeTab {
	if (value === "branches" || value === "scenes" || value === "elements") {
		return value;
	}

	return "branches";
}
