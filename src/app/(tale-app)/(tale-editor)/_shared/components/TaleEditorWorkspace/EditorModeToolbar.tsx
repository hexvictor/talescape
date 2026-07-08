"use client";
import {
	GitBranch,
	Menu,
	PanelRightClose,
	PanelRightOpen,
	Save,
	Settings,
	SquareMousePointer,
	Target,
} from "lucide-react";
import Link from "next/link";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createTaleEditorDraftPayload } from "~/app/(tale-app)/(tale-editor)/_shared/services/createTaleEditorDraftPayload";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import AppMenu, { AppMenuItem } from "~/components/layout/AppMenu/AppMenu";
import AutoHideTopBar from "~/components/layout/AutoHideTopBar/AutoHideTopBar";
import Logo from "~/components/ui/Logo";
import ThemeToggle from "~/components/ui/ThemeToggle";
import Separator from "~/components/ui/separator";
import { useAppStore } from "~/contexts/AppStoreContext";
import { AuthStatus } from "~/features/auth/components";
import { api } from "~/trpc/react";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import { EditorActivitySwitcher } from "./EditorActivitySwitcher";
import { EditorPreviewSelectionControls } from "./EditorPreviewSelectionControls";
import { EditorSettingsModal } from "./EditorSettingsModal";
import { ExportTaleButton, ImportTaleButton } from "./TaleFileButtons";

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
	const isMobile = useAppStore((state) => state.derived.isMobile);
	const activeBlockId = useTaleReaderStore(
		(state) => state.navigation.current?.blockId ?? null,
	);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
	const [mobileSiteMenuOpen, setMobileSiteMenuOpen] = useState(false);
	const [savedNoticeVisible, setSavedNoticeVisible] = useState(false);
	const saveDraft = api.taleReader.editor.saveDraft.useMutation();
	const status = saveDraft.isPending
		? "Saving"
		: saveDraft.isError
			? "Save failed"
			: dirty
				? "Save"
				: savedNoticeVisible
					? "Saved"
					: "Save";

	const save = (): void => {
		saveDraft.mutate(createTaleEditorDraftPayload(tale), {
			onSuccess: () => {
				markSaved();
				setSavedNoticeVisible(true);
				window.setTimeout(() => setSavedNoticeVisible(false), 2400);
			},
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
				<div
					data-reader-component="EditorModeToolbar"
					data-reader-role="editing-header-stack"
					className="relative z-60 border-foreground/10 border-b bg-background text-foreground shadow-sm"
				>
					<EditorToolbarHeader
						breakpointId={breakpointId}
						breakpoints={tale.breakpoints}
						dirtyStatus={status}
						graphOpen={graphOpen}
						mobileControlsOpen={mobileControlsOpen}
						mobileSiteMenuOpen={mobileSiteMenuOpen}
						menuOpen={menuOpen}
						previewOpen={previewOpen}
						rightPanelOpen={rightPanelOpen}
						savePending={saveDraft.isPending}
						autoSelectActiveBlock={autoSelectActiveBlock}
						onBreakpointChange={setBreakpointId}
						onAutoSelectActiveBlockChange={setAutoSelectActiveBlock}
						onGraphOpenChange={setGraphOpen}
						onMobileControlsOpenChange={setMobileControlsOpen}
						onMobileSiteMenuOpenChange={setMobileSiteMenuOpen}
						setMenuOpen={setMenuOpen}
						onPreviewOpenChange={setPreviewOpen}
						onRightPanelOpenChange={setRightPanelOpen}
						onSave={save}
						onSettingsOpen={() => setSettingsOpen(true)}
					/>
				</div>
				{saveDraft.isPending ? <EditorSavingBackdrop /> : null}

				<EditorSettingsModal
					open={settingsOpen}
					onClose={() => setSettingsOpen(false)}
				/>
			</>
		);
	}

	if (isMobile) {
		return (
			<>
				<MobileEditorReadingToolbar
					breakpointId={breakpointId}
					breakpoints={tale.breakpoints}
					dirtyStatus={status}
					savePending={saveDraft.isPending}
					onBreakpointChange={setBreakpointId}
					onSave={save}
					onSettingsOpen={() => setSettingsOpen(true)}
				/>
				<EditorSettingsModal
					open={settingsOpen}
					onClose={() => setSettingsOpen(false)}
				/>
				{saveDraft.isPending ? <EditorSavingBackdrop /> : null}
			</>
		);
	}

	return (
		<>
			<AutoHideTopBar
				clerkMenu
				pinOnBackgroundClick
				revealZoneClassName="hidden md:block"
				wrapperClassName="fixed top-0 left-0 z-1000 hidden w-full md:block"
			>
				<header
					data-reader-component="EditorModeToolbar"
					data-reader-role="editor-reading-toolbar"
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
						<Separator className="hidden h-8 md:block" />
						<EditorActivitySwitcher />
					</div>
					<div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
						<AppMenu
							showLogo={false}
							showFooterActions={false}
							menuOpen={menuOpen}
							onMenuOpenChange={setMenuOpen}
							data-reader-role="editor-toolbar-settings-menu"
							buttonClassName="grid h-9 w-9 place-items-center rounded border border-foreground/12 text-foreground/70 hover:bg-foreground/8 hover:text-foreground"
							collapsedIcon={<Settings size={15} />}
							expandedIcon={<Settings size={15} />}
							menuPlacement="bottom-left"
						>
							<div className="grid gap-1">
								<AppMenuItem hover={false}>
									<BreakpointSelect
										breakpointId={breakpointId}
										breakpoints={tale.breakpoints}
										onChange={setBreakpointId}
									/>
								</AppMenuItem>
								<AppMenuItem hover={false}>
									<ExportTaleButton className="w-full" />
								</AppMenuItem>
								<AppMenuItem hover={false}>
									<ImportTaleButton className="w-full" />
								</AppMenuItem>
								<AppMenuItem hover={false}>
									<button
										type="button"
										disabled={saveDraft.isPending}
										className="flex h-9 items-center gap-2 rounded border border-primary/45 bg-primary/14 px-3 font-semibold text-primary text-xs disabled:opacity-45"
										onClick={save}
									>
										<Save size={14} />
										{status}
									</button>
								</AppMenuItem>
							</div>
						</AppMenu>

						<Separator className="hidden h-8 md:block" />
						<div className="flex items-center gap-1.5">
							<ThemeToggle />
							<AuthStatus />
						</div>
					</div>
				</header>
			</AutoHideTopBar>
			<EditorSettingsModal
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
			/>
			{saveDraft.isPending ? <EditorSavingBackdrop /> : null}
		</>
	);
}

/**
 * Blocks editor interaction while a tale save mutation is in flight.
 *
 * @returns Fullscreen saving backdrop.
 *
 * @example
 * <EditorSavingBackdrop />
 */
function EditorSavingBackdrop(): React.JSX.Element {
	return (
		<div
			data-reader-component="EditorSavingBackdrop"
			data-reader-role="saving-blocker"
			className="fixed inset-0 z-[1400] grid place-items-center bg-background/72 text-foreground backdrop-blur-sm"
		>
			<div className="rounded-lg border border-foreground/12 bg-background/96 px-5 py-4 text-center shadow-2xl">
				<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
					Saving
				</p>
				<p className="mt-1 text-foreground/58 text-xs">
					Please wait while the tale is saved.
				</p>
			</div>
		</div>
	);
}

/**
 * Renders the editor reading toolbar on mobile without hover-based auto-hide.
 *
 * @param props - Mobile toolbar state and actions.
 * @returns Compact mobile reading toolbar.
 *
 * @example
 * <MobileEditorReadingToolbar dirtyStatus="Saved" onSave={save} />
 */
function MobileEditorReadingToolbar({
	breakpointId,
	breakpoints,
	dirtyStatus,
	onBreakpointChange,
	onSave,
	onSettingsOpen,
	savePending,
}: {
	breakpointId: string | null;
	breakpoints: { id: string; label: string }[];
	dirtyStatus: string;
	onBreakpointChange: (breakpointId: string | null) => void;
	onSave: () => void;
	onSettingsOpen: () => void;
	savePending: boolean;
}): React.JSX.Element {
	const rootRef = useRef<HTMLElement | null>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const closeOnOutsidePointer = (event: PointerEvent): void => {
			if (rootRef.current?.contains(event.target as Node)) return;
			setOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
		};
	}, [open]);

	return (
		<header
			ref={rootRef}
			data-reader-component="EditorModeToolbar"
			data-reader-role="mobile-reading-toolbar"
			className="fixed top-0 left-0 z-1000 w-full border-foreground/10 border-b bg-background/96 px-3 py-2 text-foreground shadow-sm backdrop-blur-xl"
		>
			<div className="flex h-11 items-center justify-between gap-2">
				<EditorActivitySwitcher />
				<div className="flex items-center gap-2">
					<span className="hidden text-foreground/55 text-xs min-[420px]:inline">
						{dirtyStatus}
					</span>
					<button
						type="button"
						disabled={savePending}
						className="grid h-9 w-9 place-items-center rounded border border-primary/45 bg-primary/14 text-primary disabled:opacity-45"
						aria-label="Save tale"
						onClick={onSave}
					>
						<Save size={14} />
					</button>
					<button
						type="button"
						aria-label="Open editor settings"
						className="grid h-9 w-9 place-items-center rounded border border-foreground/12 text-foreground/70 hover:bg-foreground/8 hover:text-foreground"
						onClick={onSettingsOpen}
					>
						<Settings size={15} />
					</button>
					<button
						type="button"
						aria-expanded={open}
						aria-label="Toggle reading controls"
						className="grid h-9 w-9 place-items-center rounded border border-foreground/12 bg-background text-foreground/76 hover:bg-foreground/8 hover:text-foreground"
						onClick={() => setOpen((current) => !current)}
					>
						<Menu size={16} />
					</button>
				</div>
			</div>
			{open ? (
				<div className="mt-2 grid max-h-[calc(100dvh-5rem)] gap-3 overflow-y-auto rounded-lg border border-foreground/12 bg-background/96 p-3 shadow-2xl">
					<BreakpointSelect
						breakpointId={breakpointId}
						breakpoints={breakpoints}
						onChange={onBreakpointChange}
					/>
					<div className="grid gap-1">
						<AppMenuItem hover={false}>
							<ExportTaleButton className="w-full" />
						</AppMenuItem>
						<AppMenuItem hover={false}>
							<ImportTaleButton className="w-full" />
						</AppMenuItem>
					</div>
					<MobileSiteActions />
				</div>
			) : null}
		</header>
	);
}

/**
 * Renders compact site-level actions for mobile editor menus.
 *
 * @returns Theme, account, and primary navigation controls.
 *
 * @example
 * <MobileSiteActions />
 */
function MobileSiteActions(): React.JSX.Element {
	return (
		<div
			data-reader-component="EditorModeToolbar"
			data-reader-role="mobile-site-actions"
			className="grid gap-3 border-foreground/10 border-t pt-3"
		>
			<div className="flex items-center gap-3">
				<Logo />
				<div className="min-w-0">
					<p className="font-semibold text-sm">Talescape</p>
					<div className="mt-1 flex gap-3 text-foreground/58 text-xs">
						<Link href="/library" className="hover:text-foreground">
							Library
						</Link>
						<Link href="/codex" className="hover:text-foreground">
							Codex
						</Link>
					</div>
				</div>
			</div>
			<div className="flex items-center justify-between gap-3">
				<ThemeToggle />
				<AuthStatus />
			</div>
		</div>
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
	mobileControlsOpen,
	mobileSiteMenuOpen,
	menuOpen,
	onAutoSelectActiveBlockChange,
	onBreakpointChange,
	onGraphOpenChange,
	onMobileControlsOpenChange,
	onMobileSiteMenuOpenChange,
	setMenuOpen,
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
	mobileControlsOpen: boolean;
	mobileSiteMenuOpen: boolean;
	menuOpen: boolean;
	onAutoSelectActiveBlockChange: (enabled: boolean) => void;
	onBreakpointChange: (breakpointId: string | null) => void;
	onGraphOpenChange: (open: boolean) => void;
	onMobileControlsOpenChange: (open: boolean) => void;
	onMobileSiteMenuOpenChange: (open: boolean) => void;
	setMenuOpen: (open: boolean) => void;
	onPreviewOpenChange: (open: boolean) => void;
	onRightPanelOpenChange: (open: boolean) => void;
	onSave: () => void;
	onSettingsOpen: () => void;
	previewOpen: boolean;
	rightPanelOpen: boolean;
	savePending: boolean;
}): React.JSX.Element {
	const rootRef = useRef<HTMLElement | null>(null);
	useEffect(() => {
		if (!mobileControlsOpen && !mobileSiteMenuOpen) return;
		const closeOnOutsidePointer = (event: PointerEvent): void => {
			if (rootRef.current?.contains(event.target as Node)) return;
			onMobileControlsOpenChange(false);
			onMobileSiteMenuOpenChange(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
		};
	}, [
		mobileControlsOpen,
		mobileSiteMenuOpen,
		onMobileControlsOpenChange,
		onMobileSiteMenuOpenChange,
	]);

	const middleControls = (
		<>
			{previewOpen ? <EditorPreviewSelectionControls /> : null}
			{previewOpen ? (
				<button
					type="button"
					aria-pressed={autoSelectActiveBlock}
					className={[
						"flex h-9 items-center justify-center gap-2 rounded border px-2.5 font-semibold text-xs transition",
						autoSelectActiveBlock
							? "border-primary/45 bg-primary/14 text-primary"
							: "border-foreground/12 text-foreground/62 hover:bg-foreground/8 hover:text-foreground",
					].join(" ")}
					title="Automatically inspect the active block"
					onClick={() => onAutoSelectActiveBlockChange(!autoSelectActiveBlock)}
				>
					<Target size={14} />
				</button>
			) : null}
			<EditorSurfaceVisibilityControls
				graphOpen={graphOpen}
				previewOpen={previewOpen}
				rightPanelOpen={rightPanelOpen}
				onGraphOpenChange={onGraphOpenChange}
				onPreviewOpenChange={onPreviewOpenChange}
				onRightPanelOpenChange={onRightPanelOpenChange}
			/>
		</>
	);

	return (
		<header
			ref={rootRef}
			data-reader-component="EditorModeToolbar"
			data-reader-role="editor-toolbar"
			className="relative z-60 grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-2 bg-background/95 px-3 py-2 text-foreground backdrop-blur-md sm:px-4"
		>
			<div className="flex min-w-0 items-center gap-2">
				<Link href="/" className="hidden min-w-0 items-center gap-2 md:flex">
					<Logo />
				</Link>
				<Separator className="hidden h-8 md:block" />
				<EditorActivitySwitcher />
			</div>
			<div className="hidden min-w-0 items-center justify-center gap-2 md:flex">
				{middleControls}
			</div>
			<div className="hidden min-w-0 items-center justify-end gap-2 md:flex">
				<AppMenu
					showLogo={false}
					showFooterActions={false}
					menuOpen={menuOpen}
					onMenuOpenChange={setMenuOpen}
					data-reader-role="editor-toolbar-settings-menu"
					buttonClassName="grid h-9 w-9 place-items-center rounded border border-foreground/12 text-foreground/70 hover:bg-foreground/8 hover:text-foreground"
					collapsedIcon={<Settings size={15} />}
					expandedIcon={<Settings size={15} />}
					menuPlacement="bottom-left"
				>
					<div className="grid gap-1">
						<AppMenuItem hover={false}>
							<BreakpointSelect
								breakpointId={breakpointId}
								breakpoints={breakpoints}
								onChange={onBreakpointChange}
							/>
						</AppMenuItem>
						<AppMenuItem hover={false}>
							<ExportTaleButton className="w-full" />
						</AppMenuItem>
						<AppMenuItem hover={false}>
							<ImportTaleButton className="w-full" />
						</AppMenuItem>
						<AppMenuItem hover={false}>
							<button
								type="button"
								className="flex h-9 w-full items-center justify-center gap-2 rounded border border-foreground/12 px-2.5 font-semibold text-foreground/68 text-xs hover:bg-foreground/8 hover:text-foreground"
								onClick={onSettingsOpen}
							>
								Settings
							</button>
						</AppMenuItem>
						<AppMenuItem hover={false}>
							<button
								type="button"
								disabled={savePending}
								className="flex h-9 w-full items-center justify-center gap-2 rounded border border-primary/45 bg-primary/14 px-3 font-semibold text-primary text-xs disabled:opacity-45"
								onClick={onSave}
							>
								<Save size={14} />
								{dirtyStatus}
							</button>
						</AppMenuItem>
					</div>
				</AppMenu>
				<Separator className="h-8" />
				<ThemeToggle />
				<AuthStatus />
			</div>
			<div className="flex min-w-0 items-center gap-2 md:hidden">
				<button
					type="button"
					disabled={savePending}
					className="flex h-9 min-w-9 items-center justify-center gap-1 rounded border border-primary/45 bg-primary/14 px-2 text-primary text-xs disabled:opacity-45"
					aria-label="Save tale"
					onClick={onSave}
				>
					<Save size={14} />
					{dirtyStatus !== "Save" ? (
						<span className="max-w-16 truncate">{dirtyStatus}</span>
					) : null}
				</button>
				<button
					type="button"
					aria-expanded={mobileSiteMenuOpen}
					aria-label="Open site menu"
					className="grid h-9 w-9 place-items-center rounded border border-foreground/12 text-foreground/70 hover:bg-foreground/8 hover:text-foreground"
					onClick={() => onMobileSiteMenuOpenChange(!mobileSiteMenuOpen)}
				>
					<Menu size={16} />
				</button>
				<button
					type="button"
					aria-expanded={mobileControlsOpen}
					aria-label="Toggle editor header controls"
					className="grid h-9 w-9 place-items-center rounded border border-foreground/12 bg-background text-foreground/76 hover:bg-foreground/8 hover:text-foreground"
					onClick={() => onMobileControlsOpenChange(!mobileControlsOpen)}
				>
					<Settings size={15} />
				</button>
			</div>
			{mobileSiteMenuOpen ? (
				<div className="absolute top-full right-3 left-3 z-70 grid max-h-[calc(100dvh-5rem)] gap-3 overflow-y-auto rounded-lg border border-foreground/12 bg-background/96 p-3 shadow-2xl backdrop-blur-xl md:hidden">
					<MobileSiteActions />
				</div>
			) : null}
			{mobileControlsOpen ? (
				<div className="absolute top-full right-3 left-3 z-70 grid max-h-[calc(100dvh-5rem)] gap-3 overflow-y-auto rounded-lg border border-foreground/12 bg-background/96 p-3 shadow-2xl backdrop-blur-xl md:hidden">
					<div className="flex flex-wrap items-center gap-2">
						{middleControls}
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<ExportTaleButton />
						<ImportTaleButton />
						<BreakpointSelect
							breakpointId={breakpointId}
							breakpoints={breakpoints}
							onChange={onBreakpointChange}
						/>
						<button
							type="button"
							aria-label="Open editor settings"
							className="grid h-9 w-9 place-items-center rounded border border-foreground/12 text-foreground/58 hover:bg-foreground/8 hover:text-foreground"
							onClick={onSettingsOpen}
						>
							<Settings size={15} />
						</button>
					</div>
				</div>
			) : null}
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
}): React.JSX.Element | null {
	return breakpoints.length > 1 ? (
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
	) : null;
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
