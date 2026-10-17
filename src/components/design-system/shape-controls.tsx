"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { SelectControl } from "../decorations/decorations-workbench";
import { Button } from "../ui/button";
import Input from "../ui/input";
import {
	type ShapePosition,
	type ShapeTreatment,
	shapeCorners,
	shapePositions,
	shapeSides,
} from "../ui/shape-geometry";

function typesFor(position: ShapePosition): ShapeTreatment["type"][] {
	if ((shapeCorners as readonly string[]).includes(position))
		return ["corner", "slant", "step"];
	if ((shapeSides as readonly string[]).includes(position))
		return ["slant", "corners"];
	return position.endsWith("-h") || position.endsWith("-v")
		? ["slant", "step"]
		: ["notch", "step"];
}
function treatment(
	position: ShapePosition,
	type: ShapeTreatment["type"],
): ShapeTreatment {
	return {
		position,
		type,
		size: 12,
		...(type === "step" || type === "notch" ? { direction: "inward" } : {}),
		...(type === "slant" && (shapeSides as readonly string[]).includes(position)
			? { slope: "start" }
			: {}),
	} as ShapeTreatment;
}

export function ShapeControls({
	value,
	onChange,
	label = "Shapes",
}: {
	value: ShapeTreatment[];
	onChange: (value: ShapeTreatment[]) => void;
	label?: string;
}) {
	const id = useId();
	const [position, setPosition] = useState<ShapePosition>("top-left");
	const [type, setType] = useState<ShapeTreatment["type"]>("corner");
	const [selected, setSelected] = useState(0);
	const active = value[selected];
	const update = (patch: Record<string, unknown>) =>
		onChange(
			value.map((entry, i) =>
				i === selected ? ({ ...entry, ...patch } as ShapeTreatment) : entry,
			),
		);
	const field = (key: string, fallback: string | number) => (
		<label key={key} htmlFor={`${id}-${key}`} className="grid gap-1 text-xs">
			{key}
			<Input
				id={`${id}-${key}`}
				aria-label={`${label} ${key}`}
				value={String(
					active && key in active
						? ((active as unknown as Record<string, unknown>)[key] ?? fallback)
						: fallback,
				)}
				onChange={(event) =>
					update({
						[key]:
							event.target.value.endsWith("%") ||
							event.target.value.endsWith("px")
								? event.target.value
								: Number(event.target.value),
					})
				}
			/>
		</label>
	);
	return (
		<section
			data-reader-component="ShapeControls"
			data-reader-role="shape-controls"
			className="grid gap-3 border-border border-t pt-4"
		>
			<strong className="text-xs uppercase">{label}</strong>
			<div className="grid grid-cols-2 gap-2">
				<SelectControl
					label={`${label} position`}
					options={shapePositions}
					value={position}
					onChange={(next) => {
						setPosition(next);
						setType(typesFor(next)[0] ?? "corner");
					}}
				/>
				<SelectControl
					label={`${label} type`}
					options={typesFor(position)}
					value={type}
					onChange={setType}
				/>
			</div>
			<Button
				variant="outline"
				onPress={() => {
					onChange([...value, treatment(position, type)]);
					setSelected(value.length);
				}}
			>
				<Plus />
				Add {label.toLowerCase()}
			</Button>
			{value.map((entry, i) => (
				<div key={`${i}-${entry.position}`} className="flex min-w-0 gap-2">
					<Button
						className="min-w-0 flex-1 whitespace-normal text-left"
						variant={selected === i ? "default" : "outline"}
						size="sm"
						onPress={() => setSelected(i)}
					>
						{entry.position}: {entry.type}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
						title="Remove shape"
						onPress={() => {
							onChange(value.filter((_, index) => index !== i));
							setSelected(0);
						}}
					>
						<Trash2 />
					</Button>
				</div>
			))}
			{active && (
				<div className="grid gap-3 border-border border-t pt-3">
					<SelectControl
						label={`${label} selected position`}
						options={shapePositions}
						value={active.position}
						onChange={(next) => {
							const allowed = typesFor(next);
							const nextType = allowed.includes(active.type)
								? active.type
								: (allowed[0] ?? "corner");
							onChange(
								value.map((entry, i) =>
									i === selected ? treatment(next, nextType) : entry,
								),
							);
						}}
					/>
					<SelectControl
						label={`${label} selected type`}
						options={typesFor(active.position)}
						value={active.type}
						onChange={(next) =>
							onChange(
								value.map((entry, i) =>
									i === selected ? treatment(active.position, next) : entry,
								),
							)
						}
					/>
					{field("size", 12)}
					{(active.type === "slant" || active.type === "step") &&
						(shapeCorners as readonly string[]).includes(active.position) && (
							<SelectControl
								label={`${label} orientation`}
								options={["vertical", "horizontal"]}
								value={
									"orientation" in active
										? (active.orientation ?? "vertical")
										: "vertical"
								}
								onChange={(orientation) => update({ orientation })}
							/>
						)}
					{(active.type === "step" || active.type === "notch") && (
						<SelectControl
							label={`${label} direction`}
							options={["inward", "outward"]}
							value={active.direction ?? "inward"}
							onChange={(direction) => update({ direction })}
						/>
					)}
					{active.type === "slant" &&
						(shapeSides as readonly string[]).includes(active.position) && (
							<SelectControl
								label={`${label} slope`}
								options={["start", "end"]}
								value={"slope" in active ? (active.slope ?? "start") : "start"}
								onChange={(slope) => update({ slope })}
							/>
						)}
					{(active.type === "step" || active.type === "slant") &&
						!(shapeSides as readonly string[]).includes(active.position) &&
						!active.position.endsWith("-center") &&
						field("extent", "50%")}
					{(active.type === "notch" || active.type === "step") &&
						active.position.endsWith("-center") && (
							<>
								{field("width", "25%")}
								{field("offset", "50%")}
							</>
						)}
					{active.type === "step" && field("ramp", 12)}
				</div>
			)}
		</section>
	);
}
