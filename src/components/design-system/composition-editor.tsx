"use client";

import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { SelectControl } from "../decorations/decorations-workbench";
import { Button } from "../ui/button";
import { ComponentInspector, ConfigurationExport } from "./component-editor";
import {
	type CompositionElement,
	type SurfaceKind,
	createSurface,
	exportComposition,
	surfaceKinds,
} from "./editor-model";
import { SurfacePreview } from "./surface-preview";

const containers = new Set<SurfaceKind>(["panel", "card", "page", "shape"]);
function descendants(elements: CompositionElement[], id: number): Set<number> {
	const found = new Set([id]);
	for (const element of elements.filter((item) => item.parentId === id))
		for (const child of descendants(elements, element.id)) found.add(child);
	return found;
}
export function CompositionEditor() {
	const [elements, setElements] = useState<CompositionElement[]>(() => [
		{ id: 1, parentId: null, configuration: createSurface("panel") },
		{ id: 2, parentId: 1, configuration: createSurface("button") },
	]);
	const [selected, setSelected] = useState<number | null>(1);
	const [kind, setKind] = useState<SurfaceKind>("button");
	const active = elements.find((element) => element.id === selected);
	const blocked = active ? descendants(elements, active.id) : new Set<number>();
	const nextId = () =>
		Math.max(0, ...elements.map((element) => element.id)) + 1;
	const update = (element: CompositionElement) =>
		setElements(
			elements.map((item) => (item.id === element.id ? element : item)),
		);
	const move = (id: number, direction: number) => {
		const index = elements.findIndex((element) => element.id === id);
		const current = elements[index];
		if (!current) return;
		const siblings = elements
			.map((element, i) => ({ element, i }))
			.filter(({ element }) => element.parentId === current.parentId);
		const target =
			siblings[siblings.findIndex((item) => item.i === index) + direction]?.i;
		const other = target === undefined ? undefined : elements[target];
		if (target === undefined || !other) return;
		const result = [...elements];
		[result[index], result[target]] = [other, current];
		setElements(result);
	};
	const render = (parentId: number | null) =>
		elements
			.filter((element) => element.parentId === parentId)
			.map((element) => (
				<div
					key={element.id}
					data-composition-element={element.id}
					data-selected={element.id === selected || undefined}
					data-reader-component="CompositionEditor"
					data-reader-role="canvas-element"
					className="relative my-4 min-w-0 data-[selected]:outline data-[selected]:outline-2 data-[selected]:outline-primary data-[selected]:outline-offset-4"
					onClickCapture={(event) => {
						const target = (event.target as HTMLElement).closest(
							"[data-composition-element]",
						);
						if (
							target?.getAttribute("data-composition-element") !==
							String(element.id)
						)
							return;
						event.preventDefault();
						event.stopPropagation();
						setSelected(element.id);
					}}
				>
					<SurfacePreview configuration={element.configuration}>
						{render(element.id)}
					</SurfacePreview>
				</div>
			));
	return (
		<section
			data-reader-component="CompositionEditor"
			data-reader-role="composition-editor"
			className="min-w-0"
		>
			<h2 className="mb-4 border-border border-b pb-3 font-black text-lg">
				Composition Editor
			</h2>
			<div className="ts-editor-layout ts-composition-layout grid min-w-0 gap-6 xl:grid-cols-[200px_minmax(0,1fr)_380px]">
				<aside
					data-reader-component="CompositionEditor"
					data-reader-role="element-list"
					className="ts-editor-elements grid min-w-0 content-start gap-3"
				>
					<SelectControl
						label="New element"
						value={kind}
						options={surfaceKinds}
						onChange={(value) => setKind(value as SurfaceKind)}
					/>
					<Button
						onClick={() => {
							const id = nextId();
							setElements([
								...elements,
								{
									id,
									parentId:
										active && containers.has(active.configuration.kind)
											? active.id
											: null,
									configuration: createSurface(kind),
								},
							]);
							setSelected(id);
						}}
					>
						<Plus />
						Add element
					</Button>
					{elements.map((element) => (
						<div key={element.id} className="flex items-center gap-1">
							<Button
								className="min-w-0 flex-1 whitespace-normal"
								size="sm"
								variant={selected === element.id ? "secondary" : "ghost"}
								onClick={() => setSelected(element.id)}
							>
								{element.configuration.kind} {element.id}
								{element.parentId ? ` / ${element.parentId}` : ""}
							</Button>
							<Button
								size="icon"
								variant="ghost"
								aria-label={`Remove element ${element.id}`}
								onClick={() => {
									const removed = descendants(elements, element.id);
									const rest = elements.filter((item) => !removed.has(item.id));
									setElements(rest);
									if (selected && removed.has(selected))
										setSelected(rest[0]?.id ?? null);
								}}
							>
								<Trash2 />
							</Button>
						</div>
					))}
				</aside>
				<div
					data-reader-component="CompositionEditor"
					data-reader-role="composition-canvas"
					className="ts-editor-preview min-w-0 self-start border border-border bg-muted/20 p-6"
				>
					{render(null)}
				</div>
				<aside
					data-reader-component="CompositionEditor"
					data-reader-role="element-inspector"
					className="ts-editor-inspector min-w-0"
				>
					{active ? (
						<>
							<div className="mb-3 flex items-end gap-2">
								<div className="min-w-0 flex-1">
									<SelectControl
										label="Parent"
										value={
											active.parentId === null
												? "canvas"
												: String(active.parentId)
										}
										options={[
											"canvas",
											...elements
												.filter(
													(element) =>
														containers.has(element.configuration.kind) &&
														!blocked.has(element.id),
												)
												.map((element) => String(element.id)),
										]}
										onChange={(parent) =>
											update({
												...active,
												parentId: parent === "canvas" ? null : Number(parent),
											})
										}
									/>
								</div>
								<Button
									size="icon"
									variant="ghost"
									aria-label="Duplicate element"
									onClick={() => {
										let id = nextId();
										const ids = new Map<number, number>();
										for (const item of elements.filter((element) =>
											blocked.has(element.id),
										))
											ids.set(item.id, id++);
										const copies = elements
											.filter((element) => blocked.has(element.id))
											.map((element) => ({
												...structuredClone(element),
												id: ids.get(element.id) ?? element.id,
												parentId:
													element.id === active.id
														? active.parentId
														: (ids.get(element.parentId ?? 0) ?? null),
											}));
										setElements([...elements, ...copies]);
										setSelected(ids.get(active.id) ?? null);
									}}
								>
									<Copy />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									aria-label="Move element up"
									onClick={() => move(active.id, -1)}
								>
									<ArrowUp />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									aria-label="Move element down"
									onClick={() => move(active.id, 1)}
								>
									<ArrowDown />
								</Button>
							</div>
							<ComponentInspector
								value={active.configuration}
								onChange={(configuration) =>
									update({ ...active, configuration })
								}
							/>
						</>
					) : null}
					<ConfigurationExport
						jsx={exportComposition(elements)}
						json={elements}
					/>
				</aside>
			</div>
		</section>
	);
}
