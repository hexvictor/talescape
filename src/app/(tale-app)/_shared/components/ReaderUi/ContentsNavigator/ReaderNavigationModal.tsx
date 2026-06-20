"use client";

import clsx from "clsx";
import { ListTree, Route, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useContentsNavigatorState } from "../../../hooks/store/useReaderNavigationSelectors";
import { useChooseReaderPath } from "../../../hooks/useChooseReaderPath";
import { useReaderHubLayout } from "../../../hooks/useReaderHubLayout";
import { ContentsTree, RoutesPanel } from "./ContentsNavigatorPanels";

type NavigationTab = "contents" | "routes";

/**
 * Renders a dedicated navigation launcher and modal separate from Reader Hub.
 *
 * @returns Navigation launcher and modal panel.
 *
 * @example
 * <ReaderNavigationModal />
 */
export function ReaderNavigationModal(): React.JSX.Element {
	const {
		branches,
		compiled,
		contents,
		currentBlockId,
		currentBranchId,
		currentEntryId,
		open,
		paths,
		scrollApi,
		selectedBranchIds,
		toggleContents,
	} = useContentsNavigatorState();
	const choosePath = useChooseReaderPath();
	const layout = useReaderHubLayout();
	const [activeTab, setActiveTab] = useState<NavigationTab>("contents");

	/**
	 * Teleports to selected contents and closes the navigation modal.
	 *
	 * @param blockId - Destination block id.
	 * @returns Nothing.
	 *
	 * @example
	 * travelToBlock("42");
	 */
	const navigateToContentsBlock = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId, { motion: "instant" });
		toggleContents();
	};
	/**
	 * Travels to a route choice without closing route navigation.
	 *
	 * @param blockId - Choice source block identifier.
	 * @returns Nothing.
	 */
	const travelToRouteBlock = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId, { motion: "travel" });
	};
	const chooseRoute = (path: Parameters<typeof choosePath>[0]): void => {
		choosePath(path);
	};

	const mobilePortrait = layout === "mobile-portrait";
	const reachableBlockIds = useMemo(
		() => new Set(compiled?.anchors.map((anchor) => anchor.block.id) ?? []),
		[compiled],
	);
	const reachableBranchIds = useMemo(
		() => new Set(compiled?.anchors.map((anchor) => anchor.branch.id) ?? []),
		[compiled],
	);

	return (
		<>
			<button
				data-reader-ui="true"
				data-reader-component="ReaderNavigationModal"
				data-reader-role="navigation-launcher"
				type="button"
				aria-label="Open story navigation"
				className="pointer-events-auto absolute top-4 right-20 z-45 grid h-12 w-12 place-items-center rounded-lg border border-white/12 bg-black/78 text-white/72 opacity-25 shadow-2xl backdrop-blur-md transition-opacity duration-200 hover:text-white hover:opacity-100"
				onClick={toggleContents}
			>
				<ListTree size={18} />
			</button>
			<AnimatePresence>
				{open ? (
					<motion.div
						data-reader-ui="true"
						data-reader-component="ReaderNavigationModal"
						data-reader-role="navigation-modal-backdrop"
						className="pointer-events-auto absolute inset-0 z-75 bg-black/42 backdrop-blur-[2px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={toggleContents}
					>
						<motion.section
							data-reader-component="ReaderNavigationModal"
							data-reader-role="navigation-modal"
							className={clsx(
								"absolute overflow-hidden rounded-xl border border-white/12 bg-[#090909]/96 shadow-2xl backdrop-blur-xl",
								mobilePortrait
									? "inset-x-3 top-16 bottom-6"
									: "top-16 right-4 bottom-6 w-[min(30rem,calc(100vw-2rem))]",
							)}
							initial={
								mobilePortrait ? { opacity: 0, y: 16 } : { opacity: 0, x: 16 }
							}
							animate={
								mobilePortrait ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }
							}
							exit={
								mobilePortrait ? { opacity: 0, y: 16 } : { opacity: 0, x: 16 }
							}
							transition={{ duration: 0.18 }}
							onClick={(event) => event.stopPropagation()}
						>
							<header className="flex items-center justify-between gap-3 border-white/10 border-b px-4 py-3">
								<div>
									<p className="font-semibold text-sm text-white/88">
										Story Navigation
									</p>
									<p className="text-[11px] text-white/38">
										Visible route only
									</p>
								</div>
								<button
									type="button"
									aria-label="Close navigation"
									className="grid h-9 w-9 place-items-center rounded border border-white/10 text-white/48 hover:bg-white/7 hover:text-white"
									onClick={toggleContents}
								>
									<X size={16} />
								</button>
							</header>
							<div className="flex items-center gap-2 border-white/10 border-b px-3 py-2">
								<NavigationTabButton
									active={activeTab === "contents"}
									icon={ListTree}
									label="Contents"
									onClick={() => setActiveTab("contents")}
								/>
								<NavigationTabButton
									active={activeTab === "routes"}
									icon={Route}
									label="Routes"
									onClick={() => setActiveTab("routes")}
								/>
							</div>
							<div className="h-[calc(100%-7.75rem)] overflow-y-auto p-3 [scrollbar-width:none]">
								{activeTab === "contents" ? (
									<ContentsTree
										contents={contents}
										currentBlockId={currentBlockId}
										currentEntryId={currentEntryId}
										onNavigate={navigateToContentsBlock}
									/>
								) : (
									<RoutesPanel
										branches={branches}
										currentBranchId={currentBranchId}
										onChoosePath={chooseRoute}
										onTravelToBlock={travelToRouteBlock}
										paths={paths}
										reachableBlockIds={reachableBlockIds}
										reachableBranchIds={reachableBranchIds}
										selectedBranchIds={selectedBranchIds}
									/>
								)}
							</div>
						</motion.section>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
}

/**
 * Renders one navigation-modal tab control.
 *
 * @param props - Tab label, icon, state, and click handler.
 * @returns One tab button.
 *
 * @example
 * <NavigationTabButton active icon={ListTree} label="Contents" onClick={open} />
 */
function NavigationTabButton({
	active,
	icon: Icon,
	label,
	onClick,
}: {
	active: boolean;
	icon: typeof ListTree;
	label: string;
	onClick: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			className={clsx(
				"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
				active
					? "border-[#d9b56f]/55 bg-[#d9b56f]/14 text-[#f1d296]"
					: "border-white/10 bg-white/5 text-white/52 hover:text-white/78",
			)}
			onClick={onClick}
		>
			<Icon size={13} />
			{label}
		</button>
	);
}
