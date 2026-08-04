"use client";

import clsx from "clsx";
import { ChevronDown, ListTree, PanelLeftClose, Route } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { useTaleAppStoreShallow } from "../../../contexts/TaleAppStoreContext";
import {
	useTaleReaderStore,
	useTaleReaderStoreShallow,
} from "../../../contexts/TaleReaderStoreContext";
import { useChooseReaderPath } from "../../../hooks/useChooseReaderPath";
import type { ReaderContentsPart } from "../../../types";
import { VerticalPaneResizeHandle } from "../../Layout/VerticalPaneResizeHandle";
import {
	ContentsTree,
	RoutesPanel,
} from "./ContentsNavigator/ContentsNavigatorPanels";

type NavigationTab = "contents" | "routes";

const emptyContents: ReaderContentsPart[] = [];

/**
 * Renders the reader contents and routes navigator as a left docked sidebar.
 *
 * @returns Contents launcher and docked navigation sidebar.
 *
 * @example
 * <ReaderContents />
 */
export function ReaderContents(): React.JSX.Element {
	const asideRef = useRef<HTMLElement | null>(null);
	const [activeTab, setActiveTab] = useState<NavigationTab>("contents");
	const [dragPanelWidthPx, setDragPanelWidthPx] = useState<number | null>(null);
	const [mobileHeightVh, setMobileHeightVh] = useState(70);
	const {
		compiled,
		contents,
		currentBlockId,
		currentBranchId,
		currentEntryId,
		hubOpen,
		open,
		panelWidthPx,
		scrollApi,
		selectedBranchIds,
		setPanelWidthPx,
		toggleHub,
		toggleOpen,
	} = useTaleReaderStoreShallow((state) => ({
		compiled: state.reader.compiled,
		contents: state.reader.compiled?.contents ?? emptyContents,
		currentBlockId: state.navigation.current?.blockId ?? null,
		currentBranchId: state.navigation.current?.branchId ?? null,
		currentEntryId: state.navigation.current?.entryId ?? null,
		hubOpen: state.hub.open,
		open: state.contents.open,
		panelWidthPx: state.contents.panelWidthPx,
		scrollApi: state.scroll.api,
		selectedBranchIds: state.navigation.selectedBranchIds,
		setPanelWidthPx: state.contents.setPanelWidthPx,
		toggleHub: state.hub.toggleOpen,
		toggleOpen: state.contents.toggleOpen,
	}));
	const { branches, paths } = useTaleAppStoreShallow((state) => ({
		branches: state.document.tale.structure.branches,
		paths: state.document.tale.structure.paths,
	}));
	const dockedContentsWidthPx = useTaleReaderStore(
		(state) => state.derived.dockedContentsWidthPx,
	);
	const layout = useTaleReaderStore((state) => state.derived.viewportLayout);
	const choosePath = useChooseReaderPath();
	const mobilePortrait = layout === "mobile-portrait";
	const mobileLandscape = layout === "mobile-landscape";
	const sidePanelWidthPx = mobilePortrait
		? null
		: mobileLandscape
			? panelWidthPx
			: dockedContentsWidthPx;
	const visiblePanelWidthPx = dragPanelWidthPx ?? sidePanelWidthPx;
	/**
	 * Opens Contents while closing Reader Hub first to avoid competing docked
	 * viewport insets.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * openContentsOnly();
	 */
	const openContentsOnly = (): void => {
		if (!open && hubOpen) toggleHub();
		toggleOpen();
	};

	/**
	 * Starts mobile bottom-sheet height dragging.
	 *
	 * @param event - Pointer event from the sheet header.
	 * @returns Nothing.
	 */
	const startMobileHeightDrag = (
		event: React.PointerEvent<HTMLElement>,
	): void => {
		if (!mobilePortrait) return;
		event.preventDefault();
		const updateHeight = (moveEvent: PointerEvent): void => {
			const nextHeight =
				((window.innerHeight - moveEvent.clientY) / window.innerHeight) * 100;
			setMobileHeightVh(Math.max(42, Math.min(92, nextHeight)));
		};
		const stopDrag = (): void => {
			window.removeEventListener("pointermove", updateHeight);
			window.removeEventListener("pointerup", stopDrag);
		};
		window.addEventListener("pointermove", updateHeight);
		window.addEventListener("pointerup", stopDrag);
	};

	/**
	 * Calculates the contents sidebar width for one pointer x-coordinate.
	 *
	 * @param clientX - Current pointer x-coordinate.
	 * @returns Clamped panel width in pixels.
	 *
	 * @example
	 * const width = getPanelWidthFromPointer(320);
	 */
	const getPanelWidthFromPointer = (clientX: number): number | null => {
		const bounds = asideRef.current?.parentElement?.getBoundingClientRect();
		if (!bounds) return null;
		const maximumWidth = Math.max(240, Math.floor(bounds.width * 0.5));
		const minimumWidth = Math.min(320, maximumWidth);
		const rawWidth = clientX - bounds.left;
		return Math.max(minimumWidth, Math.min(maximumWidth, rawWidth));
	};
	const reachableBlockIds = useMemo(
		() => new Set(compiled?.anchors.map((anchor) => anchor.block.id) ?? []),
		[compiled],
	);
	const reachableBranchIds = useMemo(
		() => new Set(compiled?.anchors.map((anchor) => anchor.branch.id) ?? []),
		[compiled],
	);

	/**
	 * Jumps to the selected contents block using the reader navigation API.
	 *
	 * @param blockId - Destination block identifier.
	 * @returns Nothing.
	 *
	 * @example
	 * navigateToContentsBlock("block-42");
	 */
	const navigateToContentsBlock = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId, { motion: "instant" });
	};

	/**
	 * Travels to the source block for one route choice.
	 *
	 * @param blockId - Choice source block identifier.
	 * @returns Nothing.
	 *
	 * @example
	 * travelToRouteBlock("block-9");
	 */
	const travelToRouteBlock = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId, { motion: "travel" });
	};

	return (
		<>
			{!open ? (
				<button
					data-reader-ui="true"
					data-reader-component="ReaderContents"
					data-reader-role="collapsed-handle"
					type="button"
					aria-label="Open story navigation"
					className="pointer-events-auto absolute top-4 left-4 z-45 hidden h-12 w-12 place-items-center rounded-lg border border-foreground/14 bg-background/90 text-foreground/78 opacity-70 shadow-2xl backdrop-blur-md transition-opacity duration-200 hover:text-foreground hover:opacity-100 md:grid"
					onClick={openContentsOnly}
				>
					<ListTree size={18} />
				</button>
			) : null}
			<AnimatePresence>
				{open ? (
					<motion.aside
						ref={asideRef}
						data-reader-ui="true"
						data-reader-component="ReaderContents"
						data-reader-role="contents-sidebar"
						className={clsx(
							"pointer-events-auto absolute z-80 flex flex-col border-foreground/12 bg-background/96 text-foreground shadow-2xl backdrop-blur-xl",
							mobilePortrait
								? "inset-x-0 bottom-0 h-[70dvh] w-full rounded-t-xl border-t"
								: "inset-y-0 left-0 max-w-[calc(100vw-1rem)] border-r",
						)}
						style={
							mobilePortrait
								? { height: `${mobileHeightVh}dvh` }
								: visiblePanelWidthPx === null
									? undefined
									: { width: `${visiblePanelWidthPx}px` }
						}
						initial={mobilePortrait ? { y: "100%" } : { x: "-100%" }}
						animate={mobilePortrait ? { y: 0 } : { x: 0 }}
						exit={mobilePortrait ? { y: "100%" } : { x: "-100%" }}
						transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
					>
						{!mobilePortrait ? (
							<div className="absolute inset-y-0 right-0 flex">
								<VerticalPaneResizeHandle
									label="Resize story navigation"
									onDrag={(clientX) => {
										const width = getPanelWidthFromPointer(clientX);
										if (width !== null) setDragPanelWidthPx(width);
									}}
									onDragEnd={(clientX) => {
										const width = getPanelWidthFromPointer(clientX);
										setDragPanelWidthPx(null);
										if (width !== null) setPanelWidthPx(width);
									}}
								/>
							</div>
						) : null}
						<header className="flex h-16 shrink-0 items-center gap-3 border-foreground/10 border-b px-4">
							<ListTree size={17} className="text-primary" />
							<div
								className={clsx(
									"min-w-0 flex-1",
									mobilePortrait && "cursor-row-resize touch-none",
								)}
								onPointerDown={startMobileHeightDrag}
							>
								<p className="font-semibold text-foreground/90 text-sm">
									Story Navigation
								</p>
								<p className="truncate text-[11px] text-foreground/40">
									Visible route only
								</p>
							</div>
							<button
								type="button"
								aria-label="Close story navigation"
								className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/48 hover:bg-foreground/7 hover:text-foreground"
								onClick={toggleOpen}
							>
								{mobilePortrait ? (
									<ChevronDown size={16} />
								) : (
									<PanelLeftClose size={16} />
								)}
							</button>
						</header>
						<div className="flex items-center gap-2 border-foreground/10 border-b px-3 py-2">
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
						<div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:none]">
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
									onChoosePath={choosePath}
									onTravelToBlock={travelToRouteBlock}
									paths={paths}
									reachableBlockIds={reachableBlockIds}
									reachableBranchIds={reachableBranchIds}
									selectedBranchIds={selectedBranchIds}
								/>
							)}
						</div>
					</motion.aside>
				) : null}
			</AnimatePresence>
		</>
	);
}

/**
 * Renders one navigation tab control.
 *
 * @param props - Tab state, label, icon, and click handler.
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
					? "border-primary/55 bg-primary/14 text-primary"
					: "border-foreground/10 bg-foreground/5 text-foreground/52 hover:text-foreground/78",
			)}
			onClick={onClick}
		>
			<Icon size={13} />
			{label}
		</button>
	);
}
