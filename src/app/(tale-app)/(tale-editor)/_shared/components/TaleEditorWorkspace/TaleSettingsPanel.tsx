"use client";

import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type {
	Tale,
	TaleBlockSnapSettings,
	TaleSnapConfig,
} from "~/app/(tale-app)/_shared/types";

type SnapGroup = keyof TaleSnapConfig;

/**
 * Renders tale-level metadata and default reader behavior settings.
 *
 * @returns Tale settings form bound to the current editor document.
 *
 * @example
 * <TaleSettingsPanel />
 */
export function TaleSettingsPanel(): React.JSX.Element {
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));

	const updateTale = (next: Tale): void => {
		setTale(next, {
			invalidation: "compilation",
			reason: "tale-settings",
		});
	};

	return (
		<div
			data-reader-component="TaleSettingsPanel"
			data-reader-role="tale-settings-form"
			className="space-y-5"
		>
			<section>
				<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
					Tale Settings
				</p>
				<SettingsText
					label="Title"
					value={tale.title ?? ""}
					onChange={(title) => updateTale({ ...tale, title })}
				/>
				<SettingsTextarea
					label="Description"
					value={tale.description ?? tale.synopsis ?? ""}
					onChange={(description) =>
						updateTale({ ...tale, description, synopsis: description })
					}
				/>
			</section>
			<SnapSettingsGroup
				description="Used by strict snap mode before the scroll enters a transition."
				showCaptureControls={false}
				settings={tale.snapConfig.snap}
				title="Snap"
				onChange={(settings) =>
					updateTale({
						...tale,
						snapConfig: {
							...tale.snapConfig,
							snap: settings,
						},
					})
				}
			/>
			<SnapSettingsGroup
				description="Used by scroll-snap mode after free scrolling finishes near a snap point."
				showCaptureControls
				settings={tale.snapConfig.scrollSnap}
				title="Scroll Snap"
				onChange={(settings) =>
					updateTale({
						...tale,
						snapConfig: {
							...tale.snapConfig,
							scrollSnap: settings,
						},
					})
				}
			/>
		</div>
	);
}

/**
 * Renders one tale snap defaults group.
 *
 * @param props - Snap defaults group props.
 * @returns Snap settings controls.
 *
 * @example
 * <SnapSettingsGroup title="Snap" settings={settings} onChange={setSettings} />
 */
function SnapSettingsGroup({
	description,
	onChange,
	settings,
	showCaptureControls,
	title,
}: {
	description: string;
	onChange: (settings: TaleBlockSnapSettings) => void;
	settings: TaleBlockSnapSettings;
	showCaptureControls: boolean;
	title: string;
}): React.JSX.Element {
	return (
		<section className="rounded border border-foreground/10 bg-foreground/[0.03] p-3">
			<div className="mb-3">
				<p className="font-semibold text-foreground/78 text-xs uppercase">
					{title}
				</p>
				<p className="mt-1 text-foreground/42 text-xs">{description}</p>
			</div>
			<div className="grid @md:grid-cols-2 gap-3">
				{showCaptureControls ? (
					<>
						<SettingsNumber
							label="Capture px"
							value={settings.captureDistancePx}
							onChange={(captureDistancePx) =>
								onChange({ ...settings, captureDistancePx })
							}
						/>
						<SettingsNumber
							label="Min viewport fraction"
							step={0.01}
							value={settings.minViewportFraction}
							onChange={(minViewportFraction) =>
								onChange({ ...settings, minViewportFraction })
							}
						/>
					</>
				) : null}
				<SettingsNumber
					label="Delay ms"
					value={settings.delayMs}
					onChange={(delayMs) => onChange({ ...settings, delayMs })}
				/>
				<SettingsNumber
					label="Duration seconds"
					step={0.01}
					value={settings.durationSeconds}
					onChange={(durationSeconds) =>
						onChange({ ...settings, durationSeconds })
					}
				/>
			</div>
		</section>
	);
}

/**
 * Renders a text input used by tale settings.
 *
 * @param props - Text input props.
 * @returns Labeled text input.
 *
 * @example
 * <SettingsText label="Title" value={title} onChange={setTitle} />
 */
function SettingsText({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="mt-4 block text-foreground/62 text-xs">
			{label}
			<input
				className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

/**
 * Renders a textarea used by tale settings.
 *
 * @param props - Textarea props.
 * @returns Labeled textarea.
 *
 * @example
 * <SettingsTextarea label="Description" value={description} onChange={setDescription} />
 */
function SettingsTextarea({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="mt-3 block text-foreground/62 text-xs">
			{label}
			<textarea
				className="mt-1 min-h-28 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 py-2 text-foreground text-sm outline-none focus:border-primary/60"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

/**
 * Renders an optional numeric setting.
 *
 * @param props - Numeric field props.
 * @returns Labeled numeric input.
 *
 * @example
 * <SettingsNumber label="Delay" value={delay} onChange={setDelay} />
 */
function SettingsNumber({
	label,
	onChange,
	step = 1,
	value,
}: {
	label: string;
	onChange: (value: number | null) => void;
	step?: number;
	value: number | null | undefined;
}): React.JSX.Element {
	return (
		<label className="@container grid gap-1 text-foreground/52 text-xs">
			<span className="font-medium uppercase">{label}</span>
			<input
				className="min-w-0 rounded border border-foreground/12 bg-background px-2 py-2 text-foreground text-xs"
				step={step}
				type="number"
				value={value ?? ""}
				onChange={(event) =>
					onChange(
						event.target.value === "" ? null : Number(event.target.value),
					)
				}
			/>
		</label>
	);
}
