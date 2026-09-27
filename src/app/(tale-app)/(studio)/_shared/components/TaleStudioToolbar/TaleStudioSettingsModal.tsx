"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/overlay/dialog";
import { Tab, TabList, Tabs } from "~/components/ui/tabs";
import { useTaleStudio } from "../../contexts/TaleStudioProvider";
import { TaleSettingsPanel } from "./TaleSettingsPanel";
import { TaleStructurePanel } from "./TaleStructurePanel";
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
	const [activeTab, setActiveTab] = useState<"graph" | "structure" | "tale">(
		"tale",
	);

	if (!settingsOpen) return null;

	return (
		<Dialog
			open={settingsOpen}
			onOpenChange={(open) => {
				if (!open) closeSettings();
			}}
		>
			<DialogContent
				data-reader-component="TaleStudioSettingsModal"
				data-reader-role="studio-settings-dialog"
				data-studio-component="TaleStudioSettingsModal"
				data-studio-role="studio-settings-dialog"
				className="max-h-[calc(100dvh-1rem)] max-w-xl gap-0 overflow-hidden p-0 shadow-[9px_9px_0_var(--comic-teal)]"
				closeButtonClassName="top-3 right-3 size-9"
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
					) : activeTab === "structure" ? (
						<TaleStructurePanel />
					) : (
						<TaleStudioGraphSettings />
					)}
				</div>
			</DialogContent>
		</Dialog>
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
	return (
		<DialogHeader className="border-foreground/10 border-b px-3 py-3 pr-14 sm:px-4 sm:pr-14">
			<DialogTitle className="font-black text-primary text-xs uppercase tracking-[0.18em]">
				Tale Studio Settings
			</DialogTitle>
			<DialogDescription className="text-foreground/45 text-xs">
				Tale metadata, snap defaults, breakpoints, and graph behavior
			</DialogDescription>
		</DialogHeader>
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
	activeTab: "graph" | "structure" | "tale";
	onActiveTabChange: (tab: "graph" | "structure" | "tale") => void;
}): React.JSX.Element {
	return (
		<div className="border-foreground/10 border-b px-3 py-2 sm:px-4">
			<Tabs
				selectedKey={activeTab}
				onSelectionChange={(key) =>
					onActiveTabChange(String(key) as "graph" | "structure" | "tale")
				}
			>
				<TabList aria-label="Studio settings sections" density="compact">
					<Tab density="compact" id="structure">
						Structure
					</Tab>
					<Tab density="compact" id="tale">
						Tale
					</Tab>
					<Tab density="compact" id="graph">
						Graph
					</Tab>
				</TabList>
			</Tabs>
		</div>
	);
}
