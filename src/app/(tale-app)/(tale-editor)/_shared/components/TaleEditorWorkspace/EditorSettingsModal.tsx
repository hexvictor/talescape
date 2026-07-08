"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type { TalePath } from "~/app/(tale-app)/_shared/types";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import type {
	EditorEdgeType,
	EditorGraphDirection,
	GraphFocusMode,
	PathVisibilityMode,
} from "../../store/editorStoreTypes";
import { TaleSettingsPanel } from "./TaleSettingsPanel";

type PathType = TalePath["type"];

const pathTypes: PathType[] = ["choice", "linear", "return", "teleport"];

/**
 * Renders editor-wide graph settings in a modal dialog.
 *
 * @param props - Modal props.
 * @param props.open - Whether the modal is visible.
 * @param props.onClose - Closes the settings modal.
 * @returns Settings modal, or null when closed.
 *
 * @example
 * <EditorSettingsModal open={open} onClose={close} />
 */
export function EditorSettingsModal({
	onClose,
	open,
}: {
	onClose: () => void;
	open: boolean;
}): React.JSX.Element | null {
	const [activeTab, setActiveTab] = useState<"graph" | "tale">("tale");
	const {
		edgeType,
		focusMode,
		graphDirection,
		pathVisibilityMode,
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
	const { breakpointId, setBreakpointId, setTale, tale } =
		useTaleAppStoreShallow((state) => ({
			breakpointId: state.runtime.breakpointId,
			setBreakpointId: state.runtime.setBreakpointId,
			setTale: state.document.setTale,
			tale: state.document.tale,
		}));

	if (!open) return null;

	return (
		<div
			data-reader-component="EditorSettingsModal"
			data-reader-role="editor-settings-dialog"
			className="fixed inset-0 z-[80] grid place-items-center bg-black/48 p-2 sm:p-4"
			onMouseDown={onClose}
		>
			<section
				className="max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-hidden rounded-lg border border-foreground/12 bg-background text-foreground shadow-2xl"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<header className="flex items-start justify-between gap-3 border-foreground/10 border-b px-3 py-3 sm:px-4">
					<div className="min-w-0">
						<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
							Editor Settings
						</p>
						<p className="mt-1 text-foreground/45 text-xs">
							Tale metadata, snap defaults, breakpoints, and graph behavior
						</p>
					</div>
					<button
						type="button"
						aria-label="Close editor settings"
						className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/55 hover:bg-foreground/8 hover:text-foreground"
						onClick={onClose}
					>
						<X size={16} />
					</button>
				</header>
				<div className="border-foreground/10 border-b px-3 py-2 sm:px-4">
					<div className="inline-flex rounded border border-foreground/10 bg-foreground/[0.03] p-1">
						<SettingsTabButton
							active={activeTab === "tale"}
							label="Tale"
							onClick={() => setActiveTab("tale")}
						/>
						<SettingsTabButton
							active={activeTab === "graph"}
							label="Graph"
							onClick={() => setActiveTab("graph")}
						/>
					</div>
				</div>
				<div className="max-h-[calc(100dvh-10.5rem)] overflow-y-auto overflow-x-hidden p-3 sm:p-4">
					{activeTab === "tale" ? (
						<>
							<TaleSettingsPanel />
							<BreakpointSettings
								activeBreakpointId={breakpointId}
								breakpoints={tale.breakpoints}
								onActiveBreakpointChange={setBreakpointId}
								onChange={(breakpoints) =>
									setTale(
										{
											...tale,
											breakpoints,
										},
										{
											invalidation: "compilation",
											reason: "editor-breakpoints",
										},
									)
								}
							/>
						</>
					) : (
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
					)}
				</div>
			</section>
		</div>
	);
}

/**
 * Renders one editor settings tab button.
 *
 * @param props - Tab button props.
 * @returns Settings tab button.
 *
 * @example
 * <SettingsTabButton active label="Tale" onClick={selectTale} />
 */
function SettingsTabButton({
	active,
	label,
	onClick,
}: {
	active: boolean;
	label: string;
	onClick: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			className={clsx(
				"rounded px-3 py-1.5 font-semibold text-xs",
				active
					? "bg-primary text-primary-foreground"
					: "text-foreground/54 hover:bg-foreground/8 hover:text-foreground",
			)}
			onClick={onClick}
		>
			{label}
		</button>
	);
}

/**
 * Renders tale breakpoint authoring controls inside the editor settings modal.
 *
 * @param props - Breakpoint settings props.
 * @returns Breakpoint authoring section.
 */
function BreakpointSettings({
	activeBreakpointId,
	breakpoints,
	onActiveBreakpointChange,
	onChange,
}: {
	activeBreakpointId: string | null;
	breakpoints: {
		id: string;
		label: string;
		maxHeight?: number;
		maxWidth?: number;
		minHeight?: number;
		minWidth?: number;
		orientation?: "landscape" | "portrait";
		order: number;
	}[];
	onActiveBreakpointChange: (breakpointId: string | null) => void;
	onChange: (
		breakpoints: {
			id: string;
			label: string;
			maxHeight?: number;
			maxWidth?: number;
			minHeight?: number;
			minWidth?: number;
			orientation?: "landscape" | "portrait";
			order: number;
		}[],
	) => void;
}): React.JSX.Element {
	const orderedBreakpoints = useMemo(
		() => [...breakpoints].sort((left, right) => left.order - right.order),
		[breakpoints],
	);

	return (
		<section className="mt-6 border-foreground/10 border-t pt-6">
			<div className="mb-3 grid gap-3 sm:flex sm:items-center sm:justify-between">
				<div className="min-w-0">
					<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
						Tale Breakpoints
					</p>
					<p className="mt-1 text-foreground/45 text-xs">
						Define responsive breakpoint rules and pick the preview target.
					</p>
				</div>
				<button
					type="button"
					className="h-9 rounded border border-foreground/12 px-3 text-foreground/72 text-xs hover:bg-foreground/8 sm:justify-self-end"
					onClick={() =>
						onChange([
							...orderedBreakpoints,
							{
								id: createBreakpointId(),
								label: `Breakpoint ${orderedBreakpoints.length + 1}`,
								maxWidth: 768,
								order: orderedBreakpoints.length,
							},
						])
					}
				>
					Add breakpoint
				</button>
			</div>
			<div className="space-y-3">
				{orderedBreakpoints.map((breakpoint, index) => (
					<div
						key={breakpoint.id}
						className="min-w-0 rounded border border-foreground/10 bg-foreground/[0.03] p-3"
					>
						<div className="mb-3 grid gap-2 sm:flex sm:items-center sm:justify-between">
							<label className="flex min-w-0 items-center gap-2 text-foreground/60 text-xs">
								<input
									type="radio"
									name="active-breakpoint"
									checked={activeBreakpointId === breakpoint.id}
									onChange={() => onActiveBreakpointChange(breakpoint.id)}
								/>
								Preview this breakpoint
							</label>
							<button
								type="button"
								className="text-foreground/50 text-xs hover:text-foreground"
								onClick={() => {
									const next = orderedBreakpoints
										.filter((item) => item.id !== breakpoint.id)
										.map((item, itemIndex) => ({ ...item, order: itemIndex }));
									onChange(next);
									if (activeBreakpointId === breakpoint.id) {
										onActiveBreakpointChange(null);
									}
								}}
							>
								Remove
							</button>
						</div>
						<div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
							<SettingsInput
								label="Label"
								value={breakpoint.label}
								onChange={(label) =>
									onChange(
										replaceBreakpoint(orderedBreakpoints, breakpoint.id, {
											...breakpoint,
											label,
										}),
									)
								}
							/>
							<label className="grid min-w-0 gap-1 text-foreground/52 text-xs">
								<span className="font-medium uppercase">Orientation</span>
								<select
									className="min-w-0 rounded border border-foreground/12 bg-background px-2 py-2 text-foreground text-xs"
									value={breakpoint.orientation ?? ""}
									onChange={(event) =>
										onChange(
											replaceBreakpoint(orderedBreakpoints, breakpoint.id, {
												...breakpoint,
												orientation:
													event.target.value === ""
														? undefined
														: (event.target.value as "landscape" | "portrait"),
											}),
										)
									}
								>
									<option value="">Any</option>
									<option value="portrait">Portrait</option>
									<option value="landscape">Landscape</option>
								</select>
							</label>
							<SettingsNumber
								label="Min width"
								value={breakpoint.minWidth}
								onChange={(minWidth) =>
									onChange(
										replaceBreakpoint(orderedBreakpoints, breakpoint.id, {
											...breakpoint,
											minWidth,
										}),
									)
								}
							/>
							<SettingsNumber
								label="Max width"
								value={breakpoint.maxWidth}
								onChange={(maxWidth) =>
									onChange(
										replaceBreakpoint(orderedBreakpoints, breakpoint.id, {
											...breakpoint,
											maxWidth,
										}),
									)
								}
							/>
							<SettingsNumber
								label="Min height"
								value={breakpoint.minHeight}
								onChange={(minHeight) =>
									onChange(
										replaceBreakpoint(orderedBreakpoints, breakpoint.id, {
											...breakpoint,
											minHeight,
										}),
									)
								}
							/>
							<SettingsNumber
								label="Max height"
								value={breakpoint.maxHeight}
								onChange={(maxHeight) =>
									onChange(
										replaceBreakpoint(orderedBreakpoints, breakpoint.id, {
											...breakpoint,
											maxHeight,
										}),
									)
								}
							/>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

/**
 * Renders one text field in the breakpoint settings form.
 */
function SettingsInput({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="grid min-w-0 gap-1 text-foreground/52 text-xs">
			<span className="font-medium uppercase">{label}</span>
			<input
				className="min-w-0 rounded border border-foreground/12 bg-background px-2 py-2 text-foreground text-xs"
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

/**
 * Renders one optional numeric field in the breakpoint settings form.
 */
function SettingsNumber({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: number | undefined) => void;
	value: number | undefined;
}): React.JSX.Element {
	return (
		<label className="grid min-w-0 gap-1 text-foreground/52 text-xs">
			<span className="font-medium uppercase">{label}</span>
			<input
				className="min-w-0 rounded border border-foreground/12 bg-background px-2 py-2 text-foreground text-xs"
				type="number"
				value={value ?? ""}
				onChange={(event) =>
					onChange(
						event.target.value === "" ? undefined : Number(event.target.value),
					)
				}
			/>
		</label>
	);
}

/**
 * Replaces one breakpoint inside an ordered breakpoint collection.
 */
function replaceBreakpoint<Breakpoint extends { id: string; order: number }>(
	breakpoints: Breakpoint[],
	id: string,
	next: Breakpoint,
): Breakpoint[] {
	return breakpoints.map((breakpoint) =>
		breakpoint.id === id ? next : breakpoint,
	);
}

/**
 * Creates a stable client-side id for a newly authored breakpoint draft.
 */
function createBreakpointId(): string {
	return `breakpoint-${Date.now().toString(36)}`;
}

/**
 * Renders graph settings controls used by the editor settings modal.
 *
 * @param props - Graph settings props.
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
			<SettingsSelect
				label="Hover focus"
				value={focusMode}
				options={[
					["direct", "Direct connections"],
					["ancestry", "Parent ancestry"],
					["off", "Disabled"],
				]}
				onChange={(value) => onFocusModeChange(value as GraphFocusMode)}
			/>
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
			<SettingsSelect
				label="Path edge style"
				value={edgeType}
				options={[
					["smoothstep", "Curved"],
					["step", "Sharp"],
					["straight", "Straight"],
					["default", "Default"],
				]}
				onChange={(value) => onEdgeTypeChange(value as EditorEdgeType)}
			/>
			<SettingsSelect
				label="Graph direction"
				value={graphDirection}
				options={[
					["horizontal", "Horizontal tree"],
					["vertical", "Vertical tree"],
				]}
				onChange={(value) =>
					onGraphDirectionChange(value as EditorGraphDirection)
				}
			/>
			<SettingsSelect
				label="Path visibility"
				value={pathVisibilityMode}
				options={[
					["all", "Show all"],
					["linear", "Linear paths"],
					["return", "Return paths"],
					["teleport", "Teleport paths"],
					["custom", "Show custom"],
				]}
				onChange={(value) => {
					const mode = value as PathVisibilityMode;
					onPathVisibilityModeChange(mode);
					if (mode === "all") onVisiblePathTypesChange(new Set(pathTypes));
					if (mode === "linear") {
						onVisiblePathTypesChange(new Set(["choice", "linear"]));
					}
					if (mode === "return") onVisiblePathTypesChange(new Set(["return"]));
					if (mode === "teleport") {
						onVisiblePathTypesChange(new Set(["teleport"]));
					}
				}}
			/>
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
 * Renders one select field in the settings modal.
 *
 * @param props - Select field props.
 * @returns Labeled settings select.
 *
 * @example
 * <SettingsSelect label="Graph direction" value="horizontal" options={options} onChange={setValue} />
 */
function SettingsSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: [string, string][];
	value: string;
}): React.JSX.Element {
	return (
		<label className="mt-4 block text-foreground/62 text-xs first:mt-0">
			{label}
			<select
				className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			>
				{options.map(([optionValue, optionLabel]) => (
					<option key={optionValue} value={optionValue}>
						{optionLabel}
					</option>
				))}
			</select>
		</label>
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
