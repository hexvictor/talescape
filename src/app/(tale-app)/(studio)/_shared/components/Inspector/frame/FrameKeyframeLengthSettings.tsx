"use client";

import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import type {
	FrameActiveLengthConfig,
	ResolvedTaleKeyframe,
} from "~/app/(tale-app)/_shared/types";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import { InspectorSelect } from "../InspectorValueFields";

const SCALE = 10_000;

/**
 * Edits the Frame-owned active reading span and its Keyframe distribution.
 * Internal range inputs are linked handles: moving a boundary only transfers
 * span between the two neighbouring Keyframes.
 */
export function FrameKeyframeLengthSettings({
	keyframes,
	onChange,
	progression,
}: {
	keyframes: ResolvedTaleKeyframe[];
	onChange: (progression: FrameActiveLengthConfig) => void;
	progression?: FrameActiveLengthConfig;
}): React.JSX.Element | null {
	if (keyframes.length === 0) return null;
	const config: FrameActiveLengthConfig = progression ?? {
		mode: "content",
		unit: "percentage",
	};
	const values = normalizedValues(keyframes, config);
	const compiled = useTaleReaderStore((state) => state.reader.compiled);
	const isContent = config.mode === "content";
	const total = values.reduce((sum, value) => sum + value, 0);
	const percentages = values.map((value) => Math.round((value / total) * 100));
	const lengths = keyframes.map((keyframe, index) => {
		const compiledLength = compiled?.segments
			.filter(
				(segment) =>
					segment.type === "reading" && segment.keyframeId === keyframe.id,
			)
			.reduce((sum, segment) => sum + segment.length, 0);
		return compiledLength && compiledLength > 0
			? compiledLength
			: (values[index] ?? 0) / Math.max(total, 1);
	});
	const setMode = (mode: FrameActiveLengthConfig["mode"]) =>
		onChange({ ...config, mode });
	const setAllocation = (nextValues: number[]) =>
		onChange({
			...config,
			allocations: Object.fromEntries(
				keyframes.map((keyframe, index) => [
					keyframe.id,
					Math.max(0, Math.round(nextValues[index] ?? 0)),
				]),
			),
		});

	return (
		<section
			data-reader-component="FrameKeyframeLengthSettings"
			data-reader-role="frame-keyframe-length-settings"
			data-studio-component="FrameKeyframeLengthSettings"
			data-studio-role="frame-keyframe-length-settings"
			className="tale-ui-panel grid gap-3 p-3 text-xs"
		>
			<div>
				<p className="font-black uppercase">Active reading span</p>
				<p className="mt-1 text-[10px] text-foreground/48">
					Frame-owned reading length. Scene container padding is excluded; this
					Frame&apos;s content, layout, and padding are included.
				</p>
			</div>
			<Field label="Active length mode">
				<InspectorSelect
					label="Active length mode"
					value={config.mode}
					options={[
						{ label: "Fit frame content", value: "content" },
						{ label: "Set lengths manually", value: "manual" },
					]}
					onChange={(value) =>
						setMode(value as FrameActiveLengthConfig["mode"])
					}
				/>
			</Field>
			{isContent ? (
				<>
					<Field label="Distribution display">
						<InspectorSelect
							label="Distribution display"
							value={config.unit ?? "percentage"}
							options={[
								{ label: "Percent of frame span", value: "percentage" },
								{ label: "Relative frame length", value: "length" },
							]}
							onChange={(value) =>
								onChange({
									...config,
									unit: value as "length" | "percentage",
								})
							}
						/>
					</Field>
					<KeyframeDistribution
						lengths={lengths}
						keyframes={keyframes}
						percentages={percentages}
						values={values}
						display={config.unit ?? "percentage"}
						onChange={setAllocation}
					/>
				</>
			) : (
				<div className="grid gap-2">
					<p className="text-[10px] text-foreground/48">
						Each Keyframe receives exactly the scroll length below. These values
						do not need to add up to the Frame&apos;s content size.
					</p>
					{keyframes.map((keyframe, index) => (
						<Field label={keyframe.title} key={keyframe.id}>
							<Input
								aria-label={keyframe.title}
								density="compact"
								min={0}
								type="number"
								value={values[index] ?? 0}
								onChange={(event) => {
									const next = [...values];
									next[index] = Math.max(0, Number(event.target.value));
									setAllocation(next);
								}}
							/>
						</Field>
					))}
				</div>
			)}
		</section>
	);
}

function KeyframeDistribution({
	display,
	keyframes,
	lengths,
	onChange,
	percentages,
	values,
}: {
	display: "length" | "percentage";
	keyframes: ResolvedTaleKeyframe[];
	lengths: number[];
	onChange: (values: number[]) => void;
	percentages: number[];
	values: number[];
}): React.JSX.Element {
	const total = values.reduce((sum, value) => sum + value, 0);
	const boundaries = values
		.slice(0, -1)
		.map((_, index) =>
			values.slice(0, index + 1).reduce((sum, value) => sum + value, 0),
		);
	return (
		<div className="grid gap-3">
			<div className="flex h-8 overflow-hidden border border-foreground/20 bg-background">
				{percentages.map((percentage, index) => (
					<div
						className="grid min-w-0 place-items-center border-foreground/15 border-r bg-primary/10 font-bold text-[10px] last:border-r-0"
						key={keyframes[index]?.id}
						style={{ width: `${percentage}%` }}
					>
						<span className="truncate px-1">
							{display === "percentage"
								? `${percentage}%`
								: `${Math.round(lengths[index] ?? 0)}px`}
						</span>
					</div>
				))}
			</div>
			<div className="grid gap-2">
				{boundaries.map((boundary, index) => {
					const previous = index === 0 ? 0 : (boundaries[index - 1] ?? 0);
					const next = boundaries[index + 1] ?? total;
					return (
						<Slider
							key={keyframes[index]?.id}
							density="compact"
							label={`${keyframes[index]?.title} / ${keyframes[index + 1]?.title}`}
							maxValue={Math.max(previous + 1, next - 1)}
							minValue={previous + 1}
							value={boundary}
							onChange={(moved) => {
								const result = [...values];
								const delta = moved - boundary;
								result[index] = Math.max(1, (result[index] ?? 0) + delta);
								result[index + 1] = Math.max(
									1,
									(result[index + 1] ?? 0) - delta,
								);
								onChange(result);
							}}
						/>
					);
				})}
			</div>
		</div>
	);
}

function normalizedValues(
	keyframes: ResolvedTaleKeyframe[],
	config: FrameActiveLengthConfig,
): number[] {
	const existing = keyframes.map(
		(keyframe) => config.allocations?.[keyframe.id],
	);
	if (existing.every((value) => typeof value === "number" && value >= 0))
		return existing as number[];
	const base = Math.floor(SCALE / keyframes.length);
	return keyframes.map(
		(_, index) => base + (index === 0 ? SCALE % keyframes.length : 0),
	);
}
