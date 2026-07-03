"use client";

import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";
import type { ReaderInputSettings } from "../../../scroll-engine/readerInputSettings";

type ReaderInputSettingKey = keyof ReaderInputSettings;

type ReaderInputSettingDefinition = {
	description: string;
	key: ReaderInputSettingKey;
	label: string;
	max?: number;
	min?: number;
	step?: number;
};

const readerInputSettingGroups: Array<{
	description: string;
	settings: ReaderInputSettingDefinition[];
	title: string;
}> = [
	{
		description: "Arrow, Page, Space, Home, and End movement.",
		settings: [
			{
				description: "Starting distance for one keyboard move.",
				key: "keyboardBaseStepPx",
				label: "Base step",
				min: 1,
				step: 1,
			},
			{
				description: "Easing time for keyboard-driven movement.",
				key: "keyboardDuration",
				label: "Duration",
				min: 0,
				step: 0.01,
			},
			{
				description: "Extra multiplier gained while holding a key.",
				key: "keyboardHoldBoost",
				label: "Hold boost",
				min: 0,
				step: 0.01,
			},
			{
				description: "Maximum held-key acceleration multiplier.",
				key: "keyboardMaxMultiplier",
				label: "Max multiplier",
				min: 1,
				step: 0.1,
			},
			{
				description: "Delay before held-key acceleration starts cooling off.",
				key: "keyboardDecayDelayMs",
				label: "Decay delay",
				min: 0,
				step: 10,
			},
			{
				description: "How often held-key acceleration decays.",
				key: "keyboardDecayIntervalMs",
				label: "Decay interval",
				min: 0,
				step: 10,
			},
			{
				description: "Multiplier amount removed on each decay tick.",
				key: "keyboardDecayStep",
				label: "Decay step",
				min: 0,
				step: 0.01,
			},
			{
				description: "Extra pixels added by repeated quick taps.",
				key: "keyboardTapAccelerationPx",
				label: "Tap acceleration",
				min: 0,
				step: 1,
			},
			{
				description: "Maximum distance for one accelerated tap.",
				key: "keyboardTapMaxStepPx",
				label: "Tap max step",
				min: 1,
				step: 1,
			},
			{
				description: "Time for repeated taps to count as one burst.",
				key: "keyboardTapBurstWindowMs",
				label: "Tap burst window",
				min: 0,
				step: 10,
			},
			{
				description: "Exponential multiplier for repeated taps.",
				key: "keyboardTapRepeatMultiplier",
				label: "Tap multiplier",
				min: 1,
				step: 0.01,
			},
			{
				description: "Viewport fraction used by Page and Space keys.",
				key: "pageStepRatio",
				label: "Page step ratio",
				min: 0.1,
				step: 0.01,
			},
		],
		title: "Keyboard",
	},
	{
		description: "Mouse wheel and trackpad movement.",
		settings: [
			{
				description: "Minimum wheel movement per input batch.",
				key: "wheelBaseStepPx",
				label: "Base step",
				min: 1,
				step: 1,
			},
			{
				description: "How much raw wheel distance contributes.",
				key: "wheelDeltaRatio",
				label: "Delta ratio",
				min: 0,
				step: 0.01,
			},
			{
				description: "Flat boost unlocked as weighted wheel streak grows.",
				key: "wheelAccelerationPx",
				label: "Energy boost",
				min: 0,
				step: 1,
			},
			{
				description: "Compounding boost unlocked by repeated wheel streaks.",
				key: "wheelBurstCountBoostPx",
				label: "Streak boost",
				min: 0,
				step: 1,
			},
			{
				description: "Wheel distance that counts as one full streak step.",
				key: "wheelBurstCountStepPx",
				label: "Streak step size",
				min: 1,
				step: 1,
			},
			{
				description: "How much bigger wheel turns outweigh tiny wheel turns.",
				key: "wheelBurstCountMagnitudeExponent",
				label: "Streak weight",
				min: 0.1,
				step: 0.05,
			},
			{
				description: "How aggressively each wheel streak compounds.",
				key: "wheelBurstCountMultiplier",
				label: "Streak growth",
				min: 1,
				step: 0.01,
			},
			{
				description: "Maximum weighted streak score used by acceleration.",
				key: "wheelBurstCountLimit",
				label: "Streak cap",
				min: 1,
				step: 1,
			},
			{
				description: "Maximum distance one wheel batch can request.",
				key: "wheelMaxStepPx",
				label: "Max step",
				min: 1,
				step: 1,
			},
			{
				description: "Easing time for wheel movement.",
				key: "wheelDuration",
				label: "Duration",
				min: 0,
				step: 0.01,
			},
			{
				description:
					"How long the weighted streak cools off between wheel turns.",
				key: "wheelBurstDecayMs",
				label: "Burst decay",
				min: 0,
				step: 10,
			},
			{
				description: "Maximum wheel burst energy before acceleration caps.",
				key: "wheelBurstEnergyLimit",
				label: "Burst energy limit",
				min: 1,
				step: 1000,
			},
			{
				description: "Pause length before wheel acceleration fully resets.",
				key: "wheelResetDelayMs",
				label: "Reset delay",
				min: 0,
				step: 10,
			},
		],
		title: "Wheel",
	},
	{
		description: "Touch drag and release momentum.",
		settings: [
			{
				description: "How much finger distance turns into scroll distance.",
				key: "touchDeltaRatio",
				label: "Delta ratio",
				min: 0,
				step: 0.01,
			},
			{
				description: "Easing time while your finger is moving.",
				key: "touchDuration",
				label: "Drag duration",
				min: 0,
				step: 0.01,
			},
			{
				description: "Maximum repeated-swipe acceleration multiplier.",
				key: "touchAccelerationLimit",
				label: "Acceleration limit",
				min: 1,
				step: 0.1,
			},
			{
				description: "How much touch velocity affects current movement.",
				key: "touchVelocityRatio",
				label: "Velocity ratio",
				min: 0.1,
				step: 0.1,
			},
			{
				description: "How long repeated swipes stay connected.",
				key: "touchBurstWindowMs",
				label: "Burst window",
				min: 0,
				step: 10,
			},
			{
				description: "How long touch burst energy takes to cool off.",
				key: "touchBurstDecayMs",
				label: "Burst decay",
				min: 0,
				step: 10,
			},
			{
				description: "Maximum stored touch burst energy.",
				key: "touchBurstEnergyLimit",
				label: "Burst energy limit",
				min: 1,
				step: 1000,
			},
			{
				description: "Easing time after releasing your finger.",
				key: "touchMomentumDuration",
				label: "Momentum duration",
				min: 0,
				step: 0.01,
			},
			{
				description: "How strongly release velocity becomes momentum.",
				key: "touchMomentumMultiplier",
				label: "Momentum multiplier",
				min: 0,
				step: 1,
			},
			{
				description: "Maximum extra movement after release.",
				key: "touchMomentumMaxPx",
				label: "Momentum max",
				min: 0,
				step: 1,
			},
			{
				description: "Minimum release speed required for momentum.",
				key: "touchMomentumMinVelocity",
				label: "Momentum min velocity",
				min: 0,
				step: 0.01,
			},
		],
		title: "Touch",
	},
	{
		description: "Middle mouse button drag movement.",
		settings: [
			{
				description: "How much drag distance turns into scroll distance.",
				key: "middleDragDeltaRatio",
				label: "Delta ratio",
				min: 0,
				step: 0.01,
			},
			{
				description: "Easing time during middle-button drag.",
				key: "middleDragDuration",
				label: "Duration",
				min: 0,
				step: 0.01,
			},
			{
				description: "Maximum velocity acceleration multiplier.",
				key: "middleDragAccelerationLimit",
				label: "Acceleration limit",
				min: 1,
				step: 0.1,
			},
			{
				description: "How much pointer velocity affects middle drag.",
				key: "middleDragVelocityRatio",
				label: "Velocity ratio",
				min: 0.1,
				step: 0.1,
			},
		],
		title: "Middle drag",
	},
	{
		description: "After-input snapping to nearby reader anchors.",
		settings: [
			{
				description: "Distance where a nearby snap point can capture scroll.",
				key: "snapCapturePx",
				label: "Capture distance",
				min: 0,
				step: 1,
			},
			{
				description: "Delay before snap is attempted after input.",
				key: "snapDelayMs",
				label: "Snap delay",
				min: 0,
				step: 10,
			},
			{
				description: "Easing duration for the snap movement.",
				key: "snapDuration",
				label: "Snap duration",
				min: 0,
				step: 0.01,
			},
		],
		title: "Snap",
	},
];

/**
 * Renders reader behavior and overlay preferences.
 *
 * @returns Reader settings panel.
 *
 * @example
 * <ReaderHubSettings />
 */
export function ReaderHubSettings(): React.JSX.Element {
	const settings = useTaleReaderStoreShallow((state) => ({
		activityFadeDelaySeconds: state.ui.activityFadeDelaySeconds,
		debugVisible: state.ui.debugVisible,
		navigationPinsVisible: state.ui.navigationPinsVisible,
		navigationUsesSelectedPart: state.ui.navigationUsesSelectedPart,
		readerStatusVisible: state.ui.readerStatusVisible,
		reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
		setActivityFadeDelaySeconds: state.ui.setActivityFadeDelaySeconds,
		setDebugVisible: state.ui.setDebugVisible,
		setNavigationPinsVisible: state.ui.setNavigationPinsVisible,
		setNavigationUsesSelectedPart: state.ui.setNavigationUsesSelectedPart,
		setReaderStatusVisible: state.ui.setReaderStatusVisible,
		setReduceInactiveUiOpacity: state.ui.setReduceInactiveUiOpacity,
		inputSettings: state.inputSettings.values,
		resetInputSettings: state.inputSettings.reset,
		setInputSetting: state.inputSettings.setValue,
	}));

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
			<label className="block rounded-md border border-foreground/8 bg-foreground/[0.035] p-3">
				<span className="flex items-center justify-between gap-3 text-foreground/72 text-xs">
					Inactive fade delay
					<strong className="text-primary">
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
			<div className="space-y-3 pt-2">
				<div className="flex items-center justify-between gap-3">
					<div>
						<h3 className="font-semibold text-foreground/82 text-xs">
							Input tuning
						</h3>
						<p className="mt-1 text-[0.68rem] text-foreground/42">
							Changes apply to the next wheel, keyboard, drag, or touch input.
						</p>
					</div>
					<button
						type="button"
						className="rounded border border-foreground/12 px-2 py-1 text-[0.68rem] text-foreground/62 hover:bg-foreground/8 hover:text-foreground"
						onClick={settings.resetInputSettings}
					>
						Reset
					</button>
				</div>
				{readerInputSettingGroups.map((group) => (
					<ReaderInputSettingsGroup
						key={group.title}
						description={group.description}
						settings={group.settings}
						title={group.title}
						values={settings.inputSettings}
						onChange={settings.setInputSetting}
					/>
				))}
			</div>
		</div>
	);
}

/**
 * Renders one group of numeric reader input settings.
 *
 * @param props - Group metadata, current values, and value updater.
 * @returns Collapsible group of reader input controls.
 */
function ReaderInputSettingsGroup({
	description,
	onChange,
	settings,
	title,
	values,
}: {
	description: string;
	onChange: <Key extends ReaderInputSettingKey>(
		key: Key,
		value: ReaderInputSettings[Key],
	) => void;
	settings: ReaderInputSettingDefinition[];
	title: string;
	values: ReaderInputSettings;
}): React.JSX.Element {
	return (
		<details className="group rounded-md border border-foreground/8 bg-foreground/[0.025]">
			<summary className="cursor-pointer list-none p-3">
				<span className="flex items-center justify-between gap-3">
					<span className="font-semibold text-foreground/76 text-xs">
						{title}
					</span>
					<span className="text-[0.66rem] text-foreground/38 group-open:hidden">
						Edit
					</span>
				</span>
				<span className="mt-1 block text-[0.68rem] text-foreground/42">
					{description}
				</span>
			</summary>
			<div className="grid gap-2 border-foreground/8 border-t p-3">
				{settings.map((setting) => (
					<SettingsNumber
						key={setting.key}
						description={setting.description}
						label={setting.label}
						max={setting.max}
						min={setting.min}
						step={setting.step}
						value={values[setting.key]}
						onChange={(value) => onChange(setting.key, value)}
					/>
				))}
			</div>
		</details>
	);
}

/**
 * Renders one numeric reader setting input.
 *
 * @param props - Numeric setting metadata and update handler.
 * @returns Labeled number input.
 */
function SettingsNumber({
	description,
	label,
	max,
	min,
	onChange,
	step = 1,
	value,
}: {
	description: string;
	label: string;
	max?: number;
	min?: number;
	onChange: (value: number) => void;
	step?: number;
	value: number;
}): React.JSX.Element {
	return (
		<label className="grid gap-1 rounded border border-foreground/8 bg-background/35 p-2 text-xs">
			<span className="flex items-center justify-between gap-2">
				<span className="min-w-0 text-foreground/68">{label}</span>
				<input
					className="h-8 w-24 rounded border border-foreground/10 bg-background px-2 text-right text-foreground/82 outline-none focus:border-primary/45"
					inputMode="decimal"
					max={max}
					min={min}
					step={step}
					type="number"
					value={value}
					onChange={(event) => {
						const nextValue = Number(event.target.value);
						if (Number.isFinite(nextValue)) onChange(nextValue);
					}}
				/>
			</span>
			<span className="text-[0.66rem] text-foreground/38">{description}</span>
		</label>
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
		<label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-foreground/8 bg-foreground/[0.035] p-3 text-foreground/72 text-xs">
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
