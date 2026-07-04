"use client";
import {
	GitBranch,
	PanelRightClose,
	PanelRightOpen,
	Save,
	Settings,
	SquareMousePointer,
	Target,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { createTaleEditorDraftPayload } from "~/app/(tale-app)/(tale-editor)/_shared/services/createTaleEditorDraftPayload";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import AutoHideTopBar from "~/components/layout/AutoHideTopBar/AutoHideTopBar";
import { Header } from "~/components/layout/Header";
import Logo from "~/components/ui/Logo";
import ThemeToggle from "~/components/ui/ThemeToggle";
import Separator from "~/components/ui/separator";
import { AuthStatus } from "~/features/auth/components";
import { api } from "~/trpc/react";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import { EditorActivitySwitcher } from "./EditorActivitySwitcher";
import { EditorPreviewSelectionControls } from "./EditorPreviewSelectionControls";
import { EditorSettingsModal } from "./EditorSettingsModal";

/**
 * Renders editor mode controls and persists the active tale document.
 *
 * @returns Editor mode toolbar.
 *
 * @example
 * <EditorModeToolbar />
 */
export function EditorModeToolbar(): React.JSX.Element {
	const { dirty, markSaved, tale } = useTaleAppStoreShallow((state) => ({
		dirty: state.document.dirty,
		markSaved: state.document.markSaved,
		tale: state.document.tale,
	}));
	const { breakpointId, previewOpen, setBreakpointId, setPreviewOpen } =
		useTaleAppStoreShallow((state) => ({
			breakpointId: state.runtime.breakpointId,
			previewOpen: state.runtime.previewOpen,
			setBreakpointId: state.runtime.setBreakpointId,
			setPreviewOpen: state.runtime.setPreviewOpen,
		}));
	const {
		autoSelectActiveBlock,
		graphOpen,
		rightPanelOpen,
		selectBlockForEditing,
		setAutoSelectActiveBlock,
		setGraphOpen,
		setRightPanelOpen,
	} = useTaleEditorStoreShallow((state) => ({
		autoSelectActiveBlock: state.editorWorkspace.autoSelectActiveBlock,
		graphOpen: state.editorWorkspace.graphOpen,
		rightPanelOpen: state.editorWorkspace.rightPanelOpen,
		selectBlockForEditing: state.editor.selectBlockForEditing,
		setAutoSelectActiveBlock: state.editorWorkspace.setAutoSelectActiveBlock,
		setGraphOpen: state.editorWorkspace.setGraphOpen,
		setRightPanelOpen: state.editorWorkspace.setRightPanelOpen,
	}));
	const activity = useTaleAppStore((state) => state.runtime.activity);
	const activeBlockId = useTaleReaderStore(
		(state) => state.navigation.current?.blockId ?? null,
	);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const saveDraft = api.taleReader.editor.saveDraft.useMutation();
	const status = saveDraft.isPending
		? "Saving"
		: saveDraft.isError
			? "Save failed"
			: dirty
				? "Unsaved"
				: "Saved";

	const save = (): void => {
		saveDraft.mutate(createTaleEditorDraftPayload(tale), {
			onSuccess: markSaved,
		});
	};
	const selectActivePreviewBlock = useCallback(
		(blockId: string): void => {
			selectBlockForEditing(blockId);
			setRightPanelOpen(true);
		},
		[selectBlockForEditing, setRightPanelOpen],
	);

	useAutoSelectActiveBlock({
		activeBlockId,
		enabled: autoSelectActiveBlock && previewOpen,
		onSelectBlock: selectActivePreviewBlock,
	});

	if (activity === "editing") {
		return (
			<>
				<AutoHideTopBar
					clerkMenu
					pinOnBackgroundClick
					collapsedContent={
						<EditorToolbarHeader
							breakpointId={breakpointId}
							breakpoints={tale.breakpoints}
							dirtyStatus={status}
							graphOpen={graphOpen}
							previewOpen={previewOpen}
							rightPanelOpen={rightPanelOpen}
							savePending={saveDraft.isPending}
							autoSelectActiveBlock={autoSelectActiveBlock}
							onBreakpointChange={setBreakpointId}
							onAutoSelectActiveBlockChange={setAutoSelectActiveBlock}
							onGraphOpenChange={setGraphOpen}
							onPreviewOpenChange={setPreviewOpen}
							onRightPanelOpenChange={setRightPanelOpen}
							onSave={save}
							onSettingsOpen={() => setSettingsOpen(true)}
						/>
					}
				>
					<Header />
				</AutoHideTopBar>

				<EditorSettingsModal
					open={settingsOpen}
					onClose={() => setSettingsOpen(false)}
				/>
			</>
		);
	}

	return (
		<AutoHideTopBar clerkMenu pinOnBackgroundClick>
			<header
				data-reader-component="EditorModeToolbar"
				data-reader-role="editor-toolbar"
				className="relative z-60 flex min-h-16 flex-wrap items-center justify-between gap-3 border-foreground/10 border-b bg-background/95 px-3 py-2 text-foreground backdrop-blur-md sm:px-4"
			>
				<div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
					<div className="hidden shrink-0 sm:block">
						<Logo />
					</div>
					<Link
						href="/"
						className="font-bold text-foreground text-sm sm:hidden"
					>
						Talescape
					</Link>
					<EditorActivitySwitcher />
				</div>
				<div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
					{tale.breakpoints.length > 1 ? (
						<BreakpointSelect
							breakpointId={breakpointId}
							breakpoints={tale.breakpoints}
							onChange={setBreakpointId}
						/>
					) : null}
					<span className="text-foreground/42 text-xs">{status}</span>
					<button
						type="button"
						disabled={saveDraft.isPending}
						className="flex h-9 items-center gap-2 rounded border border-primary/45 bg-primary/14 px-3 font-semibold text-primary text-xs disabled:opacity-45"
						onClick={save}
					>
						<Save size={14} />
						Save
					</button>
					<div className="ml-4 flex items-center gap-1.5 border-foreground/10 border-l pl-4">
						<ThemeToggle />
						<AuthStatus />
					</div>
				</div>
			</header>
			<EditorSettingsModal
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
			/>
		</AutoHideTopBar>
	);
}

/**
 * Selects the active preview block after navigation has settled for a short
 * delay.
 *
 * @param options - Auto-selection configuration.
 * @param options.activeBlockId - Current reader preview block id.
 * @param options.enabled - Whether automatic selection is enabled.
 * @param options.onSelectBlock - Receives the block id to inspect.
 * @returns Nothing.
 *
 * @example
 * useAutoSelectActiveBlock({ activeBlockId, enabled, onSelectBlock });
 */
function useAutoSelectActiveBlock({
	activeBlockId,
	enabled,
	onSelectBlock,
}: {
	activeBlockId: string | null;
	enabled: boolean;
	onSelectBlock: (blockId: string) => void;
}): void {
	useEffect(() => {
		if (!enabled || !activeBlockId) return;
		const timeout = window.setTimeout(() => {
			onSelectBlock(activeBlockId);
		}, 260);
		return () => window.clearTimeout(timeout);
	}, [activeBlockId, enabled, onSelectBlock]);
}

/**
 * Renders the editing-only toolbar that sits below the main site header.
 *
 * @param props - Editing toolbar state and actions.
 * @returns Editing mode toolbar header.
 */
function EditorToolbarHeader({
	breakpointId,
	breakpoints,
	dirtyStatus,
	autoSelectActiveBlock,
	graphOpen,
	onAutoSelectActiveBlockChange,
	onBreakpointChange,
	onGraphOpenChange,
	onPreviewOpenChange,
	onRightPanelOpenChange,
	onSave,
	onSettingsOpen,
	previewOpen,
	rightPanelOpen,
	savePending,
}: {
	autoSelectActiveBlock: boolean;
	breakpointId: string | null;
	breakpoints: { id: string; label: string }[];
	dirtyStatus: string;
	graphOpen: boolean;
	onAutoSelectActiveBlockChange: (enabled: boolean) => void;
	onBreakpointChange: (breakpointId: string | null) => void;
	onGraphOpenChange: (open: boolean) => void;
	onPreviewOpenChange: (open: boolean) => void;
	onRightPanelOpenChange: (open: boolean) => void;
	onSave: () => void;
	onSettingsOpen: () => void;
	previewOpen: boolean;
	rightPanelOpen: boolean;
	savePending: boolean;
}): React.JSX.Element {
	return (
		<header
			data-reader-component="EditorModeToolbar"
			data-reader-role="editor-toolbar"
			className="relative z-60 flex min-h-16 flex-wrap items-center justify-between gap-3 border-foreground/10 border-b bg-background/95 px-3 py-2 text-foreground shadow-sm backdrop-blur-md sm:px-4"
		>
			<div className="flex min-w-0 flex-wrap items-center gap-2 font-medium text-lg sm:gap-4">
				<div className="hidden sm:block">
					<Logo />
				</div>
				<Separator className="hidden h-8 sm:block" />
				<div className="flex min-w-0 items-center gap-2 sm:gap-3">
					<EditorActivitySwitcher />
				</div>
				{previewOpen ? <EditorPreviewSelectionControls /> : null}
			</div>
			<div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
				{previewOpen ? (
					<button
						type="button"
						aria-pressed={autoSelectActiveBlock}
						className={[
							"flex h-9 items-center gap-2 rounded border px-2.5 font-semibold text-xs transition",
							autoSelectActiveBlock
								? "border-primary/45 bg-primary/14 text-primary"
								: "border-foreground/12 text-foreground/58 hover:bg-foreground/8 hover:text-foreground",
						].join(" ")}
						title="Automatically inspect the active preview block after scrolling settles"
						onClick={() =>
							onAutoSelectActiveBlockChange(!autoSelectActiveBlock)
						}
					>
						<Target size={14} />
						Auto select
					</button>
				) : null}
				{breakpoints.length > 1 ? (
					<BreakpointSelect
						breakpointId={breakpointId}
						breakpoints={breakpoints}
						onChange={onBreakpointChange}
					/>
				) : null}
				<EditorSurfaceVisibilityControls
					graphOpen={graphOpen}
					previewOpen={previewOpen}
					rightPanelOpen={rightPanelOpen}
					onGraphOpenChange={onGraphOpenChange}
					onPreviewOpenChange={onPreviewOpenChange}
					onRightPanelOpenChange={onRightPanelOpenChange}
				/>

				<span className="text-foreground/55 text-xs">{dirtyStatus}</span>
				<button
					type="button"
					disabled={savePending}
					className="flex h-9 items-center gap-2 rounded border border-primary/45 bg-primary/14 px-3 font-semibold text-primary text-xs disabled:opacity-45"
					onClick={onSave}
				>
					<Save size={14} />
					Save
				</button>
				<button
					type="button"
					aria-label="Open editor settings"
					className="grid h-9 w-9 place-items-center rounded border border-foreground/12 text-foreground/58 hover:bg-foreground/8 hover:text-foreground"
					onClick={onSettingsOpen}
				>
					<Settings size={15} />
				</button>
			</div>
		</header>
	);
}

/**
 * Selects the active responsive breakpoint preview used by the editor.
 *
 * @param props - Breakpoint selector props.
 * @returns Breakpoint select control.
 */
function BreakpointSelect({
	breakpointId,
	breakpoints,
	onChange,
}: {
	breakpointId: string | null;
	breakpoints: { id: string; label: string }[];
	onChange: (breakpointId: string | null) => void;
}): React.JSX.Element {
	return (
		<label className="flex min-w-0 items-center gap-2 text-foreground/62 text-xs">
			<span className="font-medium">Breakpoint</span>
			<select
				className="h-9 min-w-0 max-w-36 rounded border border-foreground/12 bg-background px-2 text-foreground text-xs outline-none"
				value={breakpointId ?? ""}
				onChange={(event) => onChange(event.target.value || null)}
			>
				<option value="">Base</option>
				{breakpoints.map((breakpoint) => (
					<option key={breakpoint.id} value={breakpoint.id}>
						{breakpoint.label}
					</option>
				))}
			</select>
		</label>
	);
}

/**
 * Renders top-bar controls for editor surface pane visibility.
 *
 * @param props - Visibility control state and actions.
 * @param props.graphOpen - Whether the flow graph pane is visible.
 * @param props.onGraphOpenChange - Receives flow graph visibility changes.
 * @param props.onPreviewOpenChange - Receives preview pane visibility changes.
 * @param props.onRightPanelOpenChange - Receives editor sidebar visibility changes.
 * @param props.previewOpen - Whether the reader preview pane is visible.
 * @param props.rightPanelOpen - Whether the editor sidebar is visible.
 * @returns Grouped editor surface visibility buttons.
 *
 * @example
 * <EditorSurfaceVisibilityControls previewOpen graphOpen rightPanelOpen />
 */
function EditorSurfaceVisibilityControls({
	graphOpen,
	onGraphOpenChange,
	onPreviewOpenChange,
	onRightPanelOpenChange,
	previewOpen,
	rightPanelOpen,
}: {
	graphOpen: boolean;
	onGraphOpenChange: (open: boolean) => void;
	onPreviewOpenChange: (open: boolean) => void;
	onRightPanelOpenChange: (open: boolean) => void;
	previewOpen: boolean;
	rightPanelOpen: boolean;
}): React.JSX.Element {
	const visiblePaneCount = [previewOpen, graphOpen, rightPanelOpen].filter(
		Boolean,
	).length;
	const previewRequired = previewOpen && visiblePaneCount === 1;
	const graphRequired = graphOpen && visiblePaneCount === 1;
	const rightPanelRequired = rightPanelOpen && visiblePaneCount === 1;

	return (
		<div
			data-reader-component="EditorSurfaceVisibilityControls"
			data-reader-role="editor-pane-visibility"
			className="flex min-w-0 overflow-hidden rounded border border-foreground/12 bg-background/90"
		>
			<VisibilityButton
				active={previewOpen}
				disabled={previewRequired}
				label="Preview"
				onClick={() => onPreviewOpenChange(!previewOpen)}
			>
				<SquareMousePointer size={14} />
			</VisibilityButton>
			<VisibilityButton
				active={graphOpen}
				disabled={graphRequired}
				label="Flow graph"
				onClick={() => onGraphOpenChange(!graphOpen)}
			>
				<GitBranch size={14} />
			</VisibilityButton>
			<VisibilityButton
				active={rightPanelOpen}
				disabled={rightPanelRequired}
				label="Editor sidebar"
				onClick={() => onRightPanelOpenChange(!rightPanelOpen)}
			>
				{rightPanelOpen ? (
					<PanelRightClose size={14} />
				) : (
					<PanelRightOpen size={14} />
				)}
			</VisibilityButton>
		</div>
	);
}

/**
 * Renders one compact toggle button for editor pane visibility.
 *
 * @param props - Toggle button properties.
 * @param props.active - Whether the controlled pane is currently visible.
 * @param props.children - Button icon.
 * @param props.label - Accessible button label.
 * @param props.onClick - Toggle callback.
 * @returns A toolbar toggle button.
 *
 * @example
 * <VisibilityButton active label="Preview" onClick={toggle} />
 */
function VisibilityButton({
	active,
	children,
	disabled = false,
	label,
	onClick,
}: {
	active: boolean;
	children: ReactNode;
	disabled?: boolean;
	label: string;
	onClick: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			aria-pressed={active}
			disabled={disabled}
			aria-label={label}
			title={label}
			className={`grid h-9 w-10 place-items-center border-foreground/10 border-r text-xs transition last:border-r-0 disabled:cursor-not-allowed disabled:opacity-45 ${
				active
					? "bg-primary/16 text-primary"
					: "text-foreground/62 hover:bg-foreground/8 hover:text-foreground"
			}`}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
