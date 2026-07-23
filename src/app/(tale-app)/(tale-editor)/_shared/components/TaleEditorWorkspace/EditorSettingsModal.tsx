"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { BreakpointSettings } from "./BreakpointSettings";
import { EditorGraphSettings } from "./EditorGraphSettings";
import { SettingsTabButton } from "./SettingsTabButton";
import { TaleSettingsPanel } from "./TaleSettingsPanel";

/**
 * Renders editor-wide settings in a modal dialog.
 *
 * @param props - Modal props.
 * @param props.open - Whether the modal is visible.
 * @param props.onClose - Closes the settings modal.
 * @returns Settings modal, or null when closed.
 *
 * @example
 * <EditorSettingsModal open={open} onClose={close} />
 */
export function EditorSettingsModal({
	onClose,
	open,
}: {
	onClose: () => void;
	open: boolean;
}): React.JSX.Element | null {
	const [activeTab, setActiveTab] = useState<"graph" | "tale">("tale");

	if (!open) return null;

	return (
		<div
			data-reader-component="EditorSettingsModal"
			data-reader-role="editor-settings-dialog"
			className="fixed inset-0 z-[1001] grid place-items-center bg-black/48 p-2 sm:p-4"
			onMouseDown={onClose}
		>
			<section
				className="max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-hidden rounded-lg border border-foreground/12 bg-background text-foreground shadow-2xl"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<EditorSettingsHeader onClose={onClose} />
				<EditorSettingsTabs
					activeTab={activeTab}
					onActiveTabChange={setActiveTab}
				/>
				<div className="max-h-[calc(100dvh-10.5rem)] overflow-y-auto overflow-x-hidden p-3 sm:p-4">
					{activeTab === "tale" ? (
						<>
							<TaleSettingsPanel />
							<BreakpointSettings />
						</>
					) : (
						<EditorGraphSettings />
					)}
				</div>
			</section>
		</div>
	);
}

/**
 * Renders the editor settings modal heading and close button.
 *
 * @param props - Header behavior.
 * @param props.onClose - Closes the settings modal.
 * @returns Modal header.
 *
 * @example
 * <EditorSettingsHeader onClose={close} />
 */
function EditorSettingsHeader({
	onClose,
}: {
	onClose: () => void;
}): React.JSX.Element {
	return (
		<header className="flex items-start justify-between gap-3 border-foreground/10 border-b px-3 py-3 sm:px-4">
			<div className="min-w-0">
				<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
					Editor Settings
				</p>
				<p className="mt-1 text-foreground/45 text-xs">
					Tale metadata, snap defaults, breakpoints, and graph behavior
				</p>
			</div>
			<button
				type="button"
				aria-label="Close editor settings"
				className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/55 hover:bg-foreground/8 hover:text-foreground"
				onClick={onClose}
			>
				<X size={16} />
			</button>
		</header>
	);
}

/**
 * Renders editor settings modal tabs.
 *
 * @param props - Current tab and selection callback.
 * @param props.activeTab - Currently selected settings tab.
 * @param props.onActiveTabChange - Receives selected settings tab.
 * @returns Settings tab list.
 *
 * @example
 * <EditorSettingsTabs activeTab="tale" onActiveTabChange={setTab} />
 */
function EditorSettingsTabs({
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
