"use client";

import clsx from "clsx";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "~/components/ui/Logo";
import ThemeToggle from "~/components/ui/ThemeToggle";
import Separator from "~/components/ui/separator";
import { AuthStatus } from "~/features/auth/components";
import { EditorActivitySwitcher } from "./EditorActivitySwitcher";
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

	useEffect(() => {
		if (!mobileControlsOpen) return;
		const closeOnOutsidePointer = (event: PointerEvent): void => {
			if (rootRef.current?.contains(event.target as Node)) return;
			setMobileControlsOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
		};
	}, [mobileControlsOpen]);

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
			<span className="font-bold text-xl tracking-normal md:hidden">
				Talescape
			</span>
			<div className="flex min-w-0 items-center gap-2 md:hidden">
				<EditorEditingMobileButtons
					controlsOpen={mobileControlsOpen}
					onControlsOpenChange={setMobileControlsOpen}
				/>
				<Separator className="h-8" />
				<ThemeToggle />
				<AuthStatus />
			</div>
			<EditorEditingMobilePanel controlsOpen={mobileControlsOpen} />
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
 * @returns Mobile toolbar buttons.
 *
 * @example
 * <EditorEditingMobileButtons controlsOpen={false} onControlsOpenChange={setOpen} />
 */
function EditorEditingMobileButtons({
	controlsOpen,
	onControlsOpenChange,
}: {
	controlsOpen: boolean;
	onControlsOpenChange: (open: boolean) => void;
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
				onClick={() => onControlsOpenChange(!controlsOpen)}
			>
				<Settings size={15} />
			</button>
		</div>
	);
}

/**
 * Renders the mobile dropdown panel for editing toolbar controls.
 *
 * @param props - Mobile panel state.
 * @param props.controlsOpen - Whether editor controls are open.
 * @returns Mobile dropdown panel when open.
 *
 * @example
 * <EditorEditingMobilePanel controlsOpen />
 */
function EditorEditingMobilePanel({
	controlsOpen,
}: {
	controlsOpen: boolean;
}): React.JSX.Element | null {
	if (!controlsOpen) return null;

	return (
		<div className="absolute top-full right-3 left-3 z-70 grid max-h-[calc(100dvh-5rem)] gap-3 overflow-y-auto rounded-lg border border-foreground/12 bg-background/96 p-3 shadow-2xl backdrop-blur-xl md:hidden">
			<div className="flex flex-grow justify-between gap-2">
				<EditorToolbarMiddleControls />
			</div>
			<div className="flex flex-col gap-2">
				<EditorToolbarInlineSettingsControls />
			</div>
			<EditorSaveButton />
		</div>
	);
}
