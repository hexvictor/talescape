"use client";

import {
	ArrowDown,
	ArrowUp,
	Copy,
	Eye,
	EyeOff,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import {
	DecorationControls,
	SelectControl,
	createDecoration,
} from "../decorations/decorations-workbench";
import {
	cardDecorationPresets,
	decorationPresetItems,
	panelDecorationPresets,
} from "../decorations/presets";
import {
	type Decoration,
	type DecorationPreset,
	buttonDecorationPresets,
	decorationKinds,
	decorationPresets,
	imageDecorationPresets,
	pageDecorationPresets,
	panelPresetOptions,
} from "../decorations/types";
import { Button } from "../ui/button";
import type { SurfaceConfiguration } from "./editor-model";

export function DecorationLayerEditor({
	value,
	onChange,
}: {
	value: SurfaceConfiguration;
	onChange: (value: SurfaceConfiguration) => void;
}) {
	const [kind, setKind] = useState<Decoration["type"]>("halftone");
	const [selected, setSelected] = useState<number | null>(null);
	const allowed =
		value.kind === "button"
			? buttonDecorationPresets
			: value.kind === "panel"
				? panelPresetOptions
				: value.kind === "card"
					? Object.keys(cardDecorationPresets)
					: value.kind === "image"
						? imageDecorationPresets
						: value.kind === "page"
							? pageDecorationPresets
							: decorationPresets;
	const update = (layers: SurfaceConfiguration["layers"]) =>
		onChange({ ...value, layers });
	const nextId = () =>
		Math.max(0, ...value.layers.map((layer) => layer.id)) + 1;
	const active = value.layers.find((layer) => layer.id === selected);
	const move = (index: number, offset: number) => {
		const layers = [...value.layers];
		const current = layers[index];
		const other = layers[index + offset];
		if (!current || !other) return;
		[layers[index], layers[index + offset]] = [other, current];
		update(layers);
	};
	const expand = () => {
		const preset =
			value.kind === "panel"
				? panelDecorationPresets[
						value.decorations as keyof typeof panelDecorationPresets
					]
				: value.kind === "card"
					? cardDecorationPresets[
							value.decorations as keyof typeof cardDecorationPresets
						]
					: (value.decorations as DecorationPreset);
		const start = nextId();
		const added = decorationPresetItems[preset].map((item, index) => ({
			id: start + index,
			visible: true,
			item: { ...item },
		}));
		onChange({
			...value,
			decorations: "",
			layers: [...value.layers, ...added],
		});
		setSelected(start);
	};
	return (
		<div
			data-reader-component="DecorationLayerEditor"
			data-reader-role="decoration-controls"
			className="grid gap-4"
		>
			<SelectControl
				label="Preset"
				value={value.decorations || "none"}
				options={["none", ...allowed]}
				onChange={(preset) =>
					onChange({ ...value, decorations: preset === "none" ? "" : preset })
				}
			/>
			{value.decorations && (
				<Button variant="outline" onClick={expand}>
					<Copy /> Add preset layers
				</Button>
			)}
			{value.kind === "button" && (
				<div className="grid gap-3">
					<SelectControl
						label="Hover preset"
						value={value.hoverDecorations || "none"}
						options={["none", ...allowed]}
						onChange={(preset) =>
							onChange({
								...value,
								hoverDecorations: preset === "none" ? "" : preset,
							})
						}
					/>
					<SelectControl
						label="Pressed preset"
						value={value.pressedDecorations || "none"}
						options={["none", ...allowed]}
						onChange={(preset) =>
							onChange({
								...value,
								pressedDecorations: preset === "none" ? "" : preset,
							})
						}
					/>
				</div>
			)}
			<div className="flex items-end gap-2">
				<div className="min-w-0 flex-1">
					<SelectControl
						label="Decoration"
						value={kind}
						options={decorationKinds}
						onChange={(value) => setKind(value as Decoration["type"])}
					/>
				</div>
				<Button
					size="icon"
					aria-label="Add decoration"
					onClick={() => {
						const id = nextId();
						update([
							...value.layers,
							{ id, visible: true, item: createDecoration(kind) },
						]);
						setSelected(id);
					}}
				>
					<Plus />
				</Button>
			</div>
			{value.layers.map((layer, index) => (
				<div
					key={layer.id}
					className="flex min-w-0 items-center gap-1 border-border border-b pb-2"
				>
					<Button
						size="sm"
						variant={selected === layer.id ? "secondary" : "ghost"}
						className="min-w-0 flex-1 whitespace-normal"
						onClick={() => setSelected(layer.id)}
					>
						{layer.item.type} {layer.id}
					</Button>
					<Button
						size="icon"
						variant="ghost"
						aria-label={`Toggle layer ${layer.id}`}
						onClick={() =>
							update(
								value.layers.map((item) =>
									item.id === layer.id
										? { ...item, visible: !item.visible }
										: item,
								),
							)
						}
					>
						{layer.visible ? <Eye /> : <EyeOff />}
					</Button>
					<Button
						size="icon"
						variant="ghost"
						aria-label={`Move layer ${layer.id} up`}
						disabled={!index}
						onClick={() => move(index, -1)}
					>
						<ArrowUp />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						aria-label={`Move layer ${layer.id} down`}
						disabled={index === value.layers.length - 1}
						onClick={() => move(index, 1)}
					>
						<ArrowDown />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						aria-label={`Remove layer ${layer.id}`}
						onClick={() =>
							update(value.layers.filter((item) => item.id !== layer.id))
						}
					>
						<Trash2 />
					</Button>
				</div>
			))}
			{active && (
				<DecorationControls
					value={active.item}
					onChange={(item) =>
						update(
							value.layers.map((layer) =>
								layer.id === active.id ? { ...layer, item } : layer,
							),
						)
					}
				/>
			)}
		</div>
	);
}
