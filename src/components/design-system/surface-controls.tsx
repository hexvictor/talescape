"use client";

import { useId } from "react";
import { SelectControl } from "../decorations/decorations-workbench";
import { ColorPicker } from "../ui/color-picker";
import Input from "../ui/input";
import { Switch } from "../ui/switch";
import type { SurfaceConfiguration } from "./editor-model";

const options: Record<string, string[]> = {
	variant: [
		"default",
		"secondary",
		"outline",
		"ghost",
		"link",
		"destructive",
		"comic",
		"lift",
		"nav",
		"navActive",
		"ink",
	],
	size: ["default", "sm", "lg", "icon"],
	motion: [
		"flat",
		"lifted",
		"lift-on-hover",
		"reveal-on-hover",
		"color-only",
		"underline",
	],
	type: ["button", "submit", "reset"],
	target: ["_self", "_blank"],
	appearance: ["default", "subtle", "raised", "comic", "ghost"],
	density: ["default", "compact"],
	as: ["div", "section", "article", "main", "aside"],
	loading: ["lazy", "eager"],
	objectFit: ["cover", "contain", "fill", "none", "scale-down"],
	leftIcon: [
		"none",
		"chevron",
		"book",
		"plus",
		"download",
		"heart",
		"search",
		"loader",
	],
	rightIcon: [
		"none",
		"chevron",
		"book",
		"plus",
		"download",
		"heart",
		"search",
		"loader",
	],
};
const fields: Record<SurfaceConfiguration["kind"], string[]> = {
	button: [
		"label",
		"variant",
		"size",
		"motion",
		"type",
		"disabled",
		"invalid",
		"ariaLabel",
		"leftIcon",
		"rightIcon",
		"leftSegment",
		"rightSegment",
		"surfaceClassName",
		"hoverSurfaceClassName",
		"innerSlantDecrease",
		"asChild",
		"href",
		"target",
		"name",
		"value",
		"autoFocus",
	],
	panel: [
		"as",
		"appearance",
		"heading",
		"title",
		"description",
		"text",
		"density",
		"padding",
		"surfaceClassName",
	],
	card: [
		"appearance",
		"heading",
		"title",
		"description",
		"text",
		"density",
		"padding",
		"surfaceClassName",
	],
	image: [
		"src",
		"alt",
		"imageWidth",
		"imageHeight",
		"fill",
		"priority",
		"quality",
		"loading",
		"sizes",
		"unoptimized",
		"objectFit",
		"objectPosition",
		"imageClassName",
	],
	page: ["as", "text", "padding"],
	shape: ["as", "text", "padding", "surfaceClassName"],
};
const label = (key: string) =>
	key
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (letter) => letter.toUpperCase());
export function SurfaceControls({
	value,
	onChange,
}: {
	value: SurfaceConfiguration;
	onChange: (value: SurfaceConfiguration) => void;
}) {
	const id = useId();
	const set = (key: string, next: string | number | boolean) =>
		onChange({ ...value, properties: { ...value.properties, [key]: next } });
	const field = (key: string) => {
		const current = value.properties[key];
		const name = label(key);
		if (typeof current === "boolean")
			return (
				<Switch
					key={key}
					isSelected={current}
					onChange={(next) => set(key, next)}
				>
					{name}
				</Switch>
			);
		if (options[key])
			return (
				<SelectControl
					key={key}
					label={name}
					value={String(current)}
					options={options[key]}
					onChange={(next) => set(key, next)}
				/>
			);
		return (
			<label
				key={key}
				className="grid min-w-0 gap-1 text-xs"
				htmlFor={`${id}-${key}`}
			>
				{name}
				<Input
					id={`${id}-${key}`}
					type={typeof current === "number" ? "number" : "text"}
					value={current}
					onChange={(event) =>
						set(
							key,
							typeof current === "number"
								? Number(event.target.value)
								: event.target.value,
						)
					}
				/>
			</label>
		);
	};
	return (
		<div
			data-reader-component="SurfaceControls"
			data-reader-role={`${value.kind}-properties`}
			className="grid min-w-0 gap-4"
		>
			<fieldset className="grid gap-4">
				<legend className="mb-3 font-black text-sm">
					{value.kind === "image" ? "Image" : "Content and behavior"}
				</legend>
				{fields[value.kind]
					.filter(
						(key) => !key.endsWith("ClassName") && key !== "innerSlantDecrease",
					)
					.map(field)}
			</fieldset>
			<fieldset className="grid gap-3 border-border border-t pt-3">
				<legend className="font-bold text-xs">Surface</legend>
				{[
					"width",
					"height",
					"borderWidth",
					"shadow",
					"shadowOffset",
					"className",
				].map(field)}
				{["background", "color", "borderColor", "shadowColor"].map((key) => (
					<ColorPicker
						key={key}
						label={label(key)}
						value={String(value.properties[key])}
						allowEmpty
						allowCss={key === "background"}
						onChange={(next) => set(key, next)}
					/>
				))}
			</fieldset>
			<details className="border-border border-t pt-3">
				<summary className="cursor-pointer font-bold text-sm">
					Advanced styling
				</summary>
				<div className="mt-3 grid gap-4">
					{fields[value.kind]
						.filter(
							(key) =>
								key.endsWith("ClassName") || key === "innerSlantDecrease",
						)
						.map(field)}
				</div>
			</details>
		</div>
	);
}
