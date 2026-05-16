"use client";

import { useEffect, useState } from "react";
import { useReaderStore } from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import {
	READER_INPUT_BINDING_SETTINGS,
	type ReaderInputBindingSettings,
} from "~/app/(tale-reader)/_shared/scroll-engine/readerInputSettings";
import { DebugCard } from "./DebugPrimitives";

const settingGroups: {
	keys: (keyof ReaderInputBindingSettings)[];
	title: string;
}[] = [
	{
		title: "Snap",
		keys: [
			"snapDuration",
			"snapEase",
			"releaseThreshold",
			"wheelStopSnapDelayMs",
			"wheelSnapBypassBurstCount",
		],
	},
	{
		title: "Keyboard Scroll",
		keys: [
			"keyboardBaseStepPx",
			"keyboardAccelerationPx",
			"keyboardSustainedAccelerationDelayMs",
			"keyboardSustainedAccelerationMultiplier",
			"keyboardMaxStepPx",
			"keyboardHoldIntervalMs",
			"keyboardDuration",
			"keyboardEase",
		],
	},
	{
		title: "Touch Drag",
		keys: [
			"touchDragGentleDistancePx",
			"touchDragGentleVelocityPxPerMs",
			"touchDragScrollMultiplier",
			"touchDragStopSnapDelayMs",
		],
	},
	{
		title: "Wheel Scroll",
		keys: [
			"wheelBaseStepPx",
			"wheelAccelerationPx",
			"wheelSustainedAccelerationDelayMs",
			"wheelSustainedAccelerationMultiplier",
			"wheelMaxStepPx",
			"wheelDuration",
			"wheelEase",
		],
	},
];

const easeOptions: gsap.EaseString[] = [
	"none",
	"power1.out",
	"power1.inOut",
	"power2.out",
	"power2.inOut",
	"power3.out",
	"power3.inOut",
	"expo.out",
	"expo.inOut",
];

export function SettingsDebugPanel() {
	const inputSettings = useReaderStore((s) => s.debug.inputSettings);
	const setInputSettings = useReaderStore((s) => s.debug.setInputSettings);
	const [draft, setDraft] = useState(() => ({
		...READER_INPUT_BINDING_SETTINGS,
		...inputSettings,
	}));
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const normalizedInputSettings = {
		...READER_INPUT_BINDING_SETTINGS,
		...inputSettings,
	};
	const isDirty = !settingsAreEqual(draft, normalizedInputSettings);

	useEffect(() => {
		setDraft({
			...READER_INPUT_BINDING_SETTINGS,
			...inputSettings,
		});
	}, [inputSettings]);

	useEffect(() => {
		if (!statusMessage) return;
		const timeoutId = window.setTimeout(() => setStatusMessage(null), 2200);
		return () => window.clearTimeout(timeoutId);
	}, [statusMessage]);

	const updateDraft = (
		key: keyof ReaderInputBindingSettings,
		value: string,
	) => {
		const defaultValue = READER_INPUT_BINDING_SETTINGS[key];

		setDraft((current): ReaderInputBindingSettings => {
			if (typeof defaultValue === "number") {
				return {
					...current,
					[key]: parseNumericSetting(value, Number(current[key])),
				} as ReaderInputBindingSettings;
			}

			return {
				...current,
				[key]: value as gsap.EaseString,
			} as ReaderInputBindingSettings;
		});
	};

	return (
		<form
			className="grid gap-3 md:grid-cols-2"
			onSubmit={(event) => {
				event.preventDefault();
				setInputSettings(draft);
				setStatusMessage("Settings saved.");
			}}
		>
			{settingGroups.map((group) => (
				<DebugCard key={group.title} title={group.title}>
					{group.keys.map((key) => (
						<SettingInput
							key={key}
							name={key}
							value={draft[key]}
							onChange={(value) => updateDraft(key, value)}
						/>
					))}
				</DebugCard>
			))}
			<div className="flex flex-wrap items-center gap-2">
				{isDirty ? (
					<button
						type="submit"
						className="rounded-full bg-white px-4 py-2 font-semibold text-black text-xs transition hover:bg-white/85"
					>
						Save settings
					</button>
				) : null}
				<button
					type="button"
					className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white text-xs transition hover:bg-white/15"
					onClick={() => setDraft(normalizedInputSettings)}
				>
					Reset draft
				</button>
				<button
					type="button"
					className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white text-xs transition hover:bg-white/15"
					onClick={() => {
						setDraft(READER_INPUT_BINDING_SETTINGS);
						setInputSettings(READER_INPUT_BINDING_SETTINGS);
						setStatusMessage("Defaults reset.");
					}}
				>
					Reset defaults
				</button>
				{statusMessage ? (
					<p className="font-semibold text-emerald-200 text-xs">
						{statusMessage}
					</p>
				) : null}
			</div>
		</form>
	);
}

function SettingInput({
	name,
	onChange,
	value,
}: {
	name: keyof ReaderInputBindingSettings;
	onChange: (value: string) => void;
	value: ReaderInputBindingSettings[keyof ReaderInputBindingSettings];
}) {
	const isNumeric = typeof READER_INPUT_BINDING_SETTINGS[name] === "number";
	const inputId = `reader-debug-setting-${name}`;

	return (
		<div className="min-w-0 rounded-lg bg-black/25 px-2.5 py-2">
			<label
				className="mb-1 block truncate font-semibold text-[10px] text-white/45 uppercase tracking-wide"
				htmlFor={inputId}
			>
				{formatSettingName(name)}
			</label>
			{isNumeric ? (
				<input
					className="h-8 w-full rounded-md border border-white/10 bg-black/40 px-2 text-white text-xs outline-none transition focus:border-white/35"
					id={inputId}
					inputMode="decimal"
					step="any"
					type="number"
					value={Number(value)}
					onChange={(event) => onChange(event.target.value)}
				/>
			) : (
				<select
					className="h-8 w-full rounded-md border border-white/10 bg-black/40 px-2 text-white text-xs outline-none transition focus:border-white/35"
					id={inputId}
					value={String(value)}
					onChange={(event) => onChange(event.target.value)}
				>
					{easeOptions.map((ease) => (
						<option key={ease} value={ease}>
							{ease}
						</option>
					))}
				</select>
			)}
		</div>
	);
}

function formatSettingName(name: keyof ReaderInputBindingSettings) {
	return name.replace(/([A-Z])/g, " $1").replace(/px|ms/gi, (unit) => {
		return ` ${unit.toUpperCase()}`;
	});
}

function settingsAreEqual(
	left: ReaderInputBindingSettings,
	right: ReaderInputBindingSettings,
) {
	return Object.keys(READER_INPUT_BINDING_SETTINGS).every((key) => {
		const settingKey = key as keyof ReaderInputBindingSettings;
		return left[settingKey] === right[settingKey];
	});
}

function parseNumericSetting(value: string, fallback: number) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}
