"use client";

import { type ReactNode, useEffect, useId, useState } from "react";
import { SelectControl } from "../decorations/decorations-workbench";
import { ColorPicker } from "../ui/color-picker";
import Input from "../ui/input";
import type { ShapeTreatment } from "../ui/shape-geometry";
import { Switch } from "../ui/switch";
import { Tab, TabList, TabPanel, Tabs } from "../ui/tabs";
import { ConfigurationExport } from "./component-editor";
import { ShapeControls } from "./shape-controls";

type ArgumentType = {
	name?: string;
	type?: { name?: string; value?: unknown };
	options?: readonly unknown[];
	control?: unknown;
	table?: { defaultValue?: { summary?: string } };
};
function initialValue(
	argument: ArgumentType,
): string | number | boolean | undefined {
	if (argument.type?.name === "boolean") return false;
	if (argument.type?.name === "number") return 0;
	if (argument.type?.name === "string") return "";
	const choice = argument.options?.find(
		(option) => typeof option === "string" || typeof option === "number",
	);
	if (typeof choice === "string" || typeof choice === "number") return choice;
	return undefined;
}
function jsonEditable(value: unknown): boolean {
	if (value === null || ["string", "number", "boolean"].includes(typeof value))
		return true;
	if (Array.isArray(value)) return value.every(jsonEditable);
	return (
		typeof value === "object" &&
		value !== null &&
		Object.getPrototypeOf(value) === Object.prototype &&
		!("$$typeof" in value) &&
		Object.values(value).every(
			(item) => item === undefined || jsonEditable(item),
		)
	);
}
function JsonControl({
	id,
	label,
	value,
	onChange,
}: {
	id: string;
	label: string;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	const serialized = JSON.stringify(value, null, 2);
	const [draft, setDraft] = useState(serialized);
	const [invalid, setInvalid] = useState(false);
	useEffect(() => setDraft(serialized), [serialized]);
	return (
		<label htmlFor={id} className="grid gap-2 text-sm">
			{label}
			<textarea
				id={id}
				rows={6}
				aria-invalid={invalid || undefined}
				value={draft}
				className="w-full border border-border bg-background p-3 font-mono text-xs aria-invalid:border-destructive"
				onChange={(event) => {
					setDraft(event.target.value);
					try {
						const parsed: unknown = JSON.parse(event.target.value);
						onChange(parsed);
						setInvalid(false);
					} catch {
						setInvalid(true);
					}
				}}
			/>
		</label>
	);
}
/** Opt-in story editor changes React props, never the rendered DOM. */
export function StoryPropertiesEditor({
	name,
	componentName = name.replaceAll(" ", ""),
	args,
	argTypes,
	onChange,
	children,
}: {
	name: string;
	componentName?: string;
	args: Record<string, unknown>;
	argTypes: Record<string, ArgumentType>;
	onChange: (args: Record<string, unknown>) => void;
	children: ReactNode;
}) {
	const id = useId();
	const fields = Object.entries({
		...argTypes,
		...Object.fromEntries(
			Object.keys(args).map((key) => [key, argTypes[key] ?? {}]),
		),
	}).filter(
		([key, argument]) =>
			!key.startsWith("data-") &&
			key !== "ref" &&
			!key.startsWith("on") &&
			(typeof args[key] === "string" ||
				typeof args[key] === "number" ||
				typeof args[key] === "boolean" ||
				(args[key] !== undefined && jsonEditable(args[key])) ||
				initialValue(argument) !== undefined),
	);
	const exported = Object.fromEntries(
		fields
			.filter(([key]) => args[key] !== undefined)
			.map(([key]) => [key, args[key]]),
	);
	const control = (key: string, argument: ArgumentType) => {
		const value = args[key] ?? initialValue(argument);
		const label = argument.name ?? key;
		if ((key === "shapes" || key === "hoverShapes") && Array.isArray(value))
			return (
				<ShapeControls
					key={key}
					label={key === "hoverShapes" ? "Hover shapes" : "Shapes"}
					value={value as ShapeTreatment[]}
					onChange={(value) => onChange({ [key]: value })}
				/>
			);
		if (value !== null && typeof value === "object")
			return (
				<JsonControl
					key={key}
					id={`${id}-${key}`}
					label={label}
					value={value}
					onChange={(value) => onChange({ [key]: value })}
				/>
			);
		if (typeof value === "boolean")
			return (
				<Switch
					key={key}
					isSelected={value}
					onChange={(value) => onChange({ [key]: value })}
				>
					{label}
				</Switch>
			);
		if (/color|background/i.test(key) && typeof value === "string")
			return (
				<ColorPicker
					key={key}
					label={label}
					value={value}
					allowEmpty
					allowCss
					onChange={(value) => onChange({ [key]: value })}
				/>
			);
		if (argument.options?.every((option) => typeof option === "string"))
			return (
				<SelectControl
					key={key}
					label={label}
					value={String(value)}
					options={argument.options as readonly string[]}
					onChange={(value) => onChange({ [key]: value })}
				/>
			);
		return (
			<label
				key={key}
				htmlFor={`${id}-${key}`}
				className="grid min-w-0 gap-1 text-sm"
			>
				{label}
				<Input
					id={`${id}-${key}`}
					type={typeof value === "number" ? "number" : "text"}
					value={String(value ?? "")}
					onChange={(event) =>
						onChange({
							[key]:
								typeof value === "number"
									? Number(event.target.value)
									: event.target.value,
						})
					}
				/>
			</label>
		);
	};
	return (
		<section
			data-reader-component="StoryPropertiesEditor"
			data-reader-role="component-editor"
			className="min-w-0"
		>
			<h2 className="mb-4 border-border border-b pb-3 font-black text-lg">
				{name} Editor
			</h2>
			<div className="ts-editor-layout grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
				<div
					data-reader-role="component-preview"
					className="ts-editor-preview min-w-0 self-start overflow-auto border border-border p-6"
				>
					{children}
				</div>
				<aside className="ts-editor-inspector grid min-w-0 content-start gap-4">
					<Tabs defaultSelectedKey="properties">
						<TabList aria-label="Component editor tabs">
							<Tab id="properties">Properties</Tab>
							{fields.some(([key]) =>
								/shapes?|slant|step|border|shadow/i.test(key),
							) && <Tab id="shapes">Shapes</Tab>}
							{fields.some(([key]) => /decorations|preset/i.test(key)) && (
								<Tab id="decorations">Decorations</Tab>
							)}
						</TabList>
						<TabPanel id="properties">
							<div className="grid gap-4">
								{fields
									.filter(
										([key]) =>
											!/shapes?|slant|step|border|shadow|decorations|preset/i.test(
												key,
											),
									)
									.map(([key, argument]) => control(key, argument))}
							</div>
						</TabPanel>
						<TabPanel id="shapes">
							<div className="grid gap-4">
								{fields
									.filter(([key]) =>
										/shapes?|slant|step|border|shadow/i.test(key),
									)
									.map(([key, argument]) => control(key, argument))}
							</div>
						</TabPanel>
						<TabPanel id="decorations">
							<div className="grid gap-4">
								{fields
									.filter(([key]) => /decorations|preset/i.test(key))
									.map(([key, argument]) => control(key, argument))}
							</div>
						</TabPanel>
					</Tabs>
					<ConfigurationExport
						jsx={`<${componentName} {...${JSON.stringify(exported, null, 2)}} />`}
						json={exported}
					/>
				</aside>
			</div>
		</section>
	);
}
