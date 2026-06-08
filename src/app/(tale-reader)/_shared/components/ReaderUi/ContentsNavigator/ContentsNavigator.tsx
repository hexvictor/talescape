"use client";

import clsx from "clsx";
import { BookOpen, PanelLeftClose, Pin, PinOff, Route } from "lucide-react";
import { useState } from "react";
import { useContentsNavigatorState } from "../../../hooks/store/useReaderNavigationSelectors";
import { useChooseReaderPath } from "../../../hooks/useChooseReaderPath";
import { ContentsTree, RoutesPanel } from "./ContentsNavigatorPanels";

type ContentsTab = "contents" | "routes";

/**
 * Renders the route-aware contents drawer and story route overview.
 *
 * @returns The contents navigator.
 *
 * @example
 * <ContentsNavigator />
 */
export function ContentsNavigator(): React.JSX.Element {
	const {
		branches,
		contents,
		currentBlockId,
		currentEntryId,
		open,
		paths,
		scrollApi,
		selectedBranchIds,
		toggleContents,
	} = useContentsNavigatorState();
	const [hovered, setHovered] = useState(false);
	const [tab, setTab] = useState<ContentsTab>("contents");
	const visible = open || hovered;
	const choosePath = useChooseReaderPath();

	/**
	 * Navigates to a visible block.
	 *
	 * @param blockId - Destination block identifier.
	 * @returns Nothing.
	 */
	const navigate = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId);
	};

	return (
		<aside
			data-reader-ui="true"
			className="pointer-events-auto absolute top-20 right-4 z-40"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{visible ? (
				<div className="flex max-h-[calc(100vh-2rem)] w-[min(28rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-white/12 bg-black/90 shadow-2xl backdrop-blur-md">
					<header className="flex items-start justify-between border-white/10 border-b px-4 py-3">
						<div>
							<h2 className="font-bold text-lg text-white">Contents</h2>
							<p className="text-white/42 text-xs">
								Current visible story route
							</p>
						</div>
						<button
							type="button"
							aria-label={open ? "Unpin contents" : "Pin contents"}
							className="grid h-8 w-8 place-items-center rounded text-white/55 hover:bg-white/8 hover:text-white"
							onClick={toggleContents}
						>
							{open ? <Pin size={15} /> : <PinOff size={15} />}
						</button>
					</header>
					<div className="grid grid-cols-2 border-white/10 border-b p-1.5">
						<TabButton
							active={tab === "contents"}
							icon={BookOpen}
							label="Contents"
							onClick={() => setTab("contents")}
						/>
						<TabButton
							active={tab === "routes"}
							icon={Route}
							label="Routes"
							onClick={() => setTab("routes")}
						/>
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:none]">
						{tab === "contents" ? (
							<ContentsTree
								contents={contents}
								currentBlockId={currentBlockId}
								currentEntryId={currentEntryId}
								onNavigate={navigate}
							/>
						) : (
							<RoutesPanel
								branches={branches}
								onChoosePath={choosePath}
								paths={paths}
								selectedBranchIds={selectedBranchIds}
							/>
						)}
					</div>
				</div>
			) : (
				<button
					type="button"
					aria-label="Open contents"
					className="grid h-12 w-12 place-items-center rounded-lg border border-white/12 bg-black/72 text-white/66 shadow-2xl backdrop-blur-md hover:text-white"
					onClick={toggleContents}
				>
					<PanelLeftClose size={18} />
				</button>
			)}
		</aside>
	);
}

type TabButtonProps = {
	active: boolean;
	icon: typeof BookOpen;
	label: string;
	onClick: () => void;
};

/**
 * Renders a contents drawer tab.
 *
 * @param props - Tab state and selection callback.
 * @returns A contents tab button.
 */
function TabButton({
	active,
	icon: Icon,
	label,
	onClick,
}: TabButtonProps): React.JSX.Element {
	return (
		<button
			type="button"
			className={clsx(
				"flex items-center justify-center gap-2 rounded px-3 py-2 text-xs",
				active ? "bg-white/10 text-white" : "text-white/42 hover:text-white/72",
			)}
			onClick={onClick}
		>
			<Icon size={14} />
			{label}
		</button>
	);
}
