"use client";

import { useState } from "react";
import {
	editBranch,
	editPath,
} from "~/app/(tale-app)/(tale-editor)/_shared/services/taleDraftEdits";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type { Tale, TalePath } from "~/app/(tale-app)/_shared/types";
import {
	useTaleEditorStore,
	useTaleEditorStoreShallow,
} from "../../hooks/useTaleEditorStore";
import type {
	EditorEdgeType,
	EditorGraphDirection,
	GraphFocusMode,
	PathVisibilityMode,
} from "../../store/editorStoreTypes";
import { TaleInspectorPanel } from "../Inspector/TaleInspectorPanel";

type EditorRightPanelTab = "elements" | "settings";
type PathType = TalePath["type"];

/**
 * Renders focused editing controls for the selected branch or block.
 *
 * @returns Editor selection panel.
 *
 * @example
 * <TaleEditorSelectionPanel />
 */
export function TaleEditorSelectionPanel(): React.JSX.Element {
	const [tab, setTab] = useState<EditorRightPanelTab>("elements");
	const { selectedBranchId, inspector: selectedTarget } =
		useTaleEditorStoreShallow((state) => state.editor);
	const {
		edgeType,
		focusMode,
		graphDirection,
		pathVisibilityMode,
		selectedPathId,
		setEdgeType,
		setFocusMode,
		setGraphDirection,
		setPathVisibilityMode,
		setVisiblePathTypes,
		setUnfocusedEdgeOpacity,
		setUnfocusedNodeOpacity,
		unfocusedEdgeOpacity,
		unfocusedNodeOpacity,
		visiblePathTypes,
	} = useTaleEditorStoreShallow((state) => state.editorGraph);
	const width = useTaleEditorStore(
		(state) => state.editorWorkspace.rightPanelWidth,
	);
	const { setTale: setData, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const branch = selectedBranchId
		? tale.indexMap.branchesById[selectedBranchId]
		: null;
	const path = selectedPathId ? tale.indexMap.pathsById[selectedPathId] : null;

	return (
		<aside
			data-reader-component="TaleEditorSelectionPanel"
			data-reader-role="editor-right-panel"
			className="h-full overflow-hidden border-foreground/10 border-l bg-background/84"
			style={{ width }}
		>
			<header className="flex border-foreground/10 border-b p-2">
				<PanelTab
					active={tab === "elements"}
					onClick={() => setTab("elements")}
				>
					Elements
				</PanelTab>
				<PanelTab
					active={tab === "settings"}
					onClick={() => setTab("settings")}
				>
					Settings
				</PanelTab>
			</header>
			<div className="h-[calc(100%-3.25rem)] overflow-y-auto p-3">
				{tab === "settings" ? (
					<EditorGraphSettings
						edgeType={edgeType}
						focusMode={focusMode}
						graphDirection={graphDirection}
						pathVisibilityMode={pathVisibilityMode}
						visiblePathTypes={visiblePathTypes}
						onEdgeTypeChange={setEdgeType}
						onFocusModeChange={setFocusMode}
						onGraphDirectionChange={setGraphDirection}
						onPathVisibilityModeChange={setPathVisibilityMode}
						onVisiblePathTypesChange={setVisiblePathTypes}
						onUnfocusedEdgeOpacityChange={setUnfocusedEdgeOpacity}
						onUnfocusedNodeOpacityChange={setUnfocusedNodeOpacity}
						unfocusedEdgeOpacity={unfocusedEdgeOpacity}
						unfocusedNodeOpacity={unfocusedNodeOpacity}
					/>
				) : selectedTarget ? (
					<TaleInspectorPanel target={selectedTarget} />
				) : path ? (
					<PathEditor path={path} tale={tale} onChange={setData} />
				) : branch ? (
					<BranchEditor
						branchId={branch.id}
						description={branch.description ?? ""}
						tale={tale}
						title={branch.title}
						onChange={setData}
					/>
				) : (
					<p className="text-foreground/45 text-sm">
						Select a branch or block to edit it.
					</p>
				)}
			</div>
		</aside>
	);
}

/**
 * Renders one tab button in the editor right panel.
 *
 * @param props - Tab props.
 * @param props.active - Whether this tab is active.
 * @param props.children - Tab label.
 * @param props.onClick - Activates this tab.
 * @returns Tab button.
 *
 * @example
 * <PanelTab active onClick={select}>Elements</PanelTab>
 */
function PanelTab({
	active,
	children,
	onClick,
}: {
	active: boolean;
	children: React.ReactNode;
	onClick: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			className={`h-9 flex-1 rounded text-xs ${
				active
					? "bg-foreground text-background"
					: "text-foreground/55 hover:bg-foreground/8"
			}`}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

/**
 * Renders branch metadata controls.
 *
 * @param props - Branch editor props.
 * @param props.branchId - Branch id being edited.
 * @param props.description - Current branch description.
 * @param props.onChange - Receives the next tale.
 * @param props.tale - Current tale.
 * @param props.title - Current branch title.
 * @returns Branch metadata form.
 *
 * @example
 * <BranchEditor branchId="1" title="Route" description="" tale={tale} onChange={setData} />
 */
function BranchEditor({
	branchId,
	description,
	onChange,
	tale,
	title,
}: {
	branchId: string;
	description: string;
	onChange: (tale: Tale) => void;
	tale: Tale;
	title: string;
}): React.JSX.Element {
	return (
		<div data-reader-component="BranchEditor" data-reader-role="branch-form">
			<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
				Branch
			</p>
			<label className="mt-4 block text-foreground/62 text-xs">
				Title
				<input
					className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
					value={title}
					onChange={(event) =>
						onChange(
							editBranch(tale, branchId, (current) => ({
								...current,
								title: event.target.value,
							})),
						)
					}
				/>
			</label>
			<label className="mt-3 block text-foreground/62 text-xs">
				Description
				<textarea
					className="mt-1 min-h-28 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 py-2 text-foreground text-sm outline-none focus:border-primary/60"
					value={description}
					onChange={(event) =>
						onChange(
							editBranch(tale, branchId, (current) => ({
								...current,
								description: event.target.value,
							})),
						)
					}
				/>
			</label>
		</div>
	);
}

/**
 * Renders path metadata and endpoint controls.
 *
 * @param props - Path editor props.
 * @param props.onChange - Receives the next tale.
 * @param props.path - Path being edited.
 * @param props.tale - Current tale.
 * @returns Path metadata form.
 *
 * @example
 * <PathEditor path={path} tale={tale} onChange={setData} />
 */
function PathEditor({
	onChange,
	path,
	tale,
}: {
	onChange: (tale: Tale) => void;
	path: TalePath;
	tale: Tale;
}): React.JSX.Element {
	const fromBlocks = getPathBranchBlocks(tale, path.fromBranchId);
	const toBlocks = getPathBranchBlocks(tale, path.toBranchId);

	return (
		<div data-reader-component="PathEditor" data-reader-role="path-form">
			<p className="font-black text-[#67e8f9] text-xs uppercase tracking-[0.18em]">
				Path
			</p>
			<EditorTextField
				label="Label"
				value={path.label}
				onChange={(label) =>
					onChange(
						editPath(tale, path.id, (current) => ({ ...current, label })),
					)
				}
			/>
			<label className="mt-3 block text-foreground/62 text-xs">
				Type
				<select
					className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-[#67e8f9]/60"
					value={path.type}
					onChange={(event) =>
						onChange(
							editPath(tale, path.id, (current) => ({
								...current,
								type: event.target.value as PathType,
							})),
						)
					}
				>
					<option value="choice">Choice</option>
					<option value="convergence">Convergence</option>
					<option value="ending">Ending</option>
					<option value="return">Return</option>
					<option value="teleport">Teleport</option>
				</select>
			</label>
			<label className="mt-3 block text-foreground/62 text-xs">
				Description
				<textarea
					className="mt-1 min-h-24 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 py-2 text-foreground text-sm outline-none focus:border-[#67e8f9]/60"
					value={path.description ?? ""}
					onChange={(event) =>
						onChange(
							editPath(tale, path.id, (current) => ({
								...current,
								description: event.target.value,
							})),
						)
					}
				/>
			</label>
			<PathBlockSelect
				blocks={fromBlocks}
				label="From block"
				value={path.fromBlockId}
				onChange={(fromBlockId) =>
					onChange(
						editPath(tale, path.id, (current) => ({ ...current, fromBlockId })),
					)
				}
			/>
			<PathBlockSelect
				blocks={toBlocks}
				label="To block"
				value={path.toBlockId}
				onChange={(toBlockId) =>
					onChange(
						editPath(tale, path.id, (current) => ({ ...current, toBlockId })),
					)
				}
			/>
		</div>
	);
}

/**
 * Renders overall editor graph settings.
 *
 * @param props - Graph settings props.
 * @param props.edgeType - Current React Flow edge type.
 * @param props.graphDirection - Current automatic graph layout direction.
 * @param props.onEdgeTypeChange - Receives edge type changes.
 * @param props.onGraphDirectionChange - Receives graph direction changes.
 * @param props.onPathVisibilityModeChange - Receives path visibility mode changes.
 * @param props.onVisiblePathTypesChange - Receives custom path type changes.
 * @param props.pathVisibilityMode - Current visibility mode.
 * @param props.visiblePathTypes - Custom visible path types.
 * @returns Editor settings form.
 *
 * @example
 * <EditorGraphSettings edgeType="smoothstep" onEdgeTypeChange={setEdgeType} />
 */
function EditorGraphSettings({
	edgeType,
	focusMode,
	graphDirection,
	onEdgeTypeChange,
	onFocusModeChange,
	onGraphDirectionChange,
	onPathVisibilityModeChange,
	onVisiblePathTypesChange,
	onUnfocusedEdgeOpacityChange,
	onUnfocusedNodeOpacityChange,
	pathVisibilityMode,
	visiblePathTypes,
	unfocusedEdgeOpacity,
	unfocusedNodeOpacity,
}: {
	edgeType: EditorEdgeType;
	focusMode: GraphFocusMode;
	graphDirection: EditorGraphDirection;
	onEdgeTypeChange: (edgeType: EditorEdgeType) => void;
	onFocusModeChange: (mode: GraphFocusMode) => void;
	onGraphDirectionChange: (direction: EditorGraphDirection) => void;
	onPathVisibilityModeChange: (mode: PathVisibilityMode) => void;
	onVisiblePathTypesChange: (types: Set<PathType>) => void;
	onUnfocusedEdgeOpacityChange: (opacity: number) => void;
	onUnfocusedNodeOpacityChange: (opacity: number) => void;
	pathVisibilityMode: PathVisibilityMode;
	visiblePathTypes: Set<PathType>;
	unfocusedEdgeOpacity: number;
	unfocusedNodeOpacity: number;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="EditorGraphSettings"
			data-reader-role="settings"
		>
			<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
				Editor Settings
			</p>
			<label className="mt-4 block text-foreground/62 text-xs">
				Hover focus
				<select
					className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
					value={focusMode}
					onChange={(event) =>
						onFocusModeChange(event.target.value as GraphFocusMode)
					}
				>
					<option value="direct">Direct connections</option>
					<option value="ancestry">Parent ancestry</option>
					<option value="off">Disabled</option>
				</select>
			</label>
			{focusMode !== "off" ? (
				<div className="mt-4 grid grid-cols-2 gap-3">
					<OpacityField
						label="Other nodes"
						value={unfocusedNodeOpacity}
						onChange={onUnfocusedNodeOpacityChange}
					/>
					<OpacityField
						label="Other edges"
						value={unfocusedEdgeOpacity}
						onChange={onUnfocusedEdgeOpacityChange}
					/>
				</div>
			) : null}
			<label className="mt-4 block text-foreground/62 text-xs">
				Path edge style
				<select
					className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
					value={edgeType}
					onChange={(event) =>
						onEdgeTypeChange(event.target.value as EditorEdgeType)
					}
				>
					<option value="smoothstep">Curved</option>
					<option value="step">Sharp</option>
					<option value="straight">Straight</option>
					<option value="default">Default</option>
				</select>
			</label>
			<label className="mt-4 block text-foreground/62 text-xs">
				Graph direction
				<select
					className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
					value={graphDirection}
					onChange={(event) =>
						onGraphDirectionChange(event.target.value as EditorGraphDirection)
					}
				>
					<option value="horizontal">Horizontal tree</option>
					<option value="vertical">Vertical tree</option>
				</select>
			</label>
			<label className="mt-4 block text-foreground/62 text-xs">
				Path visibility
				<select
					className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
					value={pathVisibilityMode}
					onChange={(event) => {
						const mode = event.target.value as PathVisibilityMode;
						onPathVisibilityModeChange(mode);
						if (mode === "all") {
							onVisiblePathTypesChange(new Set(pathTypes));
						}
						if (mode === "primary") {
							onVisiblePathTypesChange(
								new Set(["choice", "convergence", "ending"]),
							);
						}
					}}
				>
					<option value="all">Show all</option>
					<option value="primary">Ending, choice, convergence</option>
					<option value="custom">Show custom</option>
				</select>
			</label>
			{pathVisibilityMode === "custom" ? (
				<div className="mt-3 grid gap-2">
					{pathTypes.map((type) => (
						<label
							key={type}
							className="flex items-center justify-between rounded border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-foreground/70 text-xs"
						>
							<span className="capitalize">{type}</span>
							<input
								type="checkbox"
								checked={visiblePathTypes.has(type)}
								onChange={(event) => {
									const next = new Set(visiblePathTypes);
									if (event.target.checked) next.add(type);
									else next.delete(type);
									onVisiblePathTypesChange(next);
								}}
							/>
						</label>
					))}
				</div>
			) : null}
		</div>
	);
}

/**
 * Renders a normalized graph opacity control.
 *
 * @param props - Opacity field props.
 * @returns Labeled range control.
 *
 * @example
 * <OpacityField label="Other nodes" value={0.1} onChange={setOpacity} />
 */
function OpacityField({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: number) => void;
	value: number;
}): React.JSX.Element {
	return (
		<label className="text-foreground/62 text-xs">
			<span className="flex justify-between gap-2">
				{label}
				<span>{Math.round(value * 100)}%</span>
			</span>
			<input
				className="mt-2 w-full accent-[#d9b56f]"
				max="1"
				min="0"
				step="0.01"
				type="range"
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</label>
	);
}

const pathTypes: PathType[] = [
	"choice",
	"convergence",
	"ending",
	"return",
	"teleport",
];

/**
 * Renders a single text input used by editor forms.
 *
 * @param props - Text field props.
 * @param props.label - Field label.
 * @param props.onChange - Receives changed value.
 * @param props.value - Current value.
 * @returns Text field.
 *
 * @example
 * <EditorTextField label="Title" value={title} onChange={setTitle} />
 */
function EditorTextField({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="mt-4 block text-foreground/62 text-xs">
			{label}
			<input
				className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

/**
 * Renders a block selector for one path endpoint.
 *
 * @param props - Block selector props.
 * @param props.blocks - Selectable branch blocks.
 * @param props.label - Field label.
 * @param props.onChange - Receives selected block id.
 * @param props.value - Selected block id.
 * @returns Block endpoint selector.
 *
 * @example
 * <PathBlockSelect label="From" blocks={blocks} value="1" onChange={setBlock} />
 */
function PathBlockSelect({
	blocks,
	label,
	onChange,
	value,
}: {
	blocks: Tale["structure"]["blocks"];
	label: string;
	onChange: (blockId: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="mt-3 block text-foreground/62 text-xs">
			{label}
			<select
				className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-[#67e8f9]/60"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			>
				{blocks.map((block) => (
					<option key={block.id} value={block.id}>
						{block.order + 1}. {block.title}
					</option>
				))}
			</select>
		</label>
	);
}

/**
 * Gets ordered blocks for one branch.
 *
 * @param tale - Current tale.
 * @param branchId - Branch id to read.
 * @returns Ordered branch blocks.
 *
 * @example
 * const blocks = getPathBranchBlocks(tale, path.fromBranchId);
 */
function getPathBranchBlocks(
	tale: Tale,
	branchId: string,
): Tale["structure"]["blocks"] {
	return tale.structure.blocks
		.filter((block) => block.branchId === branchId)
		.sort((first, second) => first.order - second.order);
}
