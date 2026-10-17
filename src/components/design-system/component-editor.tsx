"use client";

import { Copy, RotateCcw } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "../ui/button";
import Input from "../ui/input";
import { Tab, TabList, TabPanel, Tabs } from "../ui/tabs";
import { DecorationLayerEditor } from "./decoration-layer-editor";
import {
	type SurfaceConfiguration,
	type SurfaceKind,
	createSurface,
	exportSurface,
} from "./editor-model";
import { ShapeControls } from "./shape-controls";
import { SurfaceControls } from "./surface-controls";
import { SurfacePreview } from "./surface-preview";

export function ComponentInspector({
	value,
	onChange,
}: {
	value: SurfaceConfiguration;
	onChange: (value: SurfaceConfiguration) => void;
}) {
	return (
		<Tabs defaultSelectedKey="properties" key={value.kind}>
			<TabList aria-label={`${value.kind} editor tabs`}>
				<Tab id="properties">
					{value.kind === "image"
						? "Image"
						: value.kind.charAt(0).toUpperCase() + value.kind.slice(1)}
				</Tab>
				<Tab id="decorations">Decorations</Tab>
				<Tab id="shapes">Shapes</Tab>
			</TabList>
			<TabPanel id="properties">
				<SurfaceControls value={value} onChange={onChange} />
			</TabPanel>
			<TabPanel id="decorations">
				<DecorationLayerEditor value={value} onChange={onChange} />
			</TabPanel>
			<TabPanel id="shapes">
				<ShapeControls
					value={value.shapes}
					onChange={(shapes) => onChange({ ...value, shapes })}
				/>
				{value.kind === "button" && (
					<>
						<ShapeControls
							label="Pressed shapes"
							value={value.pressedShapes ?? []}
							onChange={(pressedShapes) =>
								onChange({ ...value, pressedShapes })
							}
						/>
						<ShapeControls
							label="Hover shapes"
							value={value.hoverShapes}
							onChange={(hoverShapes) => onChange({ ...value, hoverShapes })}
						/>
						<label
							className="mt-4 grid gap-2 text-sm"
							htmlFor="shape-transition-duration"
						>
							Morph duration (ms)
							<Input
								id="shape-transition-duration"
								type="number"
								min={0}
								value={Number(value.properties.shapeTransitionDuration ?? 240)}
								onChange={(event) =>
									onChange({
										...value,
										properties: {
											...value.properties,
											shapeTransitionDuration: Number(event.target.value),
										},
									})
								}
							/>
						</label>
					</>
				)}
			</TabPanel>
		</Tabs>
	);
}
export function ConfigurationExport({
	jsx,
	json,
}: { jsx: string; json: unknown }) {
	const id = useId();
	const [format, setFormat] = useState<"jsx" | "json">("jsx");
	const [copied, setCopied] = useState(false);
	const output = format === "jsx" ? jsx : JSON.stringify(json, null, 2);
	return (
		<section className="grid min-w-0 gap-2 border-border border-t pt-4">
			<div className="flex items-center justify-between gap-2">
				<select
					aria-label="Export format"
					value={format}
					onChange={(event) => {
						setFormat(event.target.value as typeof format);
						setCopied(false);
					}}
					className="border border-border bg-background p-2 text-xs"
				>
					<option value="jsx">JSX</option>
					<option value="json">JSON</option>
				</select>
				<Button
					variant="outline"
					size="sm"
					onClick={async () => {
						try {
							await navigator.clipboard.writeText(output);
							setCopied(true);
						} catch {
							setCopied(false);
						}
					}}
				>
					<Copy />
					{copied ? "Copied" : "Copy configuration"}
				</Button>
			</div>
			<label htmlFor={id} className="font-bold text-xs">
				Configuration
			</label>
			<textarea
				id={id}
				readOnly
				value={output}
				rows={8}
				className="w-full resize-y border border-border bg-background p-3 font-mono text-xs"
			/>
		</section>
	);
}
export function ComponentEditor({
	kind,
	initialConfiguration,
}: { kind: SurfaceKind; initialConfiguration?: SurfaceConfiguration }) {
	const [configuration, setConfiguration] = useState(
		() => initialConfiguration ?? createSurface(kind),
	);
	const title =
		kind === "image" ? "Image" : kind.charAt(0).toUpperCase() + kind.slice(1);
	return (
		<section
			data-reader-component="ComponentEditor"
			data-reader-role={`${kind}-editor`}
			className="ts-component-editor min-w-0"
		>
			<header className="mb-4 flex items-center justify-between border-border border-b pb-3">
				<h2 className="font-black text-lg">{title} Editor</h2>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Reset component"
					onClick={() =>
						setConfiguration(initialConfiguration ?? createSurface(kind))
					}
				>
					<RotateCcw />
				</Button>
			</header>
			<div className="ts-editor-layout grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
				<div
					data-reader-component="ComponentEditor"
					data-reader-role="component-preview"
					className="ts-editor-preview min-w-0 self-start overflow-auto border border-border bg-muted/20 p-6"
				>
					<SurfacePreview configuration={configuration} />
				</div>
				<aside
					data-reader-component="ComponentEditor"
					data-reader-role="component-inspector"
					className="ts-editor-inspector min-w-0"
				>
					<ComponentInspector
						value={configuration}
						onChange={setConfiguration}
					/>
					<ConfigurationExport
						jsx={exportSurface(configuration)}
						json={configuration}
					/>
				</aside>
			</div>
		</section>
	);
}
