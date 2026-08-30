"use client";

import {
	Image as ImageIcon,
	Keyboard,
	MousePointer2,
	Play,
	ScrollText,
} from "lucide-react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { normalizeTalePlaybackConfig } from "~/app/(tale-app)/_shared/services/readerPlaybackSettings";
import { normalizeTaleBackgroundConfig } from "~/app/(tale-app)/_shared/services/taleBackgroundSettings";
import type {
	Tale,
	TaleBlockSnapSettings,
	TaleSnapConfig,
} from "~/app/(tale-app)/_shared/types";

type SnapGroup = keyof TaleSnapConfig;

/**
 * Renders tale-level metadata and default reader behavior settings.
 *
 * @returns Tale settings form bound to the current Studio document.
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
	const playbackConfig = normalizeTalePlaybackConfig(tale.playbackConfig);
	const backgroundConfig = normalizeTaleBackgroundConfig(tale.backgroundConfig);

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
			<section className="tale-ui-panel p-3">
				<div className="mb-3 flex items-center gap-2">
					<ImageIcon className="text-primary" size={15} />
					<p className="font-semibold text-xs uppercase">Tale canvas</p>
				</div>
				{(["light", "dark"] as const).map((theme) => (
					<div className="mt-3 grid gap-2" key={theme}>
						<p className="font-black text-foreground/60 text-xs uppercase">
							{theme} theme
						</p>
						<SettingsColor
							label="Background color"
							value={backgroundConfig[theme].color}
							onChange={(color) =>
								updateTale({
									...tale,
									backgroundConfig: {
										...backgroundConfig,
										[theme]: { ...backgroundConfig[theme], color },
									},
								})
							}
						/>
						<SettingsText
							label="Fixed background image URL"
							value={backgroundConfig[theme].imageUrl ?? ""}
							onChange={(imageUrl) =>
								updateTale({
									...tale,
									backgroundConfig: {
										...backgroundConfig,
										[theme]: {
											...backgroundConfig[theme],
											imageUrl: imageUrl.trim() || null,
										},
									},
								})
							}
						/>
					</div>
				))}
			</section>
			<section className="rounded border border-foreground/10 bg-foreground/[0.03] p-3">
				<div className="mb-3 flex items-start gap-2">
					<Play className="mt-0.5 text-primary" size={15} />
					<div>
						<p className="font-semibold text-foreground/78 text-xs uppercase">
							Autoplay
						</p>
						<p className="mt-1 text-foreground/42 text-xs">
							Start moving through the tale when the reader is ready.
						</p>
					</div>
				</div>
				<SettingsToggle
					checked={playbackConfig.autoplay.enabled}
					label="Enable autoplay"
					onChange={(enabled) =>
						updateTale({
							...tale,
							playbackConfig: {
								...playbackConfig,
								autoplay: { ...playbackConfig.autoplay, enabled },
							},
						})
					}
				/>
				<div className="mt-3">
					<SettingsNumber
						label="Scroll units per second"
						value={playbackConfig.autoplay.speed}
						onChange={(speed) =>
							updateTale({
								...tale,
								playbackConfig: {
									...playbackConfig,
									autoplay: {
										...playbackConfig.autoplay,
										speed: Math.max(1, speed ?? 52),
									},
								},
							})
						}
					/>
				</div>
				<p className="mt-4 mb-2 font-semibold text-foreground/62 text-xs uppercase">
					Pause autoplay when
				</p>
				<div className="grid gap-2">
					<SettingsToggle
						checked={playbackConfig.autoplay.stopOn.scrolling}
						icon={ScrollText}
						label="Reader scrolls"
						onChange={(scrolling) =>
							updateTalePlaybackStopPolicy(tale, playbackConfig, updateTale, {
								scrolling,
							})
						}
					/>
					<SettingsToggle
						checked={playbackConfig.autoplay.stopOn.keyboard}
						icon={Keyboard}
						label="Reader uses keyboard"
						onChange={(keyboard) =>
							updateTalePlaybackStopPolicy(tale, playbackConfig, updateTale, {
								keyboard,
							})
						}
					/>
					<SettingsToggle
						checked={playbackConfig.autoplay.stopOn.dragging}
						icon={MousePointer2}
						label="Reader touches or drags"
						onChange={(dragging) =>
							updateTalePlaybackStopPolicy(tale, playbackConfig, updateTale, {
								dragging,
							})
						}
					/>
				</div>
				<p className="mt-4 mb-2 font-semibold text-foreground/62 text-xs uppercase">
					Reader interactions
				</p>
				<div className="grid gap-2">
					<SettingsToggle
						checked={playbackConfig.interactions.scrolling}
						icon={ScrollText}
						label="Wheel and trackpad"
						onChange={(scrolling) =>
							updateTalePlaybackInteraction(tale, playbackConfig, updateTale, {
								scrolling,
							})
						}
					/>
					<SettingsToggle
						checked={playbackConfig.interactions.keyboard}
						icon={Keyboard}
						label="Keyboard"
						onChange={(keyboard) =>
							updateTalePlaybackInteraction(tale, playbackConfig, updateTale, {
								keyboard,
							})
						}
					/>
					<SettingsToggle
						checked={playbackConfig.interactions.dragging}
						icon={MousePointer2}
						label="Touch and drag"
						onChange={(dragging) =>
							updateTalePlaybackInteraction(tale, playbackConfig, updateTale, {
								dragging,
							})
						}
					/>
				</div>
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

function updateTalePlaybackStopPolicy(
	tale: Tale,
	playbackConfig: Tale["playbackConfig"],
	updateTale: (next: Tale) => void,
	stopOn: Partial<Tale["playbackConfig"]["autoplay"]["stopOn"]>,
): void {
	updateTale({
		...tale,
		playbackConfig: {
			...playbackConfig,
			autoplay: {
				...playbackConfig.autoplay,
				stopOn: { ...playbackConfig.autoplay.stopOn, ...stopOn },
			},
		},
	});
}

function updateTalePlaybackInteraction(
	tale: Tale,
	playbackConfig: Tale["playbackConfig"],
	updateTale: (next: Tale) => void,
	interaction: Partial<Tale["playbackConfig"]["interactions"]>,
): void {
	updateTale({
		...tale,
		playbackConfig: {
			...playbackConfig,
			interactions: { ...playbackConfig.interactions, ...interaction },
		},
	});
}

function SettingsToggle({
	checked,
	icon: Icon,
	label,
	onChange,
}: {
	checked: boolean;
	icon?: typeof Play;
	label: string;
	onChange: (checked: boolean) => void;
}): React.JSX.Element {
	return (
		<label className="flex min-h-9 cursor-pointer items-center justify-between gap-3 rounded border border-foreground/10 bg-background px-2.5 py-2 text-foreground/72 text-xs">
			<span className="flex items-center gap-2">
				{Icon ? <Icon size={14} /> : null}
				{label}
			</span>
			<input
				checked={checked}
				className="h-4 w-4 accent-primary"
				type="checkbox"
				onChange={(event) => onChange(event.target.checked)}
			/>
		</label>
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

function SettingsColor({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="grid gap-1 text-foreground/62 text-xs">
			{label}
			<span className="flex items-center gap-2 border border-foreground/15 bg-background p-2">
				<input
					aria-label={label}
					className="h-7 w-10 cursor-pointer border-0 bg-transparent p-0"
					type="color"
					value={value}
					onChange={(event) => onChange(event.target.value)}
				/>
				<code className="text-xs">{value}</code>
			</span>
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
