"use client";

import { useEffect, useState } from "react";
import { useReaderStore } from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import {
	READER_INPUT_BINDING_SETTINGS,
	type ReaderInputBindingSettings,
} from "~/app/(tale-reader)/_shared/scroll-engine/readerInputSettings";
import { DebugCard, DebugHelp } from "./DebugPrimitives";

const settingGroups: {
	description: string;
	keys: (keyof ReaderInputBindingSettings)[];
	title: string;
}[] = [
	{
		title: "Snap",
		description:
			"Shared snap animation and the idle delays that decide when each input should snap after free scrolling stops.",
		keys: [
			"snapDuration",
			"snapEase",
			"releaseThreshold",
			"keyboardStopSnapDelayMs",
			"wheelStopSnapDelayMs",
		],
	},
	{
		title: "Keyboard Scroll",
		description:
			"Arrow key step size, repeated-press acceleration, hold cadence, and keyboard tween feel.",
		keys: [
			"keyboardFreeScrollEnabled",
			"keyboardBaseStepPx",
			"keyboardBurstFreeScrollCount",
			"keyboardBurstWindowMs",
			"keyboardAccelerationPx",
			"keyboardRepeatMultiplier",
			"keyboardMaxStepPx",
			"keyboardHoldIntervalMs",
			"keyboardDuration",
			"keyboardEase",
		],
	},
	{
		title: "Touch Drag",
		description:
			"Mobile swipe gesture rules. A single swipe can snap adjacent blocks; repeated swipes switch into free scroll.",
		keys: [
			"touchDragFreeScrollEnabled",
			"touchDragBaseMultiplier",
			"touchDragHorizontalMultiplier",
			"touchDragFreeGestureCount",
			"touchDragRepeatMultiplier",
			"touchDragWindowMs",
			"touchDragStopSnapDelayMs",
		],
	},
	{
		title: "Desktop Drag",
		description:
			"Mouse drag tuning for desktop. It has its own multiplier because mouse dragging has less natural momentum than touch.",
		keys: [
			"desktopDragFreeScrollEnabled",
			"desktopDragBaseMultiplier",
			"desktopDragFreeGestureCount",
			"desktopDragRepeatMultiplier",
			"desktopDragWindowMs",
			"desktopDragStopSnapDelayMs",
		],
	},
	{
		title: "Wheel Scroll",
		description:
			"Wheel and trackpad repeated-scroll acceleration plus the delay before idle snap checks run.",
		keys: [
			"wheelFreeScrollEnabled",
			"wheelBaseStepPx",
			"wheelFreeScrollEventCount",
			"wheelAccelerationPx",
			"wheelRepeatMultiplier",
			"wheelMaxStepPx",
			"wheelDuration",
			"wheelEase",
		],
	},
];

const settingMeta: Record<
	keyof ReaderInputBindingSettings,
	{ description: string; label: string }
> = {
	desktopDragBaseMultiplier: {
		label: "Desktop Drag Speed",
		description:
			"Multiplier applied to mouse drag distance. Higher values make desktop click-drag scroll farther.",
	},
	desktopDragFreeGestureCount: {
		label: "Desktop Free Count",
		description:
			"How many same-direction mouse drags can happen before desktop drag skips adjacent snap checks and free-scrolls.",
	},
	desktopDragFreeScrollEnabled: {
		label: "Desktop Free Scroll",
		description:
			"When on, mouse drag skips the first adjacent snap and scrolls freely until idle auto-snap checks run.",
	},
	desktopDragRepeatMultiplier: {
		label: "Desktop Repeat Boost",
		description:
			"Exponential multiplier for consecutive desktop drags after the free-count threshold.",
	},
	desktopDragStopSnapDelayMs: {
		label: "Desktop Snap Delay",
		description:
			"Milliseconds after desktop drag movement stops before the engine checks for an idle snap.",
	},
	desktopDragWindowMs: {
		label: "Desktop Repeat Window",
		description:
			"Maximum time between desktop drag gestures for them to count as one repeated burst.",
	},
	keyboardAccelerationPx: {
		label: "Key Acceleration",
		description:
			"Extra pixels added for each repeated arrow press or hold tick before the repeat multiplier.",
	},
	keyboardBaseStepPx: {
		label: "Key Base Step",
		description:
			"Starting pixel step for one arrow key movement before acceleration.",
	},
	keyboardBurstFreeScrollCount: {
		label: "Key Free Count",
		description:
			"Number of repeated arrow inputs allowed before keyboard switches from adjacent snap attempts to free scroll.",
	},
	keyboardBurstWindowMs: {
		label: "Key Repeat Window",
		description:
			"Maximum time between arrow inputs for them to count as the same repeated burst.",
	},
	keyboardDuration: {
		label: "Key Tween Time",
		description: "Duration of the keyboard scroll tween in seconds.",
	},
	keyboardEase: {
		label: "Key Ease",
		description: "GSAP easing used for keyboard scroll tweens.",
	},
	keyboardFreeScrollEnabled: {
		label: "Key Free Scroll",
		description:
			"When on, arrow keys skip the first adjacent snap and scroll freely until idle auto-snap checks run.",
	},
	keyboardHoldIntervalMs: {
		label: "Key Hold Tick",
		description:
			"How often a held arrow key adds another scroll step and acceleration count.",
	},
	keyboardMaxStepPx: {
		label: "Key Max Step",
		description: "Maximum keyboard step after acceleration and repeat boost.",
	},
	keyboardRepeatMultiplier: {
		label: "Key Repeat Boost",
		description:
			"Exponential multiplier used once repeated keyboard input passes the free-count threshold.",
	},
	keyboardStopSnapDelayMs: {
		label: "Key Snap Delay",
		description:
			"Milliseconds after keyboard scrolling stops before the idle snap check runs.",
	},
	releaseThreshold: {
		label: "Drag Threshold",
		description:
			"Minimum combined drag distance before a released touch or mouse drag counts as a gesture.",
	},
	snapDuration: {
		label: "Snap Time",
		description: "Duration of snap animations in seconds.",
	},
	snapEase: {
		label: "Snap Ease",
		description: "GSAP easing used when snapping to a block.",
	},
	touchDragFreeGestureCount: {
		label: "Touch Free Count",
		description:
			"How many same-direction touch swipes can happen before touch drag free-scrolls instead of snapping adjacent blocks.",
	},
	touchDragBaseMultiplier: {
		label: "Touch Drag Speed",
		description:
			"Multiplier applied to touch drag distance. Higher values make mobile drag scroll farther.",
	},
	touchDragHorizontalMultiplier: {
		label: "Touch Horizontal Boost",
		description:
			"Extra multiplier applied only to horizontal touch movement before diagonal intent is combined.",
	},
	touchDragFreeScrollEnabled: {
		label: "Touch Free Scroll",
		description:
			"When on, touch drag skips the first adjacent snap and scrolls freely until idle auto-snap checks run.",
	},
	touchDragRepeatMultiplier: {
		label: "Touch Repeat Boost",
		description:
			"Exponential multiplier for sustained same-direction touch drag movement.",
	},
	touchDragStopSnapDelayMs: {
		label: "Touch Snap Delay",
		description:
			"Milliseconds after touch drag movement stops before the engine checks for an idle snap.",
	},
	touchDragWindowMs: {
		label: "Touch Repeat Window",
		description:
			"Maximum time between touch swipes for them to count as the same repeated burst.",
	},
	wheelAccelerationPx: {
		label: "Wheel Acceleration",
		description:
			"Extra pixels added as wheel events repeat in the same direction.",
	},
	wheelBaseStepPx: {
		label: "Wheel Base Step",
		description: "Starting pixel step for one wheel event before acceleration.",
	},
	wheelDuration: {
		label: "Wheel Tween Time",
		description: "Duration of the wheel scroll tween in seconds.",
	},
	wheelEase: {
		label: "Wheel Ease",
		description: "GSAP easing used for wheel scroll tweens.",
	},
	wheelFreeScrollEventCount: {
		label: "Wheel Free Count",
		description:
			"Number of same-direction wheel events allowed before wheel switches from adjacent snap attempts to free scroll.",
	},
	wheelFreeScrollEnabled: {
		label: "Wheel Free Scroll",
		description:
			"When on, wheel input skips the first adjacent snap and scrolls freely until idle auto-snap checks run.",
	},
	wheelMaxStepPx: {
		label: "Wheel Max Step",
		description: "Maximum wheel step after acceleration and repeat boost.",
	},
	wheelRepeatMultiplier: {
		label: "Wheel Repeat Boost",
		description:
			"Exponential multiplier used once repeated wheel input passes the free-count threshold.",
	},
	wheelStopSnapDelayMs: {
		label: "Wheel Snap Delay",
		description:
			"Milliseconds after wheel or middle-button/native scrolling stops before the idle snap check runs.",
	},
};

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

			if (typeof defaultValue === "boolean") {
				return {
					...current,
					[key]: value === "true",
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
				<DebugCard
					key={group.title}
					description={group.description}
					title={group.title}
				>
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
	const isBoolean = typeof READER_INPUT_BINDING_SETTINGS[name] === "boolean";
	const inputId = `reader-debug-setting-${name}`;
	const meta = settingMeta[name];

	return (
		<div className="min-w-0 rounded-lg bg-black/25 px-2.5 py-2">
			<div
				className="mb-1 flex min-w-0 items-center gap-1"
				title={meta.description}
			>
				<label
					className="truncate font-semibold text-[10px] text-white/55 uppercase tracking-wide"
					htmlFor={inputId}
				>
					{meta.label}
				</label>
				<DebugHelp description={meta.description} />
			</div>
			<p
				className="mb-1 truncate font-mono text-[9px] text-white/30"
				title={String(name)}
			>
				{name}
			</p>
			{isBoolean ? (
				<label
					className="flex h-8 items-center gap-2 rounded-md border border-white/10 bg-black/40 px-2 text-white text-xs"
					htmlFor={inputId}
				>
					<input
						id={inputId}
						type="checkbox"
						checked={Boolean(value)}
						onChange={(event) => onChange(String(event.target.checked))}
					/>
					<span>{value ? "On" : "Off"}</span>
				</label>
			) : isNumeric ? (
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
