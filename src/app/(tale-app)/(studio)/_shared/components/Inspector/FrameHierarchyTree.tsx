"use client";

import { ChevronRight, Frame, Search } from "lucide-react";
import { useState } from "react";
import type {
	ResolvedTaleElement,
	ResolvedTaleScene,
	TaleFrame,
} from "~/app/(tale-app)/_shared/types";
import cn from "~/lib/utils/cn";
import { useTaleStudioStore } from "../../hooks/useTaleStudioStore";
import { ElementThumbnail } from "./element/ElementThumbnail";

type FrameHierarchyTreeProps = {
	scene: ResolvedTaleScene;
	elementsById: Record<string, ResolvedTaleElement>;
	frames: TaleFrame[];
	framesById: Record<string, TaleFrame>;
	onSelectFrame: (frameId: string) => void;
	selectedFrameId: string;
};

/**
 * Renders a scene's frame and fragment ownership as an expandable tree.
 *
 * @param props - Frame hierarchy props.
 * @param props.scene - Scene whose hierarchy is shown.
 * @param props.onSelectFrame - Selects a frame for editing.
 * @param props.selectedFrameId - Currently edited frame id.
 * @returns Expandable frame hierarchy.
 *
 * @example
 * <FrameHierarchyTree scene={scene} selectedFrameId={id} onSelectFrame={setId} />
 */
export function FrameHierarchyTree({
	scene,
	elementsById,
	frames,
	framesById,
	onSelectFrame,
	selectedFrameId,
}: FrameHierarchyTreeProps): React.JSX.Element {
	const openInspector = useTaleStudioStore(
		(state) => state.studioSelection.openInspector,
	);
	const [expandedFrameIds, setExpandedFrameIds] = useState<Set<string>>(
		() =>
			new Set(
				frames.filter((frame) => !frame.parentFrameId).map((frame) => frame.id),
			),
	);
	const [query, setQuery] = useState("");
	const topLevelFrames = frames.filter((frame) => !frame.parentFrameId);
	const reachableFrameIds = collectReachableFrameIds(
		framesById,
		topLevelFrames,
	);
	const unlinkedFrames = frames.filter(
		(frame) => !reachableFrameIds.has(frame.id),
	);
	const normalizedQuery = query.trim().toLowerCase();
	const matchingFrames = normalizedQuery
		? frames.filter((frame) =>
				`${frame.id} ${frame.mode}`.toLowerCase().includes(normalizedQuery),
			)
		: [];
	const matchingElements = normalizedQuery
		? scene.elementIds
				.map((elementId) => elementsById[elementId])
				.filter(
					(element): element is ResolvedTaleElement =>
						Boolean(element) &&
						`${element?.id} ${element?.type} ${element?.label ?? ""}`
							.toLowerCase()
							.includes(normalizedQuery),
				)
		: [];

	const toggleFrame = (frameId: string): void => {
		setExpandedFrameIds((current) => {
			const next = new Set(current);
			if (next.has(frameId)) next.delete(frameId);
			else next.add(frameId);
			return next;
		});
	};

	return (
		<div
			data-reader-component="FrameHierarchyTree"
			data-reader-role="frame-hierarchy"
			className="rounded-md border border-foreground/10 bg-background/20 p-2"
		>
			<label className="mb-2 flex h-9 items-center gap-2 border border-foreground/15 bg-background px-2">
				<Search size={14} className="text-foreground/42" />
				<input
					className="min-w-0 flex-1 bg-transparent text-xs outline-none"
					placeholder="Find Frames or Elements"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>
			</label>
			{normalizedQuery ? (
				<div className="mb-2 grid gap-1 border-foreground/8 border-b pb-2">
					{matchingFrames.map((frame) => (
						<button
							key={frame.id}
							type="button"
							className="flex items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-foreground/7"
							onClick={() => onSelectFrame(frame.id)}
						>
							<Frame size={13} /> Frame {frame.id}
						</button>
					))}
					{matchingElements.map((element) => (
						<button
							key={element.id}
							type="button"
							className="flex min-w-0 items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-foreground/7"
							onClick={() =>
								openInspector({
									id: element.id,
									sceneId: scene.id,
									type: "element",
								})
							}
						>
							<ElementThumbnail className="h-8 w-10" element={element} />
							<span className="min-w-0 flex-1 truncate">
								{element.label ?? `${element.type} ${element.id}`}
							</span>
							<span className="shrink-0 text-[9px] text-foreground/38 uppercase">
								{element.type}
							</span>
						</button>
					))}
					{matchingFrames.length + matchingElements.length === 0 ? (
						<p className="px-2 py-2 text-foreground/42 text-xs">No matches.</p>
					) : null}
				</div>
			) : null}
			{topLevelFrames.map((frame) => (
				<FrameTreeBranch
					key={frame.id}
					scene={scene}
					expandedFrameIds={expandedFrameIds}
					elementsById={elementsById}
					frameId={frame.id}
					framesById={framesById}
					selectedFrameId={selectedFrameId}
					onInspectElement={(elementId) =>
						openInspector({
							sceneId: scene.id,
							id: elementId,
							type: "element",
						})
					}
					onSelectFrame={onSelectFrame}
					onToggleFrame={toggleFrame}
				/>
			))}
			{topLevelFrames.length === 0 ? (
				<p className="px-2 py-2 text-foreground/42 text-xs">
					This scene needs at least one Frame.
				</p>
			) : null}
			{unlinkedFrames.length > 0 ? (
				<div className="mt-2 border-foreground/8 border-t pt-2">
					<p className="px-2 py-1 font-bold text-[9px] text-foreground/35 uppercase">
						Unlinked Frames
					</p>
					{unlinkedFrames.map((frame) => (
						<FrameTreeBranch
							key={frame.id}
							scene={scene}
							expandedFrameIds={expandedFrameIds}
							elementsById={elementsById}
							frameId={frame.id}
							framesById={framesById}
							selectedFrameId={selectedFrameId}
							onInspectElement={(elementId) =>
								openInspector({
									sceneId: scene.id,
									id: elementId,
									type: "element",
								})
							}
							onSelectFrame={onSelectFrame}
							onToggleFrame={toggleFrame}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}

type FrameTreeBranchProps = {
	scene: ResolvedTaleScene;
	expandedFrameIds: Set<string>;
	elementsById: Record<string, ResolvedTaleElement>;
	frameId: string;
	framesById: Record<string, TaleFrame>;
	onInspectElement: (elementId: string) => void;
	onSelectFrame: (frameId: string) => void;
	onToggleFrame: (frameId: string) => void;
	selectedFrameId: string;
};

/**
 * Renders one recursive branch of the frame hierarchy.
 *
 * @param props - Recursive branch props.
 * @returns One frame row and its expanded children.
 */
function FrameTreeBranch({
	scene,
	expandedFrameIds,
	elementsById,
	frameId,
	framesById,
	onInspectElement,
	onSelectFrame,
	onToggleFrame,
	selectedFrameId,
}: FrameTreeBranchProps): React.JSX.Element | null {
	const frame = framesById[frameId];
	if (!frame) return null;
	const expanded = expandedFrameIds.has(frame.id);
	const childElementIds = new Set(
		frame.children.flatMap((child) =>
			child.type === "element" ? [child.elementId] : [],
		),
	);
	const assignedElementIds = scene.elementIds.filter((elementId) => {
		const element = elementsById[elementId];
		const ownerId = element?.frameId?.split(":").at(-1);
		const currentId = frame.id.split(":").at(-1);
		return ownerId === currentId && !childElementIds.has(elementId);
	});
	const hasChildren =
		frame.children.length > 0 || assignedElementIds.length > 0;

	return (
		<div
			data-reader-component="FrameTreeBranch"
			data-reader-role="frame-branch"
		>
			<div className="flex min-w-0 items-center gap-1">
				<button
					type="button"
					aria-label={expanded ? "Collapse Frame" : "Expand Frame"}
					disabled={!hasChildren}
					className="grid h-7 w-7 shrink-0 place-items-center text-foreground/38 disabled:opacity-20"
					onClick={() => onToggleFrame(frame.id)}
				>
					<ChevronRight
						size={13}
						className={cn("transition-transform", expanded && "rotate-90")}
					/>
				</button>
				<button
					type="button"
					className={cn(
						"flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-xs",
						selectedFrameId === frame.id
							? "bg-primary/18 text-primary"
							: "text-foreground/62 hover:bg-foreground/7 hover:text-foreground",
					)}
					onClick={() => onSelectFrame(frame.id)}
				>
					<Frame size={13} className="shrink-0" />
					<span className="truncate">{frame.id}</span>
					<span className="ml-auto shrink-0 text-[9px] text-foreground/32">
						{frame.children.length}
					</span>
				</button>
			</div>
			{expanded ? (
				<div className="ml-3 border-foreground/10 border-l pl-2">
					{frame.children.map((child) =>
						child.type === "frame" ? (
							<FrameTreeBranch
								key={child.frameId}
								scene={scene}
								expandedFrameIds={expandedFrameIds}
								elementsById={elementsById}
								frameId={child.frameId}
								framesById={framesById}
								selectedFrameId={selectedFrameId}
								onInspectElement={onInspectElement}
								onSelectFrame={onSelectFrame}
								onToggleFrame={onToggleFrame}
							/>
						) : (
							<ElementTreeButton
								key={child.elementId}
								scene={scene}
								elementsById={elementsById}
								elementId={child.elementId}
								onInspectElement={onInspectElement}
							/>
						),
					)}
					{assignedElementIds.map((elementId) => (
						<ElementTreeButton
							key={elementId}
							scene={scene}
							elementsById={elementsById}
							elementId={elementId}
							onInspectElement={onInspectElement}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}

/**
 * Renders an Element child in the Frame hierarchy.
 *
 * @param props - Element ownership and inspection callback.
 * @returns Element tree control.
 */
function ElementTreeButton({
	scene,
	elementsById,
	elementId,
	onInspectElement,
}: {
	scene: ResolvedTaleScene;
	elementsById: Record<string, ResolvedTaleElement>;
	elementId: string;
	onInspectElement: (elementId: string) => void;
}): React.JSX.Element {
	const element = elementsById[elementId];
	return (
		<button
			type="button"
			className="flex w-full min-w-0 items-center gap-2 rounded py-1.5 pr-2 pl-9 text-left text-[11px] text-foreground/48 hover:bg-foreground/7 hover:text-foreground"
			onClick={() => onInspectElement(elementId)}
		>
			{element ? (
				<ElementThumbnail className="h-8 w-10" element={element} />
			) : null}
			<span className="min-w-0 flex-1 truncate">
				{element?.label ?? `${element?.type ?? "Element"} · ${elementId}`}
			</span>
			<span className="shrink-0 text-[9px] text-foreground/32 uppercase">
				{element?.type ?? "element"}
			</span>
		</button>
	);
}

/**
 * Collects frame ids reachable through authored child relationships.
 *
 * @param scene - Scene containing indexed frames.
 * @param roots - Top-level Frames from which traversal starts.
 * @returns Reachable frame id set.
 */
function collectReachableFrameIds(
	framesById: Record<string, TaleFrame>,
	roots: TaleFrame[],
): Set<string> {
	const reachable = new Set<string>();
	const visit = (frameId: string): void => {
		if (reachable.has(frameId)) return;
		reachable.add(frameId);
		const frame = framesById[frameId];
		for (const child of frame?.children ?? []) {
			if (child.type === "frame") visit(child.frameId);
		}
	};
	for (const frame of roots) visit(frame.id);
	return reachable;
}
