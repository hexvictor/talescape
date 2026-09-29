"use client";

import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TaleStudioDraftHistoryControls } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioDraftHistoryControls";
import { TaleStudioSaveButton } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioSaveButton";
import {
	TaleStudioToolbarInlineSettingsControls,
	TaleStudioToolbarSettingsMenu,
} from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioToolbarSettingsMenu";
import { TaleStudioWorkspaceSwitcher } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioWorkspaceSwitcher";
import { AuthStatus } from "~/app/_shared/auth/components";
import Logo from "~/app/_shared/components/layout/Logo";
import ThemeToggle from "~/app/_shared/components/layout/ThemeToggle";
import Separator from "~/components/layout/separator";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import { TaleEditorToolbarControls } from "./TaleEditorToolbarControls";

/**
 * Renders the Tale Editor toolbar with desktop sections and mobile menus.
 *
 * @returns Tale Editor workspace toolbar.
 *
 * @example
 * <TaleEditorToolbar />
 */
export function TaleEditorToolbar(): React.JSX.Element {
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
			data-reader-component="TaleEditorToolbar"
			data-reader-role="editor-toolbar"
			data-studio-component="TaleEditorToolbar"
			data-studio-role="editor-toolbar"
			className="studio-topbar relative z-60 flex min-h-[4.75rem] items-center justify-between gap-2 bg-card px-3 py-2 text-foreground sm:px-4 md:grid md:grid-cols-[auto_1fr_auto]"
		>
			<div
				data-reader-component="TaleEditorToolbar"
				data-reader-role="editor-mode-controls"
				className="flex min-w-0 items-center gap-2"
			>
				<div className="hidden min-w-0 items-center gap-2 md:flex">
					<Logo />
				</div>
				<Separator className="hidden h-8 md:block" />
				<TaleStudioWorkspaceSwitcher />
			</div>
			<div
				data-reader-component="TaleEditorToolbar"
				data-reader-role="editor-middle-controls"
				className="hidden min-w-0 items-center justify-center gap-2 md:flex"
			>
				<TaleEditorToolbarControls />
			</div>
			<div
				data-reader-component="TaleEditorToolbar"
				data-reader-role="editor-desktop-actions"
				className="hidden min-w-0 items-center justify-end gap-2 md:flex"
			>
				<TaleEditorDesktopActions />
			</div>
			<Logo variant="mark" markClassName="h-10" className="md:hidden" />
			<div className="flex min-w-0 items-center gap-2 md:hidden">
				<TaleEditorMobileButtons
					controlsOpen={mobileControlsOpen}
					onControlsOpenChange={setMobileControlsOpen}
				/>
				<Separator className="h-8" />
				<ThemeToggle />
				<AuthStatus />
			</div>
			<TaleEditorMobilePanel controlsOpen={mobileControlsOpen} />
		</header>
	);
}

/**
 * Renders desktop-only right-side editing toolbar actions.
 *
 * @returns Desktop settings, theme, and auth controls.
 *
 * @example
 * <TaleEditorDesktopActions />
 */
function TaleEditorDesktopActions(): React.JSX.Element {
	return (
		<>
			<TaleStudioDraftHistoryControls />
			<TaleStudioSaveButton />
			<TaleStudioToolbarSettingsMenu />
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
 * <TaleEditorMobileButtons controlsOpen={false} onControlsOpenChange={setOpen} />
 */
function TaleEditorMobileButtons({
	controlsOpen,
	onControlsOpenChange,
}: {
	controlsOpen: boolean;
	onControlsOpenChange: (open: boolean) => void;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="TaleEditorMobileButtons"
			data-reader-role="mobile-editor-actions"
			className="flex min-w-0 items-center gap-2 md:hidden"
		>
			<Button
				data-reader-component="TaleEditorMobileButtons"
				data-reader-role="mobile-controls-toggle"
				aria-expanded={controlsOpen}
				aria-label="Toggle editor header controls"
				className={cn(
					"hover:-translate-y-0.5 grid h-11 w-11 place-items-center border-2 border-foreground shadow-[3px_3px_0_var(--comic-ink)] transition-transform",
					controlsOpen
						? "bg-primary text-primary-foreground"
						: "bg-card text-foreground hover:bg-accent",
				)}
				motion="flat"
				size="icon"
				variant={controlsOpen ? "default" : "outline"}
				onPress={() => onControlsOpenChange(!controlsOpen)}
			>
				<Settings size={15} />
			</Button>
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
 * <TaleEditorMobilePanel controlsOpen />
 */
function TaleEditorMobilePanel({
	controlsOpen,
}: {
	controlsOpen: boolean;
}): React.JSX.Element | null {
	if (!controlsOpen) return null;

	return (
		<div
			data-reader-component="TaleEditorMobilePanel"
			data-reader-role="mobile-editor-controls"
			data-studio-component="TaleEditorMobilePanel"
			data-studio-role="mobile-command-drawer"
			className="studio-command-drawer absolute top-full right-3 left-3 z-70 grid max-h-[calc(100dvh-5rem)] gap-3 overflow-y-auto border-[3px] border-foreground bg-card p-3 shadow-[7px_7px_0_var(--secondary)] md:hidden"
		>
			<div className="flex flex-grow justify-between gap-2">
				<TaleEditorToolbarControls />
			</div>
			<div className="flex flex-col gap-2">
				<TaleStudioToolbarInlineSettingsControls />
			</div>
			<TaleStudioDraftHistoryControls />
			<TaleStudioSaveButton />
		</div>
	);
}
