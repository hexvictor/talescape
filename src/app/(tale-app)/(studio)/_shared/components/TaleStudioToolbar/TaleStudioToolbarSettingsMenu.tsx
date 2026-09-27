"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import AppMenu, {
	AppMenuItem,
} from "~/app/_shared/components/layout/AppMenu/AppMenu";
import { Button } from "~/components/ui/button";
import { useTaleStudio } from "../../contexts/TaleStudioProvider";
import { TaleStudioBreakpointSelect } from "./TaleStudioBreakpointSelect";
import {
	ExportTaleButton,
	ImportTaleButton,
} from "./TaleStudioDocumentButtons";
import { TaleStudioSaveButton } from "./TaleStudioSaveButton";

/**
 * Renders the desktop Tale Studio settings menu.
 *
 * @returns Settings menu with breakpoint, import, export, settings, and save actions.
 *
 * @example
 * <TaleStudioToolbarSettingsMenu />
 */
export function TaleStudioToolbarSettingsMenu(): React.JSX.Element {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<AppMenu
			showLogo={false}
			showFooterActions={false}
			menuOpen={menuOpen}
			onMenuOpenChange={setMenuOpen}
			data-reader-role="studio-toolbar-settings-menu"
			buttonClassName="grid h-11 w-11 place-items-center border-2 border-foreground bg-card text-foreground shadow-[3px_3px_0_rgb(var(--foreground-rgb))] hover:bg-accent"
			collapsedIcon={<Settings size={15} />}
			expandedIcon={<Settings size={15} />}
			menuPlacement="bottom-left"
		>
			<TaleStudioToolbarSettingsMenuItems />
		</AppMenu>
	);
}

/**
 * Renders Tale Studio settings actions as direct toolbar controls.
 *
 * @returns Inline Tale Studio settings controls.
 *
 * @example
 * <TaleStudioToolbarInlineSettingsControls />
 */
export function TaleStudioToolbarInlineSettingsControls(): React.JSX.Element {
	const { openSettings } = useTaleStudio().toolbar;

	return (
		<>
			<TaleStudioBreakpointSelect />
			<ExportTaleButton />
			<ImportTaleButton />
			<Button
				aria-label="Open Tale Studio settings"
				className="flex h-11 items-center justify-center gap-2 border-2 border-foreground bg-card px-2.5 font-black text-foreground text-xs uppercase shadow-[3px_3px_0_rgb(var(--foreground-rgb))] hover:bg-accent"
				motion="flat"
				variant="outline"
				onPress={openSettings}
			>
				<Settings size={14} />
				Settings
			</Button>
		</>
	);
}

/**
 * Renders menu rows for Tale Studio settings.
 *
 * @returns Menu item rows.
 *
 * @example
 * <TaleStudioToolbarSettingsMenuItems />
 */
export function TaleStudioToolbarSettingsMenuItems(): React.JSX.Element {
	const { openSettings } = useTaleStudio().toolbar;

	return (
		<div className="grid gap-1">
			<AppMenuItem hover={false}>
				<TaleStudioBreakpointSelect />
			</AppMenuItem>
			<AppMenuItem hover={false}>
				<ExportTaleButton className="w-full" />
			</AppMenuItem>
			<AppMenuItem hover={false}>
				<ImportTaleButton className="w-full" />
			</AppMenuItem>
			<AppMenuItem hover={false}>
				<Button
					className="flex h-11 w-full items-center justify-center gap-2 border-2 border-foreground bg-card px-2.5 font-black text-foreground text-xs uppercase shadow-[3px_3px_0_rgb(var(--foreground-rgb))] hover:bg-accent"
					motion="flat"
					variant="outline"
					onPress={openSettings}
				>
					<Settings size={14} />
					Settings
				</Button>
			</AppMenuItem>
			<AppMenuItem hover={false}>
				<TaleStudioSaveButton className="w-full font-semibold" />
			</AppMenuItem>
		</div>
	);
}
