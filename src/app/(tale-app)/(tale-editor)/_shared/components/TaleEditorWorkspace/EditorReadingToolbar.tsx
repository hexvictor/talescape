"use client";

import clsx from "clsx";
import { Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AppMenu, { AppMenuItem } from "~/components/layout/AppMenu/AppMenu";
import AutoHideTopBar from "~/components/layout/AutoHideTopBar/AutoHideTopBar";
import Logo from "~/components/ui/Logo";
import ThemeToggle from "~/components/ui/ThemeToggle";
import Separator from "~/components/ui/separator";
import { useAppStore } from "~/contexts/AppStoreContext";
import { AuthStatus } from "~/features/auth/components";
import { BreakpointSelect } from "./BreakpointSelect";
import { EditorActivitySwitcher } from "./EditorActivitySwitcher";
import { EditorMobileSiteActions } from "./EditorMobileSiteActions";
import EditorSaveButton from "./EditorSaveButton";
import { useEditorToolbarActions } from "./EditorToolbarActionsContext";
import { EditorToolbarSettingsMenuItems } from "./EditorToolbarSettingsMenu";
import { ExportTaleButton, ImportTaleButton } from "./TaleFileButtons";

/**
 * Renders the editor reading toolbar variant for the current viewport.
 *
 * @returns Desktop or mobile editor reading toolbar.
 *
 * @example
 * <EditorReadingToolbar />
 */
export function EditorReadingToolbar(): React.JSX.Element {
	const isMobile = useAppStore((state) => state.derived.isMobile);

	return isMobile ? (
		<MobileEditorReadingToolbar />
	) : (
		<DesktopEditorReadingToolbar />
	);
}

/**
 * Renders the desktop editor reading toolbar inside the auto-hide top bar.
 *
 * @returns Desktop reading mode toolbar.
 *
 * @example
 * <DesktopEditorReadingToolbar />
 */
function DesktopEditorReadingToolbar(): React.JSX.Element {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
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
						<EditorToolbarSettingsMenuItems />
					</AppMenu>

					<Separator className="hidden h-8 md:block" />
					<div className="flex items-center gap-1.5">
						<ThemeToggle />
						<AuthStatus />
					</div>
				</div>
			</header>
		</AutoHideTopBar>
	);
}

/**
 * Renders the editor reading toolbar on mobile without hover-based auto-hide.
 *
 * @returns Compact mobile reading toolbar.
 *
 * @example
 * <MobileEditorReadingToolbar />
 */
function MobileEditorReadingToolbar(): React.JSX.Element {
	const rootRef = useRef<HTMLElement | null>(null);
	const [open, setOpen] = useState(false);
	const [controlsOpen, setControlsOpen] = useState(false);

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

	useEffect(() => {
		if (!controlsOpen) return;
		const closeOnOutsidePointer = (event: PointerEvent): void => {
			if (rootRef.current?.contains(event.target as Node)) return;
			setControlsOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
		};
	}, [controlsOpen]);

	return (
		<header
			ref={rootRef}
			data-reader-component="EditorModeToolbar"
			data-reader-role="mobile-reading-toolbar"
			className="fixed top-0 left-0 z-1000 w-full border-foreground/10 border-b bg-background/96 px-3 py-2 text-foreground shadow-sm backdrop-blur-xl"
		>
			<div className="flex h-11 items-center justify-between gap-2">
				<EditorActivitySwitcher />
				<MobileEditorReadingButtons
					menuOpen={open}
					onMenuOpenChange={() => {
						setControlsOpen(false);
						setOpen((open) => !open);
					}}
					controlsOpen={controlsOpen}
					onControlsOpenChange={() => {
						setOpen(false);
						setControlsOpen((open) => !open);
					}}
				/>
			</div>
			{open ? <MobileEditorReadingPanel /> : null}
			{controlsOpen ? (
				<MobileEditorReadingControlsPanel
					closePanel={() => setControlsOpen(false)}
				/>
			) : null}
		</header>
	);
}

/**
 * Renders compact mobile reading toolbar action buttons.
 *
 * @param props - Mobile reading menu state.
 * @param props.menuOpen - Whether the extra reading controls are open.
 * @param props.onMenuOpenChange - Receives mobile menu visibility changes.
 * @param props.controlsOpen - Whether the extra reading controls are open.
 * @param props.onControlsOpenChange - Receives mobile controls visibility changes.
 * @returns Mobile reading toolbar buttons.
 *
 * @example
 * <MobileEditorReadingButtons menuOpen={false} onMenuOpenChange={setOpen} />
 */
function MobileEditorReadingButtons({
	menuOpen,
	onMenuOpenChange,
	controlsOpen,
	onControlsOpenChange,
}: {
	menuOpen: boolean;
	onMenuOpenChange: () => void;
	controlsOpen: boolean;
	onControlsOpenChange: () => void;
}): React.JSX.Element {
	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				aria-label="Open editor settings"
				className={clsx(
					"grid h-9 w-9 place-items-center rounded ",
					controlsOpen
						? "bg-foreground text-background"
						: "border border-foreground/10 text-foreground/60 hover:bg-foreground/8 hover:text-foreground",
				)}
				onClick={onControlsOpenChange}
			>
				<Settings size={15} />
			</button>
			<button
				type="button"
				aria-expanded={menuOpen}
				aria-label="Toggle reading controls"
				className={clsx(
					"grid h-9 w-9 place-items-center rounded ",
					menuOpen
						? "bg-foreground text-background"
						: "border border-foreground/10 text-foreground/60 hover:bg-foreground/8 hover:text-foreground",
				)}
				onClick={onMenuOpenChange}
			>
				<Menu size={16} />
			</button>
		</div>
	);
}

/**
 * Renders the expanded mobile reading controls panel.
 *
 * @returns Mobile reading controls panel.
 *
 * @example
 * <MobileEditorReadingPanel />
 */
function MobileEditorReadingPanel(): React.JSX.Element {
	return (
		<div className="mt-2 flex max-h-[calc(100dvh-5rem)] flex-col gap-3 overflow-y-auto rounded-lg border border-foreground/12 bg-background/96 p-3 shadow-2xl">
			<EditorMobileSiteActions />
		</div>
	);
}
/**
 * Renders the expanded mobile reading controls panel.
 *
 * @returns Mobile reading controls panel.
 *
 * @example
 * <MobileEditorReadingPanel />
 */
function MobileEditorReadingControlsPanel({
	closePanel,
}: { closePanel: () => void }): React.JSX.Element {
	const { openSettings } = useEditorToolbarActions();
	return (
		<div className="mt-2 flex max-h-[calc(100dvh-5rem)] flex-col gap-3 overflow-y-auto rounded-lg border border-foreground/12 bg-background/96 p-3 shadow-2xl">
			<div className="grid gap-1">
				<AppMenuItem hover={false}>
					<BreakpointSelect className="w-full" />
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
						aria-label="Open editor settings"
						className="flex h-9 w-full items-center justify-center gap-2 rounded border border-foreground/12 px-2.5 font-semibold text-foreground/68 text-xs hover:bg-foreground/8 hover:text-foreground"
						onClick={() => {
							closePanel();
							openSettings();
						}}
					>
						<Settings size={14} />
						Settings
					</button>
				</AppMenuItem>
				<AppMenuItem hover={false}>
					<EditorSaveButton className="w-full" />
				</AppMenuItem>
			</div>
		</div>
	);
}
