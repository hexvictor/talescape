"use client";

import { useState } from "react";
import { Decorations } from "./decorations";
import { AccentStreak, HalftoneDots, SpeedLines } from "./primitives";
import {
	type AccentStreakDecoration,
	type DecorationColorToken,
	type DecorationDensity,
	type DecorationDirection,
	type DecorationPosition,
	type HalftoneDecoration,
	type SpeedLinesDecoration,
	decorationColorTokens,
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
	"down-right",
	"down-left",
	"up-right",
	"up-left",
];

type DecorationKind = "accent-streak" | "halftone" | "speed-lines";

type CommonSettings = {
	aspectRatio: number;
	color: DecorationColorToken;
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
	angle: 28,
	density: "medium",
	direction: "down-right",
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
	angle: 28,
	density: "medium",
	direction: "down-right",
	length: 0.72,
	quantity: 4,
	splatter: 0.38,
	thickness: 78,
	variant: "brush",
};

function SelectControl<T extends string>({
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
		<label className="grid gap-1 font-bold text-xs uppercase">
			{label}
			<select
				className="h-9 border border-border bg-background px-2 font-normal normal-case"
				onChange={(event) => onChange(event.target.value as T)}
				value={value}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
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
	return (
		<label className="grid gap-1 font-bold text-xs uppercase">
			<span className="flex justify-between gap-3">
				{label}
				<output className="font-mono font-normal">{value}</output>
			</span>
			<input
				max={max}
				min={min}
				onChange={(event) => onChange(event.target.valueAsNumber)}
				step={step}
				type="range"
				value={value}
			/>
		</label>
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
			<SelectControl
				label="Color"
				onChange={(value) => update("color", value)}
				options={decorationColorTokens}
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
			<RangeControl
				label="Dot size"
				max={10}
				min={0.5}
				onChange={(value) => update("dotSize", value)}
				step={0.5}
				value={settings.dotSize ?? 3}
			/>
			<RangeControl
				label="Spacing"
				max={48}
				min={8}
				onChange={(value) => update("spacing", value)}
				step={1}
				value={settings.spacing ?? 21}
			/>
			<RangeControl
				label="Falloff"
				max={1.5}
				min={0.15}
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
				onChange={(value) => update("variant", value)}
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
				value={settings.angle ?? 28}
			/>
			<RangeControl
				label="Quantity"
				max={72}
				min={1}
				onChange={(value) => update("quantity", value)}
				step={1}
				value={settings.quantity ?? 16}
			/>
			<RangeControl
				label="Length"
				max={1.4}
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
				value={settings.angle ?? 28}
			/>
			<RangeControl
				label="Quantity"
				max={18}
				min={1}
				onChange={(value) => update("quantity", value)}
				step={1}
				value={settings.quantity ?? 4}
			/>
			<RangeControl
				label="Length"
				max={1}
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
	const [common, setCommon] = useState({
		...initialCommon,
		aspectRatio: initialType === "halftone" ? 1 : 1.8,
	});
	const [halftone, setHalftone] = useState(initialHalftone);
	const [speedLines, setSpeedLines] = useState(initialSpeedLines);
	const [accent, setAccent] = useState(initialAccent);

	const decoration =
		type === "halftone" ? (
			<HalftoneDots {...common} {...halftone} />
		) : type === "speed-lines" ? (
			<SpeedLines {...common} {...speedLines} />
		) : (
			<AccentStreak {...common} {...accent} />
		);

	return (
		<div className="grid min-h-[38rem] max-w-7xl overflow-hidden border-2 border-foreground bg-card lg:grid-cols-[minmax(0,1fr)_20rem]">
			<div className="ts-decoration-host relative isolate min-h-[28rem] overflow-hidden bg-background">
				<Decorations>{decoration}</Decorations>
				<div className="absolute bottom-4 left-4 z-10 bg-card px-3 py-2 font-black text-xs uppercase">
					{type}
				</div>
			</div>
			<aside className="max-h-[42rem] overflow-y-auto border-foreground border-t bg-card p-4 lg:border-t-0 lg:border-l">
				<header className="mb-4 border-foreground border-b pb-3">
					<strong className="font-display text-lg uppercase">
						Decoration controls
					</strong>
					<p className="mt-1 text-muted-foreground text-xs normal-case">
						Only properties supported by the selected primitive are shown.
					</p>
				</header>
				<div className="grid gap-4">
					{lockType ? null : (
						<SelectControl
							label="Decoration type"
							onChange={setType}
							options={["halftone", "speed-lines", "accent-streak"]}
							value={type}
						/>
					)}
					<CommonControls settings={common} setSettings={setCommon} />
					<div className="border-border border-t pt-4">
						<div className="grid gap-4">
							{type === "halftone" ? (
								<HalftoneControls
									settings={halftone}
									setSettings={setHalftone}
								/>
							) : type === "speed-lines" ? (
								<SpeedLineControls
									settings={speedLines}
									setSettings={setSpeedLines}
								/>
							) : (
								<AccentControls settings={accent} setSettings={setAccent} />
							)}
						</div>
					</div>
				</div>
			</aside>
		</div>
	);
}
