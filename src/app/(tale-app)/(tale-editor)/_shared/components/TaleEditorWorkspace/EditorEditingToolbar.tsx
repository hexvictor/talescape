"use client";

import clsx from "clsx";
import { Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "~/components/ui/Logo";
import ThemeToggle from "~/components/ui/ThemeToggle";
import Separator from "~/components/ui/separator";
import { AuthStatus } from "~/features/auth/components";
import { EditorActivitySwitcher } from "./EditorActivitySwitcher";
import { EditorMobileSiteActions } from "./EditorMobileSiteActions";
import EditorSaveButton from "./EditorSaveButton";
import { EditorToolbarMiddleControls } from "./EditorToolbarMiddleControls";
import {
	EditorToolbarInlineSettingsControls,
	EditorToolbarSettingsMenu,
} from "./EditorToolbarSettingsMenu";

/**
 * Renders the editing-only toolbar with desktop sections and mobile menus.
 *
 * @returns Editing mode toolbar.
 *
 * @example
 * <EditorEditingToolbar />
 */
export function EditorEditingToolbar(): React.JSX.Element {
	const rootRef = useRef<HTMLElement | null>(null);
	const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
	const [mobileSiteMenuOpen, setMobileSiteMenuOpen] = useState(false);

	useEffect(() => {
		if (!mobileControlsOpen && !mobileSiteMenuOpen) return;
		const closeOnOutsidePointer = (event: PointerEvent): void => {
			if (rootRef.current?.contains(event.target as Node)) return;
			setMobileControlsOpen(false);
			setMobileSiteMenuOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
		};
	}, [mobileControlsOpen, mobileSiteMenuOpen]);

	return (
		<header
			ref={rootRef}
			data-reader-component="EditorModeToolbar"
			data-reader-role="editor-toolbar"
			className="relative z-60 flex min-h-16 items-center justify-between gap-2 bg-background/95 px-3 py-2 text-foreground backdrop-blur-md sm:px-4 md:grid md:grid-cols-[auto_1fr_auto]"
		>
			<div className="flex min-w-0 items-center gap-2">
				<Link href="/" className="hidden min-w-0 items-center gap-2 md:flex">
					<Logo />
				</Link>
				<Separator className="hidden h-8 md:block" />
				<EditorActivitySwitcher />
			</div>
			<div className="hidden min-w-0 items-center justify-center gap-2 md:flex">
				<EditorToolbarMiddleControls />
			</div>
			<div className="hidden min-w-0 items-center justify-end gap-2 md:flex">
				<EditorEditingDesktopActions />
			</div>
			<EditorEditingMobileButtons
				controlsOpen={mobileControlsOpen}
				siteMenuOpen={mobileSiteMenuOpen}
				onControlsOpenChange={setMobileControlsOpen}
				onSiteMenuOpenChange={setMobileSiteMenuOpen}
			/>
			<EditorEditingMobilePanels
				controlsOpen={mobileControlsOpen}
				siteMenuOpen={mobileSiteMenuOpen}
			/>
		</header>
	);
}

/**
 * Renders desktop-only right-side editing toolbar actions.
 *
 * @returns Desktop settings, theme, and auth controls.
 *
 * @example
 * <EditorEditingDesktopActions />
 */
function EditorEditingDesktopActions(): React.JSX.Element {
	return (
		<>
			<EditorToolbarSettingsMenu />
			<Separator className="h-8" />
			<ThemeToggle />
			<AuthStatus />
		</>
	);
}

/**
 * Renders compact mobile editing toolbar buttons.
 *
 * @param props - Mobile menu state and actions.
 * @param props.controlsOpen - Whether editor controls are open.
 * @param props.onControlsOpenChange - Receives editor controls visibility.
 * @param props.onSiteMenuOpenChange - Receives site menu visibility.
 * @param props.siteMenuOpen - Whether the site menu is open.
 * @returns Mobile toolbar buttons.
 *
 * @example
 * <EditorEditingMobileButtons controlsOpen={false} siteMenuOpen={false} />
 */
function EditorEditingMobileButtons({
	controlsOpen,
	onControlsOpenChange,
	onSiteMenuOpenChange,
	siteMenuOpen,
}: {
	controlsOpen: boolean;
	onControlsOpenChange: (open: boolean) => void;
	onSiteMenuOpenChange: (open: boolean) => void;
	siteMenuOpen: boolean;
}): React.JSX.Element {
	return (
		<div className="flex min-w-0 items-center gap-2 md:hidden">
			<button
				type="button"
				aria-expanded={controlsOpen}
				aria-label="Toggle editor header controls"
				className={clsx(
					"grid h-9 w-9 place-items-center rounded transition",
					controlsOpen
						? "bg-foreground text-background"
						: "border border-foreground/10 text-foreground/60 hover:bg-foreground/8 hover:text-foreground",
				)}
				onClick={() => {
					onSiteMenuOpenChange(false);
					onControlsOpenChange(!controlsOpen);
				}}
			>
				<Settings size={15} />
			</button>
			<button
				type="button"
				aria-expanded={siteMenuOpen}
				aria-label="Open site menu"
				className={clsx(
					"grid h-9 w-9 place-items-center rounded transition",
					siteMenuOpen
						? "bg-foreground text-background"
						: "border border-foreground/10 text-foreground/60 hover:bg-foreground/8 hover:text-foreground",
				)}
				onClick={() => {
					onControlsOpenChange(false);
					onSiteMenuOpenChange(!siteMenuOpen);
				}}
			>
				<Menu size={16} />
			</button>
		</div>
	);
}

/**
 * Renders mobile dropdown panels for editing toolbar menus.
 *
 * @param props - Open state for each mobile panel.
 * @param props.controlsOpen - Whether editor controls are open.
 * @param props.siteMenuOpen - Whether site actions are open.
 * @returns Mobile dropdown panels.
 *
 * @example
 * <EditorEditingMobilePanels controlsOpen siteMenuOpen={false} />
 */
function EditorEditingMobilePanels({
	controlsOpen,
	siteMenuOpen,
}: {
	controlsOpen: boolean;
	siteMenuOpen: boolean;
}): React.JSX.Element | null {
	if (!siteMenuOpen && !controlsOpen) return null;

	return (
		<>
			{siteMenuOpen ? (
				<div className="absolute top-full right-3 left-3 z-70 grid max-h-[calc(100dvh-5rem)] gap-3 overflow-y-auto rounded-lg border border-foreground/12 bg-background/96 p-3 shadow-2xl backdrop-blur-xl md:hidden">
					<EditorMobileSiteActions />
				</div>
			) : null}
			{controlsOpen ? (
				<div className="absolute top-full right-3 left-3 z-70 grid max-h-[calc(100dvh-5rem)] gap-3 overflow-y-auto rounded-lg border border-foreground/12 bg-background/96 p-3 shadow-2xl backdrop-blur-xl md:hidden">
					<div className="flex flex-grow justify-between gap-2">
						<EditorToolbarMiddleControls />
					</div>
					<div className="flex flex-col gap-2">
						<EditorToolbarInlineSettingsControls />
					</div>
					<EditorSaveButton />
				</div>
			) : null}
		</>
	);
}
