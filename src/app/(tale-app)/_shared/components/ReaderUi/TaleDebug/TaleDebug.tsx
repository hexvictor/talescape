"use client";

import {
	Activity,
	Bug,
	Crosshair,
	ListTree,
	Map as MapIcon,
	Route,
	X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import { useReaderViewportContext } from "../../../contexts/ReaderViewportContext";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import {
	useTaleReaderStore,
	useTaleReaderStoreShallow,
} from "../../../contexts/TaleReaderStoreContext";
import { useTaleRenderSlots } from "../../../contexts/TaleRenderContext";
import { useTaleDebugState } from "../../../hooks/store/useReaderDebugSelectors";
import { useReaderLocationContext } from "../../../hooks/useReaderLocationContext";
import { getReaderPageLabel } from "../../../services/readerPageLabels";
import { DebugLocationDetails } from "./DebugLocationDetails";
import { DebugTabs } from "./DebugPrimitives";
import { GlobalSnapControls } from "./GlobalSnapControls";
import {
	AnchorsPanel,
	NavigationPanel,
	ProgressPanel,
	SegmentsPanel,
	SummaryPanel,
} from "./panels/DebugPanels";

type DebugTab = "anchors" | "navigation" | "progress" | "segments" | "summary";

const coreTabs: { id: DebugTab; label: string }[] = [
	{ id: "summary", label: "Summary" },
	{ id: "navigation", label: "Navigation" },
	{ id: "progress", label: "Progress" },
	{ id: "segments", label: "Segments" },
	{ id: "anchors", label: "Anchors" },
];

/**
 * Renders diagnostics only while reader debug visibility is enabled.
 *
 * @returns Null while hidden or the active diagnostics panel.
 *
 * @example
 * <TaleDebug />
 */
export function TaleDebug(): React.JSX.Element | null {
	const visible = useTaleReaderStoreShallow(
		(state) => state.ui.visibilityMode === "all" && state.ui.debugVisible,
	);

	if (!visible) return null;

	return <TaleDebugContent />;
}

/**
 * Renders the active reader diagnostics panel and compact debug launcher.
 *
 * @returns Compact debug launcher or the expanded diagnostics panel.
 *
 * @example
 * <TaleDebugContent />
 */
function TaleDebugContent(): React.JSX.Element {
	const { viewport } = useReaderViewportContext();
	const { block, branch, entry, location, page, part } =
		useReaderLocationContext();
	const {
		activeSegmentIndex,
		compiled,
		open,
		phase,
		seenBlocks,
		taleTitle,
		toggleDebug,
	} = useTaleDebugState();
	const tale = useTaleAppStore((state) => state.document.tale);
	const isStudio = useTaleAppStore((state) => state.derived.isStudio);
	const { DebugHeaderActions } = useTaleRenderSlots();
	const readerStatusVisible = useTaleReaderStore(
		(state) => state.ui.readerStatusVisible,
	);
	const reduceInactiveUiOpacity = useTaleReaderStore(
		(state) => state.ui.reduceInactiveUiOpacity,
	);
	const layout = useTaleReaderStore((state) => state.derived.viewportLayout);
	const [activeTab, setActiveTab] = useState<DebugTab>("summary");
	const [mobileHeightPercent, setMobileHeightPercent] = useState(70);
	const [desktopBounds, setDesktopBounds] = useState({
		height: 620,
		left: 16,
		top: 16,
		width: 608,
	});
	const mobile = layout !== "desktop";
	const desktopPanelWidth = Math.min(
		desktopBounds.width,
		Math.max(1, viewport.width - 16),
	);
	const desktopPanelHeight = Math.min(
		desktopBounds.height,
		Math.max(1, viewport.height - 16),
	);
	const desktopPanelLeft = Math.max(
		8,
		Math.min(viewport.width - desktopPanelWidth - 8, desktopBounds.left),
	);
	const desktopPanelTop = Math.max(
		8,
		Math.min(viewport.height - desktopPanelHeight - 8, desktopBounds.top),
	);
	const debugTabs = coreTabs.map((tab) => ({
		...tab,
		icon: getDebugTabIcon(tab.id),
	}));

	const currentPage = compiled?.pages.find(
		(item) => item.id === location?.pageId,
	);
	const currentKeyframe = location
		? tale.indexMap.keyframesById[location.keyframeId]
		: undefined;
	const currentScene = location
		? tale.indexMap.scenesById[location.sceneId]
		: undefined;
	const frameKeyframeIds =
		currentScene?.keyframeIds.filter(
			(keyframeId) => tale.indexMap.keyframesById[keyframeId]?.frameId !== null,
		) ?? [];
	const currentFrameNumber = currentKeyframe?.frameId
		? frameKeyframeIds.indexOf(currentKeyframe.id) + 1
		: 0;
	const currentPageLabel = page
		? getReaderPageLabel(page, currentPage?.number ?? null)
		: undefined;

	if (!open) {
		return (
			<button
				data-reader-ui="true"
				data-reader-component="TaleDebug"
				data-reader-role="compact-debug-status"
				type="button"
				aria-label="Open reader debug"
				className={cn(
					"group/debug pointer-events-auto absolute right-2 z-[70] flex min-h-12 max-w-[min(34rem,calc(100vw-2rem))] items-center gap-2 border-2 border-foreground bg-card px-3 py-2 text-left text-primary shadow-[4px_4px_0_var(--secondary)] transition-all duration-200 md:z-40",
					reduceInactiveUiOpacity
						? "opacity-25 hover:opacity-100"
						: "opacity-100",
					readerStatusVisible ? "bottom-12" : "bottom-2",
				)}
				onClick={toggleDebug}
			>
				<Bug size={18} />
				<span className="hidden min-w-0 sm:block">
					<span className="block truncate font-semibold text-[11px] text-foreground/78">
						{currentFrameNumber > 0
							? `Frame ${currentFrameNumber}: ${currentKeyframe?.title ?? currentKeyframe?.id}`
							: `Scene ${block?.title ?? taleTitle}`}
					</span>
					<span className="block max-h-0 truncate text-[10px] text-foreground/42 opacity-0 transition-all group-hover/debug:max-h-6 group-hover/debug:opacity-100">
						{currentPageLabel ?? page?.type ?? "No page"} ·{" "}
						{entry?.title ?? "No entry"}
					</span>
					<span className="block max-h-0 overflow-hidden opacity-0 transition-all group-hover/debug:max-h-24 group-hover/debug:opacity-100">
						<DebugLocationDetails
							compiled={compiled}
							location={location}
							tale={tale}
						/>
					</span>
				</span>
			</button>
		);
	}

	/**
	 * Starts mobile debug bottom-sheet height dragging.
	 *
	 * @param event - Pointer event from the debug header.
	 * @returns Nothing.
	 */
	const startMobileHeightDrag = (
		event: React.PointerEvent<HTMLElement>,
	): void => {
		if (!mobile) return;
		event.preventDefault();
		const containerBounds = event.currentTarget
			.closest("[data-reader-role='debug-panel']")
			?.parentElement?.getBoundingClientRect();
		const updateHeight = (moveEvent: PointerEvent): void => {
			if (!containerBounds) return;
			const relativeY = moveEvent.clientY - containerBounds.top;
			const nextHeight =
				((containerBounds.height - relativeY) / containerBounds.height) * 100;
			setMobileHeightPercent(Math.max(42, Math.min(92, nextHeight)));
		};
		const stopDrag = (): void => {
			window.removeEventListener("pointermove", updateHeight);
			window.removeEventListener("pointerup", stopDrag);
		};
		window.addEventListener("pointermove", updateHeight);
		window.addEventListener("pointerup", stopDrag);
	};

	/**
	 * Starts desktop debug panel dragging.
	 *
	 * @param event - Pointer event from the debug header.
	 * @returns Nothing.
	 */
	const startDesktopDrag = (event: React.PointerEvent<HTMLElement>): void => {
		if (mobile) return;
		event.preventDefault();
		const startX = event.clientX;
		const startY = event.clientY;
		const startBounds = desktopBounds;
		const updatePosition = (moveEvent: PointerEvent): void => {
			setDesktopBounds({
				...startBounds,
				left: Math.max(
					8,
					Math.min(
						viewport.width - desktopPanelWidth - 8,
						startBounds.left + moveEvent.clientX - startX,
					),
				),
				top: Math.max(
					8,
					Math.min(
						viewport.height - desktopPanelHeight - 8,
						startBounds.top + moveEvent.clientY - startY,
					),
				),
			});
		};
		const stopDrag = (): void => {
			window.removeEventListener("pointermove", updatePosition);
			window.removeEventListener("pointerup", stopDrag);
		};
		window.addEventListener("pointermove", updatePosition);
		window.addEventListener("pointerup", stopDrag);
	};

	/**
	 * Starts desktop debug panel resizing.
	 *
	 * @param event - Pointer event from the resize handle.
	 * @returns Nothing.
	 */
	const startDesktopResize = (event: React.PointerEvent<HTMLButtonElement>) => {
		if (mobile) return;
		event.preventDefault();
		const startX = event.clientX;
		const startY = event.clientY;
		const startBounds = desktopBounds;
		const maximumHeight = Math.max(1, viewport.height - desktopPanelTop - 8);
		const maximumWidth = Math.max(1, viewport.width - desktopPanelLeft - 8);
		const updateSize = (moveEvent: PointerEvent): void => {
			setDesktopBounds({
				...startBounds,
				height: Math.max(
					Math.min(320, maximumHeight),
					Math.min(
						maximumHeight,
						startBounds.height + moveEvent.clientY - startY,
					),
				),
				width: Math.max(
					Math.min(360, maximumWidth),
					Math.min(
						maximumWidth,
						startBounds.width + moveEvent.clientX - startX,
					),
				),
			});
		};
		const stopResize = (): void => {
			window.removeEventListener("pointermove", updateSize);
			window.removeEventListener("pointerup", stopResize);
		};
		window.addEventListener("pointermove", updateSize);
		window.addEventListener("pointerup", stopResize);
	};

	return (
		<aside
			data-reader-ui="true"
			data-reader-component="TaleDebug"
			data-reader-role="debug-panel"
			className={cn(
				"reader-debug-panel pointer-events-auto flex flex-col overflow-hidden border border-foreground/12 bg-background/92 shadow-2xl backdrop-blur-md",
				mobile
					? "absolute inset-x-0 bottom-0 z-[1200] w-full border-b-0"
					: "absolute z-[90]",
			)}
			style={
				mobile
					? { height: `${mobileHeightPercent}%` }
					: {
							height: desktopPanelHeight,
							left: desktopPanelLeft,
							top: desktopPanelTop,
							width: desktopPanelWidth,
						}
			}
		>
			<header
				data-reader-component="TaleDebug"
				data-reader-role="debug-header"
				className="reader-debug-header flex shrink-0 items-center justify-between gap-4 border-foreground/10 border-b px-4 py-3"
			>
				<div
					data-reader-component="TaleDebug"
					data-reader-role="debug-drag-handle"
					className={cn(
						"min-w-0 flex-1",
						mobile ? "cursor-row-resize touch-none" : "cursor-move",
					)}
					onPointerDown={mobile ? startMobileHeightDrag : startDesktopDrag}
				>
					<p className="font-black text-primary text-xs uppercase tracking-[0.2em]">
						Reader Debug
					</p>
					<p className="truncate text-foreground/46 text-xs">
						{block?.title ?? taleTitle}
					</p>
				</div>
				<div className="flex items-center gap-1">
					{DebugHeaderActions ? (
						<DebugHeaderActions sceneId={location?.sceneId ?? null} />
					) : null}
					<Button
						data-reader-component="TaleDebug"
						data-reader-role="close-debug-control"
						type="button"
						aria-label="Hide reader debug"
						size="icon"
						variant="ghost"
						motion="flat"
						className="h-9 w-9 border border-current/30 p-0 text-inherit hover:bg-primary hover:text-primary-foreground"
						onClick={toggleDebug}
					>
						<X size={16} />
					</Button>
				</div>
			</header>
			{isStudio ? <GlobalSnapControls /> : null}
			<DebugTabs
				active={activeTab}
				iconOnly={mobile}
				onChange={setActiveTab}
				tabs={debugTabs}
			/>
			<div
				data-reader-component="TaleDebug"
				data-reader-role="debug-content"
				className="min-h-0 flex-1 overflow-y-auto p-3"
			>
				{activeTab === "summary" ? (
					<SummaryPanel
						anchors={compiled?.anchors ?? []}
						blockType={
							block ? (block.isChoiceScene ? "choice" : "standard") : undefined
						}
						blockTitle={block?.title}
						branchTitle={branch?.title}
						entryTitle={entry?.title}
						pageLabel={currentPageLabel}
						partTitle={part?.title}
						phase={phase}
						seenBlocks={seenBlocks}
					/>
				) : null}
				{activeTab === "navigation" ? (
					<NavigationPanel
						block={block}
						branch={branch}
						entry={entry}
						page={page}
						pageLabel={currentPageLabel}
						part={part}
					/>
				) : null}
				{activeTab === "progress" ? (
					<ProgressPanel compiledCount={compiled?.anchors.length ?? 0} />
				) : null}
				{activeTab === "segments" ? (
					<SegmentsPanel
						activeIndex={activeSegmentIndex}
						segments={compiled?.segments ?? []}
					/>
				) : null}
				{activeTab === "anchors" ? (
					<AnchorsPanel
						activeSceneId={location?.sceneId}
						anchors={compiled?.anchors ?? []}
					/>
				) : null}
			</div>
			{mobile ? null : (
				<button
					data-reader-component="TaleDebug"
					data-reader-role="resize-debug-control"
					type="button"
					aria-label="Resize reader debug"
					className="absolute right-1 bottom-1 h-5 w-5 cursor-nwse-resize rounded border border-foreground/10 bg-foreground/8"
					onPointerDown={startDesktopResize}
				/>
			)}
		</aside>
	);
}

/**
 * Returns the compact icon for one reader debug tab.
 *
 * @param tab - Debug tab id.
 * @returns Icon element for mobile tabs.
 *
 * @example
 * const icon = getDebugTabIcon("summary");
 */
function getDebugTabIcon(tab: DebugTab): React.JSX.Element {
	if (tab === "summary") return <Activity size={14} />;
	if (tab === "navigation") return <Route size={14} />;
	if (tab === "progress") return <Crosshair size={14} />;
	if (tab === "segments") return <ListTree size={14} />;
	return <MapIcon size={14} />;
}
