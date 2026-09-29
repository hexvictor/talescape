"use client";

import {
	BookOpen,
	FileText,
	Image as ImageIcon,
	Keyboard,
	Layers3,
	MousePointer2,
	Play,
	Plus,
	ScrollText,
} from "lucide-react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { normalizeTalePlaybackConfig } from "~/app/(tale-app)/_shared/services/readerPlaybackSettings";
import { normalizeTaleBackgroundConfig } from "~/app/(tale-app)/_shared/services/taleBackgroundSettings";
import type {
	ResolvedTaleEntry,
	ResolvedTalePage,
	ResolvedTalePart,
	Tale,
	TaleEntry,
	TalePage,
	TalePart,
	TaleSceneSnapSettings,
	TaleSnapConfig,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import Textarea from "~/components/ui/textarea";

type SnapGroup = keyof TaleSnapConfig;

let narrativeDraftSequence = 0;

function createNarrativeDraftId(): string {
	narrativeDraftSequence += 1;
	return String(-(Date.now() + narrativeDraftSequence));
}

const ENTRY_TYPES = [
	"cover",
	"chapter",
	"prologue",
	"epilogue",
	"interlude",
	"map",
	"quote",
	"ending",
	"codex",
	"appendix",
	"unknown",
] as const;

const PAGE_TYPES = [
	"cover",
	"chapter",
	"prologue",
	"epilogue",
	"interlude",
	"map",
	"quote",
	"ending",
	"illustration",
	"codex",
	"custom",
	"unknown",
] as const;

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
			data-studio-component="TaleSettingsPanel"
			data-studio-role="tale-settings-form"
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
			<NarrativeManager tale={tale} onChange={updateTale} />
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
				description="Used by scroll-snap mode after free active finishes near a snap point."
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

function NarrativeManager({
	onChange,
	tale,
}: {
	onChange: (next: Tale) => void;
	tale: Tale;
}): React.JSX.Element {
	const parts = tale.order.partIds.flatMap((id) => {
		const item = tale.indexMap.partsById[id];
		return item ? [item] : [];
	});
	const entries = tale.order.entryIds.flatMap((id) => {
		const item = tale.indexMap.entriesById[id];
		return item ? [item] : [];
	});
	const pages = tale.order.pageIds.flatMap((id) => {
		const item = tale.indexMap.pagesById[id];
		return item ? [item] : [];
	});
	const updatePart = (id: string, patch: Partial<TalePart>): void => {
		const current = tale.indexMap.partsById[id];
		if (!current) return;
		onChange({
			...tale,
			indexMap: {
				...tale.indexMap,
				partsById: {
					...tale.indexMap.partsById,
					[id]: { ...current, ...patch },
				},
			},
		});
	};
	const updateEntry = (id: string, patch: Partial<TaleEntry>): void => {
		const current = tale.indexMap.entriesById[id];
		if (!current) return;
		onChange({
			...tale,
			indexMap: {
				...tale.indexMap,
				entriesById: {
					...tale.indexMap.entriesById,
					[id]: { ...current, ...patch },
				},
			},
		});
	};
	const updatePage = (id: string, patch: Partial<TalePage>): void => {
		const current = tale.indexMap.pagesById[id];
		if (!current) return;
		onChange({
			...tale,
			indexMap: {
				...tale.indexMap,
				pagesById: {
					...tale.indexMap.pagesById,
					[id]: { ...current, ...patch },
				},
			},
		});
	};
	const addPart = (): void => {
		const id = createNarrativeDraftId();
		const part: ResolvedTalePart = {
			bounds: {
				firstEntryId: null,
				firstPageId: null,
				firstSceneId: null,
				lastEntryId: null,
				lastPageId: null,
				lastSceneId: null,
			},
			counts: { entries: 0, pages: 0, scenes: 0 },
			description: "",
			entryIds: [],
			id,
			links: { nextPartId: null, previousPartId: parts.at(-1)?.id ?? null },
			order: parts.length,
			pageIds: [],
			position: {
				index: parts.length,
				isFirst: parts.length === 0,
				isLast: true,
			},
			sceneIds: [],
			title: `Part ${parts.length + 1}`,
		};
		onChange({
			...tale,
			counts: { ...tale.counts, parts: tale.counts.parts + 1 },
			indexMap: {
				...tale.indexMap,
				partsById: {
					...tale.indexMap.partsById,
					[id]: part,
				},
			},
			order: { ...tale.order, partIds: [...tale.order.partIds, id] },
		});
	};
	const addEntry = (): void => {
		const part = parts[0];
		if (!part) return;
		const id = createNarrativeDraftId();
		const entry: ResolvedTaleEntry = {
			bounds: {
				firstPageId: null,
				firstSceneId: null,
				lastPageId: null,
				lastSceneId: null,
			},
			chapter: {
				isChapter: true,
				localNumber:
					entries.filter((item) => item.partId === part.id).length + 1,
				number: entries.length + 1,
			},
			counts: { pages: 0, scenes: 0 },
			description: "",
			id,
			isNumbered: true,
			links: {
				nextEntryId: null,
				nextEntryIdInPart: null,
				previousEntryId: entries.at(-1)?.id ?? null,
				previousEntryIdInPart:
					entries.filter((item) => item.partId === part.id).at(-1)?.id ?? null,
			},
			order: entries.length,
			pageIds: [],
			partId: part.id,
			position: {
				entryNumber: entries.length + 1,
				index: entries.length,
				isFirst: entries.length === 0,
				isFirstInPart: !entries.some((item) => item.partId === part.id),
				isLast: true,
				isLastInPart: true,
			},
			sceneIds: [],
			title: `Entry ${entries.length + 1}`,
			type: "chapter",
		};
		onChange({
			...tale,
			counts: { ...tale.counts, entries: tale.counts.entries + 1 },
			indexMap: {
				...tale.indexMap,
				entriesById: {
					...tale.indexMap.entriesById,
					[id]: entry,
				},
			},
			order: { ...tale.order, entryIds: [...tale.order.entryIds, id] },
		});
	};
	const addPage = (): void => {
		const entry = entries[0];
		if (!entry) return;
		const id = createNarrativeDraftId();
		const page: ResolvedTalePage = {
			bounds: { firstSceneId: null, lastSceneId: null },
			counts: { scenes: 0 },
			description: "",
			entryId: entry.id,
			id,
			isPaginated: true,
			links: {
				nextPageId: null,
				nextPageIdInEntry: null,
				nextPageIdInPart: null,
				previousPageId: pages.at(-1)?.id ?? null,
				previousPageIdInEntry:
					pages.filter((item) => item.entryId === entry.id).at(-1)?.id ?? null,
				previousPageIdInPart:
					pages.filter((item) => item.partId === entry.partId).at(-1)?.id ??
					null,
			},
			order: pages.length,
			partId: entry.partId,
			position: {
				globalPageNumber: pages.length + 1,
				index: pages.length,
				isFirst: pages.length === 0,
				isFirstInEntry: !pages.some((item) => item.entryId === entry.id),
				isFirstInPart: !pages.some((item) => item.partId === entry.partId),
				isLast: true,
				isLastInEntry: true,
				isLastInPart: true,
				pageNumber: pages.length + 1,
			},
			sceneIds: [],
			title: `Page ${pages.length + 1}`,
			type: "chapter",
		};
		onChange({
			...tale,
			counts: { ...tale.counts, pages: tale.counts.pages + 1 },
			indexMap: {
				...tale.indexMap,
				pagesById: {
					...tale.indexMap.pagesById,
					[id]: page,
				},
			},
			order: {
				...tale.order,
				numberedPageIds: [...tale.order.numberedPageIds, id],
				pageIds: [...tale.order.pageIds, id],
			},
		});
	};

	return (
		<section className="tale-ui-panel grid gap-3 p-3">
			<div className="flex items-center gap-2">
				<BookOpen className="text-primary" size={15} />
				<p className="font-semibold text-xs uppercase">Narrative map</p>
			</div>
			<NarrativeList
				icon={<Layers3 size={14} />}
				items={parts}
				title="Parts"
				onAdd={addPart}
				render={(part) => (
					<>
						<SettingsText
							label="Title"
							value={part.title}
							onChange={(title) => updatePart(part.id, { title })}
						/>
						<SettingsTextarea
							label="Description"
							value={part.description ?? ""}
							onChange={(description) => updatePart(part.id, { description })}
						/>
						<SettingsNumber
							label="Order"
							value={part.order}
							onChange={(order) =>
								updatePart(part.id, { order: order ?? part.order })
							}
						/>
					</>
				)}
			/>
			<NarrativeList
				icon={<BookOpen size={14} />}
				items={entries}
				title="Entries"
				onAdd={addEntry}
				render={(entry) => (
					<>
						<SettingsText
							label="Title"
							value={entry.title}
							onChange={(title) => updateEntry(entry.id, { title })}
						/>
						<div className="grid grid-cols-2 gap-2">
							<SettingsSelect
								label="Part"
								options={parts.map((part) => ({
									label: part.title,
									value: part.id,
								}))}
								value={entry.partId}
								onChange={(partId) => updateEntry(entry.id, { partId })}
							/>
							<SettingsSelect
								label="Type"
								options={ENTRY_TYPES.map((type) => ({
									label: type,
									value: type,
								}))}
								value={entry.type}
								onChange={(type) =>
									updateEntry(entry.id, {
										type: type as TaleEntry["type"],
									})
								}
							/>
						</div>
						<SettingsToggle
							checked={entry.isNumbered}
							label="Number this entry"
							onChange={(isNumbered) => updateEntry(entry.id, { isNumbered })}
						/>
					</>
				)}
			/>
			<NarrativeList
				icon={<FileText size={14} />}
				items={pages}
				title="Pages"
				onAdd={addPage}
				render={(page) => (
					<>
						<SettingsText
							label="Title"
							value={page.title ?? ""}
							onChange={(title) => updatePage(page.id, { title })}
						/>
						<div className="grid grid-cols-2 gap-2">
							<SettingsSelect
								label="Entry"
								options={entries.map((entry) => ({
									label: entry.title,
									value: entry.id,
								}))}
								value={page.entryId}
								onChange={(entryId) => {
									const entry = tale.indexMap.entriesById[entryId];
									updatePage(page.id, {
										entryId,
										partId: entry?.partId ?? page.partId,
									});
								}}
							/>
							<SettingsSelect
								label="Type"
								options={PAGE_TYPES.map((type) => ({
									label: type,
									value: type,
								}))}
								value={page.type}
								onChange={(type) => updatePage(page.id, { type })}
							/>
						</div>
						<SettingsToggle
							checked={page.isPaginated}
							label="Counts as numbered page"
							onChange={(isPaginated) => updatePage(page.id, { isPaginated })}
						/>
					</>
				)}
			/>
		</section>
	);
}

function NarrativeList<Item extends { id: string; title?: string }>({
	icon,
	items,
	onAdd,
	render,
	title,
}: {
	icon: React.ReactNode;
	items: Item[];
	onAdd: () => void;
	render: (item: Item) => React.ReactNode;
	title: string;
}): React.JSX.Element {
	return (
		<details className="border-foreground/12 border-t pt-3" open>
			<summary className="flex cursor-pointer items-center justify-between gap-3 font-black text-xs uppercase">
				<span className="flex items-center gap-2">
					{icon}
					{title}
				</span>
				<Button
					aria-label={`Add ${title}`}
					size="icon"
					type="button"
					variant="ghost"
					onClick={(event) => {
						event.preventDefault();
						onAdd();
					}}
				>
					<Plus size={14} />
				</Button>
			</summary>
			<div className="mt-3 grid gap-3">
				{items.map((item, index) => (
					<details
						className="border border-foreground/12 bg-background p-2"
						key={item.id}
					>
						<summary className="cursor-pointer truncate font-bold text-xs">
							{item.title || `${title.slice(0, -1)} ${index + 1}`}
						</summary>
						<div className="mt-2 grid gap-2">{render(item)}</div>
					</details>
				))}
			</div>
		</details>
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
		<Checkbox
			className="min-h-9 flex-row-reverse justify-between border border-foreground/10 bg-background px-2.5 py-2 text-foreground/72"
			density="compact"
			isSelected={checked}
			onChange={onChange}
		>
			<span className="flex items-center gap-2">
				{Icon ? <Icon size={14} /> : null}
				{label}
			</span>
		</Checkbox>
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
	onChange: (settings: TaleSceneSnapSettings) => void;
	settings: TaleSceneSnapSettings;
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
		<Field className="mt-4" label={label}>
			<Input
				className="w-full"
				density="compact"
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Field>
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

function SettingsSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: { label: string; value: string }[];
	value: string;
}): React.JSX.Element {
	return (
		<Field label={label}>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="w-full" density="compact">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Field>
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
		<Field className="mt-3" label={label}>
			<Textarea
				className="min-h-28 w-full"
				density="compact"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Field>
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
		<Field className="@container" label={label}>
			<Input
				className="min-w-0"
				density="compact"
				step={step}
				type="number"
				value={value ?? ""}
				onChange={(event) =>
					onChange(
						event.target.value === "" ? null : Number(event.target.value),
					)
				}
			/>
		</Field>
	);
}
