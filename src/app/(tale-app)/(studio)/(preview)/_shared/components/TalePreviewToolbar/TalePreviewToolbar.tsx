"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TaleStudioBreakpointSelect } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioBreakpointSelect";
import {
	ExportTaleButton,
	ImportTaleButton,
} from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioDocumentButtons";
import { TaleStudioSaveButton } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioSaveButton";
import { TaleStudioToolbarSettingsMenuItems } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioToolbarSettingsMenu";
import { TaleStudioWorkspaceSwitcher } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioWorkspaceSwitcher";
import { useTaleStudio } from "~/app/(tale-app)/(studio)/_shared/contexts/TaleStudioProvider";
import { AuthStatus } from "~/app/_shared/auth/components";
import AppMenu, {
	AppMenuItem,
} from "~/app/_shared/components/layout/AppMenu/AppMenu";
import AutoHideTopBar from "~/app/_shared/components/layout/AutoHideTopBar/AutoHideTopBar";
import Logo from "~/app/_shared/components/layout/Logo";
import ThemeToggle from "~/app/_shared/components/layout/ThemeToggle";
import { useTaleRootStore } from "~/app/_shared/contexts/TaleRootStoreContext";
import Separator from "~/components/layout/separator";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";

/**
 * Renders the Tale Preview toolbar variant for the current viewport.
 *
 * @returns Desktop or mobile preview toolbar.
 *
 * @example
 * <TalePreviewToolbar />
 */
export function TalePreviewToolbar(): React.JSX.Element {
	const isMobile = useTaleRootStore((state) => state.derived.isMobile);

	return isMobile ? (
		<MobileTalePreviewToolbar />
	) : (
		<DesktopTalePreviewToolbar />
	);
}

/**
 * Renders the desktop Tale Preview toolbar inside the auto-hide top bar.
 *
 * @returns Desktop preview workspace toolbar.
 *
 * @example
 * <DesktopTalePreviewToolbar />
 */
function DesktopTalePreviewToolbar(): React.JSX.Element {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<AutoHideTopBar
			clerkMenu
			pinOnBackgroundClick
			revealZoneClassName="hidden md:block"
			wrapperClassName="fixed top-0 left-0 z-1000 hidden w-full md:block"
		>
			<header
				data-reader-component="TalePreviewToolbar"
				data-reader-role="preview-toolbar"
				data-studio-component="TalePreviewToolbar"
				data-studio-role="preview-toolbar"
				className="studio-topbar relative z-60 flex min-h-[4.75rem] flex-wrap items-center justify-between gap-3 border-foreground border-b-[3px] bg-card px-3 py-2 text-foreground shadow-[0_4px_0_var(--secondary)] sm:px-4"
			>
				<div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
					<div className="hidden shrink-0 sm:block">
						<Logo />
					</div>
					<Logo variant="mark" markClassName="h-10" className="sm:hidden" />
					<Separator className="hidden h-8 md:block" />
					<TaleStudioWorkspaceSwitcher />
				</div>
				<div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
					<AppMenu
						showLogo={false}
						showFooterActions={false}
						menuOpen={menuOpen}
						onMenuOpenChange={setMenuOpen}
						data-reader-role="preview-toolbar-settings-menu"
						buttonClassName="grid h-11 w-11 place-items-center border-2 border-foreground bg-card text-foreground shadow-[3px_3px_0_rgb(var(--foreground-rgb))] hover:bg-accent"
						collapsedIcon={<Settings size={15} />}
						expandedIcon={<Settings size={15} />}
						menuPlacement="bottom-left"
					>
						<TaleStudioToolbarSettingsMenuItems />
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
 * Renders the Tale Preview toolbar on mobile without hover-based auto-hide.
 *
 * @returns Compact mobile preview toolbar.
 *
 * @example
 * <MobileTalePreviewToolbar />
 */
function MobileTalePreviewToolbar(): React.JSX.Element {
	const rootRef = useRef<HTMLElement | null>(null);
	const [controlsOpen, setControlsOpen] = useState(false);
	const [toolbarVisible, setToolbarVisible] = useState(true);

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

	useEffect(() => {
		const workspace = rootRef.current?.closest<HTMLElement>(
			"[data-reader-role='preview-workspace']",
		);
		workspace?.style.setProperty(
			"--reader-mobile-toolbar-offset",
			toolbarVisible ? "4rem" : "0px",
		);
		if (!toolbarVisible) setControlsOpen(false);
		return () => {
			workspace?.style.removeProperty("--reader-mobile-toolbar-offset");
		};
	}, [toolbarVisible]);

	useEffect(() => {
		let startY: number | null = null;
		let startX = 0;
		const onTouchStart = (event: TouchEvent): void => {
			const touch = event.touches[0];
			if (!touch || touch.clientY > (toolbarVisible ? 72 : 24)) return;
			startY = touch.clientY;
			startX = touch.clientX;
		};
		const onTouchEnd = (event: TouchEvent): void => {
			const touch = event.changedTouches[0];
			if (startY === null || !touch) return;
			const deltaY = touch.clientY - startY;
			const deltaX = touch.clientX - startX;
			startY = null;
			if (Math.abs(deltaY) <= Math.abs(deltaX) || Math.abs(deltaY) < 36) {
				return;
			}
			setToolbarVisible(deltaY > 0);
		};
		window.addEventListener("touchstart", onTouchStart, { passive: true });
		window.addEventListener("touchend", onTouchEnd, { passive: true });
		return () => {
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchend", onTouchEnd);
		};
	}, [toolbarVisible]);

	return (
		<header
			ref={rootRef}
			data-reader-component="TalePreviewToolbar"
			data-reader-role="mobile-preview-toolbar"
			data-studio-component="TalePreviewToolbar"
			data-studio-role="mobile-preview-toolbar"
			className={cn(
				"studio-topbar fixed top-0 left-0 z-1000 w-full border-foreground border-b-[3px] bg-card px-3 py-2 text-foreground shadow-[0_4px_0_var(--secondary)] transition-transform duration-300",
				toolbarVisible ? "translate-y-0" : "-translate-y-full",
			)}
		>
			<div className="flex h-11 items-center justify-between gap-2">
				<TaleStudioWorkspaceSwitcher />
				<Logo variant="mark" markClassName="h-10" className="md:hidden" />
				<div className="flex min-w-0 items-center gap-2 md:hidden">
					<TalePreviewMobileButtons
						controlsOpen={controlsOpen}
						onControlsOpenChange={() => setControlsOpen((open) => !open)}
					/>
					<Separator className="h-8" />
					<ThemeToggle />
					<AuthStatus />
				</div>
			</div>
			{controlsOpen ? (
				<TalePreviewMobileControlsPanel
					closePanel={() => setControlsOpen(false)}
				/>
			) : null}
		</header>
	);
}

/**
 * Renders compact mobile preview toolbar action buttons.
 *
 * @param props - Mobile preview menu state.
 * @param props.controlsOpen - Whether the extra preview controls are open.
 * @param props.onControlsOpenChange - Receives mobile controls visibility changes.
 * @returns Mobile preview toolbar buttons.
 *
 * @example
 * <TalePreviewMobileButtons controlsOpen={false} onControlsOpenChange={toggle} />
 */
function TalePreviewMobileButtons({
	controlsOpen,
	onControlsOpenChange,
}: {
	controlsOpen: boolean;
	onControlsOpenChange: () => void;
}): React.JSX.Element {
	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				aria-label="Open Tale Studio controls"
				className={cn(
					"grid h-11 w-11 place-items-center border-2 border-foreground shadow-[3px_3px_0_rgb(var(--foreground-rgb))]",
					controlsOpen
						? "bg-accent text-accent-foreground"
						: "bg-card text-foreground hover:bg-secondary",
				)}
				onPress={onControlsOpenChange}
			>
				<Settings size={15} />
			</Button>
		</div>
	);
}

/**
 * Renders the expanded mobile preview controls panel.
 *
 * @returns Mobile preview controls panel.
 *
 * @example
 * <TalePreviewMobileControlsPanel />
 */
function TalePreviewMobileControlsPanel({
	closePanel,
}: { closePanel: () => void }): React.JSX.Element {
	const { openSettings } = useTaleStudio().toolbar;
	return (
		<div
			data-reader-component="TalePreviewMobileControlsPanel"
			data-reader-role="preview-controls-panel"
			data-studio-component="TalePreviewMobileControlsPanel"
			data-studio-role="preview-controls-panel"
			className="mt-2 flex max-h-[calc(100dvh-5rem)] flex-col gap-3 overflow-y-auto border-[3px] border-foreground bg-card p-3 shadow-[7px_7px_0_var(--comic-teal)]"
		>
			<div className="grid gap-1">
				<AppMenuItem hover={false}>
					<TaleStudioBreakpointSelect className="w-full" />
				</AppMenuItem>
				<AppMenuItem hover={false}>
					<ExportTaleButton className="w-full" />
				</AppMenuItem>
				<AppMenuItem hover={false}>
					<ImportTaleButton className="w-full" />
				</AppMenuItem>
				<AppMenuItem hover={false}>
					<Button
						type="button"
						aria-label="Open Tale Studio settings"
						className="flex h-11 w-full items-center justify-center gap-2 border-2 border-foreground bg-card px-2.5 font-black text-foreground text-xs uppercase shadow-[3px_3px_0_rgb(var(--foreground-rgb))] hover:bg-accent"
						onPress={() => {
							closePanel();
							openSettings();
						}}
					>
						<Settings size={14} />
						Settings
					</Button>
				</AppMenuItem>
				<AppMenuItem hover={false}>
					<TaleStudioSaveButton className="w-full" />
				</AppMenuItem>
			</div>
		</div>
	);
}
