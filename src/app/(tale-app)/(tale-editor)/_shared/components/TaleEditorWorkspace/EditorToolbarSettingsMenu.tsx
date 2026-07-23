"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import AppMenu, { AppMenuItem } from "~/components/layout/AppMenu/AppMenu";
import { BreakpointSelect } from "./BreakpointSelect";
import EditorSaveButton from "./EditorSaveButton";
import { useEditorToolbarActions } from "./EditorToolbarActionsContext";
import { ExportTaleButton, ImportTaleButton } from "./TaleFileButtons";

/**
 * Renders the desktop editor toolbar settings menu.
 *
 * @returns Settings menu with breakpoint, import, export, settings, and save actions.
 *
 * @example
 * <EditorToolbarSettingsMenu />
 */
export function EditorToolbarSettingsMenu(): React.JSX.Element {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
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
	);
}

/**
 * Renders editor settings actions as direct toolbar controls.
 *
 * @returns Inline editor settings controls.
 *
 * @example
 * <EditorToolbarInlineSettingsControls />
 */
export function EditorToolbarInlineSettingsControls(): React.JSX.Element {
	const { openSettings } = useEditorToolbarActions();

	return (
		<>
			<BreakpointSelect />
			<ExportTaleButton />
			<ImportTaleButton />
			<button
				type="button"
				aria-label="Open editor settings"
				className="flex h-9 items-center justify-center gap-2 rounded border border-foreground/12 px-2.5 font-semibold text-foreground/68 text-xs hover:bg-foreground/8 hover:text-foreground"
				onClick={openSettings}
			>
				<Settings size={14} />
				Settings
			</button>
		</>
	);
}

/**
 * Renders menu rows for editor toolbar settings.
 *
 * @returns Menu item rows.
 *
 * @example
 * <EditorToolbarSettingsMenuItems />
 */
export function EditorToolbarSettingsMenuItems(): React.JSX.Element {
	const { openSettings } = useEditorToolbarActions();

	return (
		<div className="grid gap-1">
			<AppMenuItem hover={false}>
				<BreakpointSelect />
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
					onClick={openSettings}
				>
					<Settings size={14} />
					Settings
				</button>
			</AppMenuItem>
			<AppMenuItem hover={false}>
				<EditorSaveButton className="w-full font-semibold" />
			</AppMenuItem>
		</div>
	);
}
