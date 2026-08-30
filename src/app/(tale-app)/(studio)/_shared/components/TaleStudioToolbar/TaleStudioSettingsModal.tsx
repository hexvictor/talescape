"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useTaleStudio } from "../../contexts/TaleStudioProvider";
import { SettingsTabButton } from "./SettingsTabButton";
import { TaleSettingsPanel } from "./TaleSettingsPanel";
import { TaleStudioBreakpointSettings } from "./TaleStudioBreakpointSettings";
import { TaleStudioGraphSettings } from "./TaleStudioGraphSettings";

/**
 * Renders Tale Studio settings in a modal dialog.
 *
 * @returns Settings modal, or null when closed.
 *
 * @example
 * <TaleStudioSettingsModal />
 */
export function TaleStudioSettingsModal(): React.JSX.Element | null {
	const { closeSettings, settingsOpen } = useTaleStudio().toolbar;
	const [activeTab, setActiveTab] = useState<"graph" | "tale">("tale");

	if (!settingsOpen) return null;

	return (
		<div
			data-reader-component="TaleStudioSettingsModal"
			data-reader-role="studio-settings-dialog"
			className="fixed inset-0 z-[1001] grid place-items-center bg-black/48 p-2 sm:p-4"
			onMouseDown={closeSettings}
		>
			<section
				className="max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-hidden border-[3px] border-foreground bg-card text-foreground shadow-[9px_9px_0_var(--comic-teal)]"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<TaleStudioSettingsHeader />
				<TaleStudioSettingsTabs
					activeTab={activeTab}
					onActiveTabChange={setActiveTab}
				/>
				<div className="max-h-[calc(100dvh-10.5rem)] overflow-y-auto overflow-x-hidden p-3 sm:p-4">
					{activeTab === "tale" ? (
						<>
							<TaleSettingsPanel />
							<TaleStudioBreakpointSettings />
						</>
					) : (
						<TaleStudioGraphSettings />
					)}
				</div>
			</section>
		</div>
	);
}

/**
 * Renders the Tale Studio settings heading and close button.
 *
 * @returns Modal header.
 *
 * @example
 * <TaleStudioSettingsHeader />
 */
function TaleStudioSettingsHeader(): React.JSX.Element {
	const { closeSettings } = useTaleStudio().toolbar;

	return (
		<header className="flex items-start justify-between gap-3 border-foreground/10 border-b px-3 py-3 sm:px-4">
			<div className="min-w-0">
				<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
					Tale Studio Settings
				</p>
				<p className="mt-1 text-foreground/45 text-xs">
					Tale metadata, snap defaults, breakpoints, and graph behavior
				</p>
			</div>
			<button
				type="button"
				aria-label="Close Tale Studio settings"
				className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/55 hover:bg-foreground/8 hover:text-foreground"
				onClick={closeSettings}
			>
				<X size={16} />
			</button>
		</header>
	);
}

/**
 * Renders Tale Studio settings tabs.
 *
 * @param props - Current tab and selection callback.
 * @param props.activeTab - Currently selected settings tab.
 * @param props.onActiveTabChange - Receives selected settings tab.
 * @returns Settings tab list.
 *
 * @example
 * <TaleStudioSettingsTabs activeTab="tale" onActiveTabChange={setTab} />
 */
function TaleStudioSettingsTabs({
	activeTab,
	onActiveTabChange,
}: {
	activeTab: "graph" | "tale";
	onActiveTabChange: (tab: "graph" | "tale") => void;
}): React.JSX.Element {
	return (
		<div className="border-foreground/10 border-b px-3 py-2 sm:px-4">
			<div className="inline-flex rounded border border-foreground/10 bg-foreground/[0.03] p-1">
				<SettingsTabButton
					active={activeTab === "tale"}
					label="Tale"
					onClick={() => onActiveTabChange("tale")}
				/>
				<SettingsTabButton
					active={activeTab === "graph"}
					label="Graph"
					onClick={() => onActiveTabChange("graph")}
				/>
			</div>
		</div>
	);
}
