"use client";

import { useReaderHubSettingsState } from "../../../hooks/store/useReaderNavigationSelectors";

/**
 * Renders reader behavior and overlay preferences.
 *
 * @returns Reader settings panel.
 *
 * @example
 * <ReaderHubSettings />
 */
export function ReaderHubSettings(): React.JSX.Element {
	const settings = useReaderHubSettingsState();

	return (
		<div
			data-reader-component="ReaderHubSettings"
			data-reader-role="reader-settings"
			className="space-y-2"
		>
			<SettingsToggle
				checked={settings.navigationPinsVisible}
				label="Show navigation pins"
				onChange={settings.setNavigationPinsVisible}
			/>
			<SettingsToggle
				checked={settings.reduceInactiveUiOpacity}
				label="Dim inactive navigation"
				onChange={settings.setReduceInactiveUiOpacity}
			/>
			<SettingsToggle
				checked={settings.navigationUsesSelectedPart}
				label="Filter entries by selected part"
				onChange={settings.setNavigationUsesSelectedPart}
			/>
			<SettingsToggle
				checked={settings.debugVisible}
				label="Show reader debug"
				onChange={settings.setDebugVisible}
			/>
			<SettingsToggle
				checked={settings.readerStatusVisible}
				label="Show story and page status"
				onChange={settings.setReaderStatusVisible}
			/>
			<label className="block rounded-md border border-white/8 bg-white/[0.035] p-3">
				<span className="flex items-center justify-between gap-3 text-white/72 text-xs">
					Inactive fade delay
					<strong className="text-[#e2c98f]">
						{settings.activityFadeDelaySeconds}s
					</strong>
				</span>
				<input
					className="mt-3 w-full accent-[#d9b56f]"
					type="range"
					min={1}
					max={15}
					step={1}
					value={settings.activityFadeDelaySeconds}
					onChange={(event) =>
						settings.setActivityFadeDelaySeconds(Number(event.target.value))
					}
				/>
			</label>
		</div>
	);
}

/**
 * Renders one binary reader setting.
 *
 * @param props - Toggle label, value, and change handler.
 * @returns Accessible settings toggle.
 */
function SettingsToggle({
	checked,
	label,
	onChange,
}: {
	checked: boolean;
	label: string;
	onChange: (checked: boolean) => void;
}): React.JSX.Element {
	return (
		<label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-white/8 bg-white/[0.035] p-3 text-white/72 text-xs">
			{label}
			<input
				type="checkbox"
				className="h-4 w-4 accent-[#d9b56f]"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
			/>
		</label>
	);
}
