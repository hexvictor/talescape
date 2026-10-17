"use client";

import { useEffect, useState } from "react";
import { ColorPicker } from "~/components/ui/color-picker";
import Input from "~/components/ui/input";
import { Decorations } from "./decorations";
import { resolveDecorationColor } from "./primitives";
import {
	type AccentStreakDecoration,
	type Decoration,
	type DecorationColor,
	type DecorationDensity,
	type DecorationDirection,
	type DecorationPosition,
	type HalftoneDecoration,
	type SpeedLinesDecoration,
	decorationColorTokens,
	decorationKinds,
	decorationPositions,
} from "./types";

const densities: DecorationDensity[] = [
	"minimal",
	"sparse",
	"airy",
	"medium",
	"dense",
	"packed",
];
const directions: DecorationDirection[] = [
	"right",
	"left",
	"up",
	"down",
	"down-right",
	"down-left",
	"up-right",
	"up-left",
];

type DecorationKind = Decoration["type"];

type CommonSettings = {
	aspectRatio: number;
	color: DecorationColor;
	coverage: number;
	offsetUnit: "percent" | "px";
	offsetX: number;
	offsetY: number;
	opacity: number;
	position: DecorationPosition;
	rotation: number;
	scale: number;
};

const initialCommon: CommonSettings = {
	aspectRatio: 1,
	color: "cyan",
	coverage: 0.78,
	offsetUnit: "percent",
	offsetX: 0,
	offsetY: 0,
	opacity: 0.82,
	position: "center",
	rotation: 0,
	scale: 1,
};

const colorSwatches = decorationColorTokens.map((value) => ({
	value,
	label: value,
	color: resolveDecorationColor(value),
}));

const initialHalftone: Omit<HalftoneDecoration, "type"> = {
	decayMode: "both",
	density: "medium",
	dotSize: 3,
	falloff: 0.82,
	minimumOpacity: 0,
	shape: "circle",
	spacing: 21,
	variant: "classic",
};

const initialSpeedLines: Omit<SpeedLinesDecoration, "type"> = {
	angle: 0,
	density: "medium",
	endOpacity: 1,
	endWidth: 0.08,
	jitter: 0.65,
	length: 0.72,
	originOpacity: 0,
	originRadius: 0.2,
	quantity: 16,
	shape: "field",
	shapeMode: "inside",
	spread: 90,
	startOpacity: 1,
	startWidth: 1,
	strokeWidth: 2,
	vignetteFeather: 0.18,
	vignetteRadius: 0.28,
	variant: "tapered",
};

const initialAccent: Omit<AccentStreakDecoration, "type"> = {
	angle: 0,
	density: "medium",
	direction: "down-right",
	length: 0.72,
	quantity: 4,
	splatter: 0.38,
	thickness: 78,
	variant: "brush",
};

export function SelectControl<T extends string>({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: T) => void;
	options: readonly T[];
	value: T;
}) {
	return (
		<label className="grid gap-1.5 font-bold text-sm">
			{label}
			<select
				aria-label={label}
				className="h-9 border border-border bg-background px-2 font-normal normal-case"
				onChange={(event) => onChange(event.target.value as T)}
				value={value}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option.replaceAll("-", " ")}
					</option>
				))}
			</select>
		</label>
	);
}

function RangeControl({
	label,
	max,
	min,
	onChange,
	step,
	value,
}: {
	label: string;
	max: number;
	min: number;
	onChange: (value: number) => void;
	step: number;
	value: number;
}) {
	const [draft, setDraft] = useState(String(value));
	useEffect(() => setDraft(String(value)), [value]);
	const bounded =
		label.toLowerCase().includes("opacity") || label === "Modulation";
	const commit = (n: number) =>
		onChange(Math.max(min, bounded ? Math.min(1, n) : n));
	return (
		<div className="grid gap-1 font-bold text-xs uppercase">
			<span className="flex justify-between gap-3">
				{label}
				<Input
					aria-label={`${label} value`}
					className="h-7 w-24 font-mono font-normal"
					type="number"
					value={draft}
					step={step}
					min={min}
					max={
						label.toLowerCase().includes("opacity") || label === "Modulation"
							? 1
							: undefined
					}
					onChange={(event) => {
						setDraft(event.target.value);
						const n = event.target.valueAsNumber;
						if (Number.isFinite(n) && n >= min) commit(n);
					}}
					onBlur={() => {
						const n = Number.parseFloat(draft);
						if (Number.isFinite(n)) {
							const next = Math.max(min, bounded ? Math.min(1, n) : n);
							setDraft(String(next));
							commit(next);
						} else setDraft(String(value));
					}}
				/>
			</span>
			<Input
				aria-label={label}
				max={Math.max(max, value)}
				min={min}
				onChange={(event) => onChange(event.target.valueAsNumber)}
				step={step}
				type="range"
				value={value}
			/>
		</div>
	);
}

function CommonControls({
	settings,
	setSettings,
}: {
	settings: CommonSettings;
	setSettings: React.Dispatch<React.SetStateAction<CommonSettings>>;
}) {
	const update = <Key extends keyof CommonSettings>(
		key: Key,
		value: CommonSettings[Key],
	) => setSettings((current) => ({ ...current, [key]: value }));

	return (
		<>
			<ColorPicker
				label="Color"
				onChange={(value) => update("color", value)}
				swatches={colorSwatches}
				density="compact"
				value={settings.color}
			/>
			<SelectControl
				label="Position"
				onChange={(value) => update("position", value)}
				options={decorationPositions}
				value={settings.position}
			/>
			<RangeControl
				label="Size"
				max={6}
				min={0.1}
				onChange={(value) => update("coverage", value)}
				step={0.05}
				value={settings.coverage}
			/>
			<SelectControl
				label="Offset unit"
				onChange={(value) => update("offsetUnit", value)}
				options={["percent", "px"]}
				value={settings.offsetUnit}
			/>
			<RangeControl
				label="X offset"
				max={settings.offsetUnit === "percent" ? 100 : 500}
				min={settings.offsetUnit === "percent" ? -100 : -500}
				onChange={(value) => update("offsetX", value)}
				step={settings.offsetUnit === "percent" ? 1 : 5}
				value={settings.offsetX}
			/>
			<RangeControl
				label="Y offset"
				max={settings.offsetUnit === "percent" ? 100 : 500}
				min={settings.offsetUnit === "percent" ? -100 : -500}
				onChange={(value) => update("offsetY", value)}
				step={settings.offsetUnit === "percent" ? 1 : 5}
				value={settings.offsetY}
			/>
			<RangeControl
				label="Shape ratio"
				max={3}
				min={0.5}
				onChange={(value) => update("aspectRatio", value)}
				step={0.1}
				value={settings.aspectRatio}
			/>
			<RangeControl
				label="Opacity"
				max={1}
				min={0}
				onChange={(value) => update("opacity", value)}
				step={0.05}
				value={settings.opacity}
			/>
			<RangeControl
				label="Scale"
				max={6}
				min={0.25}
				onChange={(value) => update("scale", value)}
				step={0.05}
				value={settings.scale}
			/>
			<RangeControl
				label="Rotation"
				max={180}
				min={-180}
				onChange={(value) => update("rotation", value)}
				step={1}
				value={settings.rotation}
			/>
		</>
	);
}

function HalftoneControls({
	settings,
	setSettings,
}: {
	settings: Omit<HalftoneDecoration, "type">;
	setSettings: React.Dispatch<
		React.SetStateAction<Omit<HalftoneDecoration, "type">>
	>;
}) {
	const update = <Key extends keyof typeof settings>(
		key: Key,
		value: (typeof settings)[Key],
	) => setSettings((current) => ({ ...current, [key]: value }));

	return (
		<>
			<SelectControl
				label="Variant"
				onChange={(value) => update("variant", value)}
				options={["classic", "soft", "bold", "distressed"]}
				value={settings.variant ?? "classic"}
			/>
			<SelectControl
				label="Shape"
				onChange={(value) => update("shape", value)}
				options={[
					"circle",
					"field",
					"random",
					"rectangle",
					"speed-lines",
					"triangle",
					"vignette",
				]}
				value={settings.shape ?? "circle"}
			/>
			<SelectControl
				label="Density"
				onChange={(value) => update("density", value)}
				options={densities}
				value={settings.density ?? "medium"}
			/>
			<SelectControl
				label="Decay mode"
				onChange={(value) => update("decayMode", value)}
				options={["both", "size", "opacity"]}
				value={settings.decayMode ?? "both"}
			/>
			<SelectControl
				label="Growth origin"
				options={decorationPositions}
				value={settings.decayOrigin ?? "center"}
				onChange={(value) => update("decayOrigin", value)}
			/>
			<RangeControl
				label="Dot size"
				max={32}
				min={0.1}
				onChange={(value) => update("dotSize", value)}
				step={0.5}
				value={settings.dotSize ?? 3}
			/>
			<RangeControl
				label="Spacing"
				max={120}
				min={0.5}
				onChange={(value) => update("spacing", value)}
				step={1}
				value={settings.spacing ?? 21}
			/>
			<RangeControl
				label="Falloff"
				max={5}
				min={0.05}
				onChange={(value) => update("falloff", value)}
				step={0.05}
				value={settings.falloff ?? 0.82}
			/>
			<RangeControl
				label="Minimum opacity"
				max={1}
				min={0}
				onChange={(value) => update("minimumOpacity", value)}
				step={0.05}
				value={settings.minimumOpacity ?? 0}
			/>
		</>
	);
}

function SpeedLineControls({
	settings,
	setSettings,
}: {
	settings: Omit<SpeedLinesDecoration, "type">;
	setSettings: React.Dispatch<
		React.SetStateAction<Omit<SpeedLinesDecoration, "type">>
	>;
}) {
	const update = <Key extends keyof typeof settings>(
		key: Key,
		value: (typeof settings)[Key],
	) => setSettings((current) => ({ ...current, [key]: value }));

	return (
		<>
			<SelectControl
				label="Variant"
				onChange={(value) =>
					setSettings((current) => ({
						...current,
						variant: value,
						spread:
							value === "radial"
								? 360
								: value === "fan" || value === "laser"
									? 90
									: current.spread,
					}))
				}
				options={[
					"tapered",
					"brush",
					"electric",
					"shards",
					"velocity",
					"radial",
					"fan",
					"laser",
				]}
				value={settings.variant ?? "tapered"}
			/>
			<SelectControl
				label="Shape"
				onChange={(value) => update("shape", value)}
				options={[
					"field",
					"circle",
					"square",
					"rectangle",
					"triangle",
					"vignette",
				]}
				value={settings.shape ?? "field"}
			/>
			<SelectControl
				label="Shape mode"
				onChange={(value) => update("shapeMode", value)}
				options={["inside", "outside"]}
				value={settings.shapeMode ?? "inside"}
			/>
			<SelectControl
				label="Direction"
				onChange={(value) =>
					update("direction", value === "auto" ? undefined : value)
				}
				options={["auto", ...directions]}
				value={settings.direction ?? "auto"}
			/>
			<SelectControl
				label="Density"
				onChange={(value) => update("density", value)}
				options={densities}
				value={settings.density ?? "medium"}
			/>
			<RangeControl
				label="Angle"
				max={360}
				min={-180}
				onChange={(value) => update("angle", value)}
				step={1}
				value={settings.angle ?? 0}
			/>
			<RangeControl
				label="Quantity"
				max={512}
				min={1}
				onChange={(value) => update("quantity", value)}
				step={1}
				value={settings.quantity ?? 16}
			/>
			<RangeControl
				label="Length"
				max={8}
				min={0.08}
				onChange={(value) => update("length", value)}
				step={0.04}
				value={settings.length ?? 0.72}
			/>
			<RangeControl
				label="Line width"
				max={16}
				min={0.5}
				onChange={(value) => update("strokeWidth", value)}
				step={0.5}
				value={settings.strokeWidth ?? 2}
			/>
			<RangeControl
				label="Start width"
				max={3}
				min={0}
				onChange={(value) => update("startWidth", value)}
				step={0.05}
				value={settings.startWidth ?? 1}
			/>
			<RangeControl
				label="End width"
				max={3}
				min={0}
				onChange={(value) => update("endWidth", value)}
				step={0.05}
				value={settings.endWidth ?? 0.08}
			/>
			<RangeControl
				label="Start opacity"
				max={1}
				min={0}
				onChange={(value) => update("startOpacity", value)}
				step={0.05}
				value={settings.startOpacity ?? 1}
			/>
			<RangeControl
				label="End opacity"
				max={1}
				min={0}
				onChange={(value) => update("endOpacity", value)}
				step={0.05}
				value={settings.endOpacity ?? 1}
			/>
			<RangeControl
				label="Jitter"
				max={1}
				min={0}
				onChange={(value) => update("jitter", value)}
				step={0.05}
				value={settings.jitter ?? 0.65}
			/>
			<RangeControl
				label="Spread"
				max={360}
				min={10}
				onChange={(value) => update("spread", value)}
				step={5}
				value={settings.spread ?? 90}
			/>
			<RangeControl
				label="Origin radius"
				max={0.8}
				min={0}
				onChange={(value) => update("originRadius", value)}
				step={0.05}
				value={settings.originRadius ?? 0.2}
			/>
			<RangeControl
				label="Center opacity"
				max={1}
				min={0}
				onChange={(value) => update("originOpacity", value)}
				step={0.05}
				value={settings.originOpacity ?? 0}
			/>
			<RangeControl
				label="Vignette radius"
				max={0.9}
				min={0}
				onChange={(value) => update("vignetteRadius", value)}
				step={0.05}
				value={settings.vignetteRadius ?? 0.28}
			/>
			<RangeControl
				label="Vignette feather"
				max={0.8}
				min={0.01}
				onChange={(value) => update("vignetteFeather", value)}
				step={0.05}
				value={settings.vignetteFeather ?? 0.18}
			/>
			<RangeControl
				label="Seed"
				min={0}
				max={100}
				step={1}
				value={settings.seed ?? 29}
				onChange={(value) => update("seed", value)}
			/>
			<RangeControl
				label="Modulation"
				min={0}
				max={1}
				step={0.05}
				value={settings.modulation ?? 0}
				onChange={(value) => update("modulation", value)}
			/>
			<RangeControl
				label="Modulation segments"
				min={2}
				max={64}
				step={1}
				value={settings.modulationSegments ?? 16}
				onChange={(value) => update("modulationSegments", value)}
			/>
		</>
	);
}

function AccentControls({
	settings,
	setSettings,
}: {
	settings: Omit<AccentStreakDecoration, "type">;
	setSettings: React.Dispatch<
		React.SetStateAction<Omit<AccentStreakDecoration, "type">>
	>;
}) {
	const update = <Key extends keyof typeof settings>(
		key: Key,
		value: (typeof settings)[Key],
	) => setSettings((current) => ({ ...current, [key]: value }));

	return (
		<>
			<SelectControl
				label="Variant"
				onChange={(value) => update("variant", value)}
				options={[
					"brush",
					"dry-brush",
					"slashes",
					"splatter",
					"underline",
					"splash",
					"burst",
					"lightning",
					"cracks",
					"fracture",
					"ink",
					"comet",
				]}
				value={settings.variant ?? "brush"}
			/>
			<SelectControl
				label="Direction"
				onChange={(value) => update("direction", value)}
				options={directions}
				value={settings.direction ?? "down-right"}
			/>
			<SelectControl
				label="Density"
				onChange={(value) => update("density", value)}
				options={densities}
				value={settings.density ?? "medium"}
			/>
			<RangeControl
				label="Angle"
				max={360}
				min={-180}
				onChange={(value) => update("angle", value)}
				step={1}
				value={settings.angle ?? 0}
			/>
			<RangeControl
				label="Quantity"
				max={64}
				min={1}
				onChange={(value) => update("quantity", value)}
				step={1}
				value={settings.quantity ?? 4}
			/>
			<RangeControl
				label="Length"
				max={8}
				min={0.1}
				onChange={(value) => update("length", value)}
				step={0.05}
				value={settings.length ?? 0.72}
			/>
			<RangeControl
				label="Thickness"
				max={180}
				min={4}
				onChange={(value) => update("thickness", value)}
				step={2}
				value={settings.thickness ?? 78}
			/>
			<RangeControl
				label="Splatter"
				max={1}
				min={0}
				onChange={(value) => update("splatter", value)}
				step={0.05}
				value={settings.splatter ?? 0.38}
			/>
			<RangeControl
				label="Stretch"
				min={0.1}
				max={8}
				step={0.1}
				value={settings.stretch ?? 1}
				onChange={(value) => update("stretch", value)}
			/>
			<RangeControl
				label="Seed"
				min={0}
				max={100}
				step={1}
				value={settings.seed ?? 41}
				onChange={(value) => update("seed", value)}
			/>
			<RangeControl
				label="Roughness"
				min={0}
				max={2}
				step={0.05}
				value={settings.roughness ?? 0.7}
				onChange={(value) => update("roughness", value)}
			/>
			{settings.variant === "cracks" || settings.variant === "fracture" ? (
				<RangeControl
					label="Branching"
					min={0}
					max={3}
					step={1}
					value={settings.branching ?? 2}
					onChange={(value) => update("branching", value)}
				/>
			) : null}
		</>
	);
}

export function createDecoration(type: DecorationKind): Decoration {
	if (type === "background-texture")
		return {
			type,
			variant: "paper",
			color: "neutral",
			opacity: 0.2,
			tileSize: 256,
			grainSize: 0.65,
			density: "medium",
			roughness: 0.5,
			seed: 1,
		};
	if (type === "geometric")
		return {
			...initialCommon,
			type,
			shape: "parallelogram",
			quantity: 1,
			fill: "solid",
		};
	if (type === "circular-linework")
		return {
			...initialCommon,
			type,
			variant: "open-arc",
			quantity: 5,
			spacing: 22,
			arc: 270,
			jitter: 0.35,
			seed: 1,
		};
	return {
		...initialCommon,
		aspectRatio: type === "halftone" ? 1 : 2.1,
		...(type === "halftone"
			? initialHalftone
			: type === "speed-lines"
				? initialSpeedLines
				: initialAccent),
		type,
	} as Decoration;
}

export function DecorationControls({
	value,
	onChange,
}: { value: Decoration; onChange: (value: Decoration) => void }) {
	const resolvedCommon = {
		...initialCommon,
		aspectRatio:
			value.type === "halftone" ? 1 : value.type === "speed-lines" ? 1.8 : 2.1,
		coverage:
			value.type === "halftone"
				? 0.5
				: value.type === "speed-lines"
					? 0.72
					: 0.58,
		position: value.type === "halftone" ? "bottom-left" : "center",
		color: "neutral",
		opacity: 1,
		...value,
	} as CommonSettings;
	const setCommon: React.Dispatch<React.SetStateAction<CommonSettings>> = (
		action,
	) => {
		const current = resolvedCommon;
		const next = typeof action === "function" ? action(current) : action;
		onChange({
			...value,
			...Object.fromEntries(
				Object.entries(next).filter(
					([key, entry]) => entry !== current[key as keyof CommonSettings],
				),
			),
		});
	};
	return (
		<div className="grid gap-4">
			{value.type === "background-texture" ? (
				<>
					<ColorPicker
						label="Color"
						swatches={colorSwatches}
						density="compact"
						value={value.color ?? "neutral"}
						onChange={(color) => onChange({ ...value, color })}
					/>
					<RangeControl
						label="Opacity"
						min={0}
						max={1}
						step={0.01}
						value={value.opacity ?? 0.16}
						onChange={(opacity) => onChange({ ...value, opacity })}
					/>
				</>
			) : (
				<CommonControls settings={resolvedCommon} setSettings={setCommon} />
			)}
			{value.type === "halftone" ? (
				<HalftoneControls
					settings={value}
					setSettings={(action) =>
						onChange({
							...(typeof action === "function" ? action(value) : action),
							type: "halftone",
						})
					}
				/>
			) : value.type === "speed-lines" ? (
				<SpeedLineControls
					settings={value}
					setSettings={(action) =>
						onChange({
							...(typeof action === "function" ? action(value) : action),
							type: "speed-lines",
						})
					}
				/>
			) : value.type === "accent-streak" ? (
				<AccentControls
					settings={value}
					setSettings={(action) =>
						onChange({
							...(typeof action === "function" ? action(value) : action),
							type: "accent-streak",
						})
					}
				/>
			) : (
				<SurfaceControls value={value} onChange={onChange} />
			)}
		</div>
	);
}

function SurfaceControls({
	value,
	onChange,
}: {
	value: Exclude<
		Decoration,
		HalftoneDecoration | SpeedLinesDecoration | AccentStreakDecoration
	>;
	onChange: (value: Decoration) => void;
}) {
	const number = (
		key: string,
		label: string,
		fallback: number,
		max: number,
		step = 1,
		min = 0,
	) => (
		<RangeControl
			key={key}
			label={label}
			min={min}
			max={max}
			step={step}
			value={(value as unknown as Record<string, number>)[key] ?? fallback}
			onChange={(n) => onChange({ ...value, [key]: n })}
		/>
	);
	if (value.type === "background-texture")
		return (
			<>
				<SelectControl
					label="Variant"
					options={
						["paper", "grain", "grunge", "scratches", "scuffs", "wear"] as const
					}
					value={value.variant ?? "paper"}
					onChange={(variant) => onChange({ ...value, variant })}
				/>
				<SelectControl
					label="Density"
					options={densities}
					value={value.density ?? "medium"}
					onChange={(density) => onChange({ ...value, density })}
				/>
				{number("tileSize", "Tile size", 256, 512, 1, 8)}
				{number("grainSize", "Grain size", 0.65, 5, 0.05, 0.05)}
				{number("roughness", "Roughness", 0.5, 2, 0.05)}
				{number("angle", "Angle", -32, 180, 1, -180)}
				{number("seed", "Seed", 1, 100)}
			</>
		);
	if (value.type === "geometric")
		return (
			<>
				<SelectControl
					label="Shape"
					options={
						[
							"triangle",
							"square",
							"rectangle",
							"diamond",
							"parallelogram",
							"chevron",
							"corner-cut",
							"notched-frame",
							"stripes",
							"cross-grid",
						] as const
					}
					value={value.shape ?? "parallelogram"}
					onChange={(shape) => onChange({ ...value, shape })}
				/>
				<SelectControl
					label="Fill"
					options={["solid", "outline"] as const}
					value={value.fill ?? "solid"}
					onChange={(fill) => onChange({ ...value, fill })}
				/>
				{number("quantity", "Quantity", 1, 128, 1, 1)}
				{number("spacing", "Spacing", 42, 200, 1)}
				{number("strokeWidth", "Line width", 3, 30, 0.5)}
				{number("cut", "Cut size", 100, 270)}
			</>
		);
	return (
		<>
			<SelectControl
				label="Variant"
				options={["open-arc", "broken-ring", "concentric", "sweep"] as const}
				value={value.variant ?? "open-arc"}
				onChange={(variant) => onChange({ ...value, variant })}
			/>
			{number("quantity", "Quantity", 5, 32, 1, 1)}
			{number("spacing", "Spacing", 22, 100)}
			{number("strokeWidth", "Line width", 2, 20, 0.5)}
			{number("arc", "Arc", 270, 360, 1, 1)}
			{number("jitter", "Jitter", 0.35, 2, 0.05)}
			{number("seed", "Seed", 1, 100)}
		</>
	);
}

export function DecorationsWorkbench({
	initialType = "halftone",
	lockType = false,
}: {
	initialType?: DecorationKind;
	lockType?: boolean;
}): React.JSX.Element {
	const [type, setType] = useState<DecorationKind>(initialType);
	const [values, setValues] = useState(
		() =>
			Object.fromEntries(
				decorationKinds.map((kind) => [kind, createDecoration(kind)]),
			) as Record<DecorationKind, Decoration>,
	);

	return (
		<div
			data-reader-component="DecorationsWorkbench"
			data-reader-role="workbench"
			className="ts-decoration-editor grid max-w-7xl overflow-hidden border-2 border-foreground bg-card md:grid-cols-[minmax(0,1fr)_24rem]"
		>
			<div
				data-reader-component="DecorationsWorkbench"
				data-reader-role="preview"
				className="ts-decoration-host relative isolate overflow-hidden bg-background"
			>
				<Decorations items={[values[type]]} />
				<div className="absolute bottom-4 left-4 z-10 bg-card px-3 py-2 font-black text-xs uppercase">
					{type}
				</div>
			</div>
			<aside
				data-reader-component="DecorationsWorkbench"
				data-reader-role="controls"
				className="ts-editor-inspector overflow-y-auto border-foreground border-t bg-card p-4 md:border-t-0 md:border-l"
			>
				<header className="mb-4 border-foreground border-b pb-3">
					<strong className="font-display text-lg uppercase">
						Decoration controls
					</strong>
				</header>
				<div className="grid gap-4">
					{lockType ? null : (
						<SelectControl
							label="Decoration type"
							onChange={setType}
							options={decorationKinds}
							value={type}
						/>
					)}
					<DecorationControls
						value={values[type]}
						onChange={(value) =>
							setValues((current) => ({ ...current, [type]: value }))
						}
					/>
				</div>
			</aside>
		</div>
	);
}
