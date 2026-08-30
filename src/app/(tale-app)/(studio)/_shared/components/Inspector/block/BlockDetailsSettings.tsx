"use client";

import { Gauge, Plus, Trash2 } from "lucide-react";
import { DEFAULT_BLOCK_AUTOPLAY_CONFIG } from "~/app/(tale-app)/_shared/services/readerPlaybackSettings";
import type {
	ResolvedTaleBlock,
	TaleBlock,
	TaleBlockAutoplayConfig,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";

export function BlockDetailsSettings({
	block,
	onChange,
	onAdd,
	onPaginatedChange,
	onRemove,
}: {
	block: ResolvedTaleBlock;
	onChange: (update: (block: ResolvedTaleBlock) => TaleBlock) => void;
	onAdd?: () => void;
	onPaginatedChange: (value: boolean) => void;
	onRemove?: () => void;
}): React.JSX.Element {
	const autoplay = block.autoplay ?? DEFAULT_BLOCK_AUTOPLAY_CONFIG;
	const updateAutoplay = (update: Partial<TaleBlockAutoplayConfig>) =>
		onChange((item) => ({
			...item,
			autoplay: { ...autoplay, ...update },
		}));

	return (
		<div className="space-y-3">
			<section className="tale-ui-panel grid gap-3 p-3">
				<StudioField
					label="Block name"
					value={block.title}
					onChange={(title) => onChange((item) => ({ ...item, title }))}
				/>
				<label className="grid gap-1 text-xs">
					<span className="font-bold uppercase">Description</span>
					<textarea
						className="min-h-20 border border-foreground bg-background p-2"
						value={block.description ?? ""}
						onChange={(event) =>
							onChange((item) => ({
								...item,
								description: event.target.value,
							}))
						}
					/>
				</label>
				<label className="flex cursor-pointer items-center justify-between gap-3 border border-foreground/20 bg-background p-2 text-xs">
					<span>
						<strong className="block uppercase">Counts as a page</strong>
						<span className="text-foreground/55">
							Excluded blocks remain navigable but are not page-numbered.
						</span>
					</span>
					<input
						checked={block.isPaginated}
						className="h-4 w-4 accent-primary"
						type="checkbox"
						onChange={(event) => onPaginatedChange(event.target.checked)}
					/>
				</label>
				<label className="flex cursor-pointer items-center justify-between gap-3 border border-foreground/20 bg-background p-2 text-xs">
					<span>
						<strong className="block uppercase">Choice block</strong>
						<span className="text-foreground/55">
							Marks this block as a branching decision point.
						</span>
					</span>
					<input
						checked={block.isChoiceBlock}
						className="h-4 w-4 accent-primary"
						type="checkbox"
						onChange={(event) =>
							onChange((item) => ({
								...item,
								isChoiceBlock: event.target.checked,
							}))
						}
					/>
				</label>
			</section>

			<section className="tale-ui-panel p-3">
				<div className="mb-3 flex items-center gap-2">
					<Gauge className="text-primary" size={16} />
					<strong className="text-xs uppercase">Block autoplay timing</strong>
				</div>
				<label className="mb-3 flex items-center justify-between text-xs">
					Use block timing overrides
					<input
						checked={autoplay.enabled}
						className="h-4 w-4 accent-primary"
						type="checkbox"
						onChange={(event) =>
							updateAutoplay({ enabled: event.target.checked })
						}
					/>
				</label>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						label="Enter speed"
						value={autoplay.enteringSpeed}
						onChange={(enteringSpeed) => updateAutoplay({ enteringSpeed })}
					/>
					<NumberField
						label="Reading speed"
						value={autoplay.readingSpeed}
						onChange={(readingSpeed) => updateAutoplay({ readingSpeed })}
					/>
					<NumberField
						label="Leave speed"
						value={autoplay.leavingSpeed}
						onChange={(leavingSpeed) => updateAutoplay({ leavingSpeed })}
					/>
					<NumberField
						label="Pause after enter (s)"
						value={autoplay.pauseAfterEnteringSeconds}
						onChange={(pauseAfterEnteringSeconds) =>
							updateAutoplay({ pauseAfterEnteringSeconds })
						}
					/>
					<NumberField
						label="Pause before leave (s)"
						value={autoplay.pauseBeforeLeavingSeconds}
						onChange={(pauseBeforeLeavingSeconds) =>
							updateAutoplay({ pauseBeforeLeavingSeconds })
						}
					/>
				</div>
			</section>

			<div className="grid grid-cols-2 gap-2">
				{onAdd ? (
					<Button type="button" variant="secondary" onClick={onAdd}>
						<Plus size={15} /> Add block
					</Button>
				) : null}
				{onRemove ? (
					<Button type="button" variant="destructive" onClick={onRemove}>
						<Trash2 size={15} /> Remove block
					</Button>
				) : null}
			</div>
		</div>
	);
}

function StudioField({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="grid gap-1 text-xs">
			<span className="font-bold uppercase">{label}</span>
			<input
				className="h-9 border border-foreground bg-background px-2"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

function NumberField({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: number | null) => void;
	value: number | null;
}): React.JSX.Element {
	return (
		<label className="grid gap-1 text-xs">
			<span className="font-bold text-foreground/65 uppercase">{label}</span>
			<input
				className="min-w-0 border border-foreground/30 bg-background p-2"
				min={0}
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
