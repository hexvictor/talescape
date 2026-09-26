"use client";
import { Plus, Trash2 } from "lucide-react";
import type {
	ResolvedTaleScene,
	TaleScene,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import Input from "~/components/ui/input";
import Label from "~/components/ui/label";
import { Panel } from "~/components/ui/panel";
import Textarea from "~/components/ui/textarea";

export function SceneDetailsSettings({
	scene,
	onChange,
	onAdd,
	onRemove,
}: {
	scene: ResolvedTaleScene;
	onChange: (update: (scene: ResolvedTaleScene) => TaleScene) => void;
	onAdd?: () => void;
	onRemove?: () => void;
}): React.JSX.Element {
	return (
		<div className="space-y-3">
			<Panel
				appearance="comic"
				data-studio-component="SceneDetailsSection"
				data-studio-role="inspector-section"
				className="grid gap-3 p-3"
			>
				<StudioField
					id={`scene-${scene.id}-name`}
					label="Scene name"
					value={scene.title}
					onChange={(title) => onChange((item) => ({ ...item, title }))}
				/>
				<div className="grid gap-1 text-xs">
					<Label
						htmlFor={`scene-${scene.id}-description`}
						className="uppercase"
					>
						Description
					</Label>
					<Textarea
						id={`scene-${scene.id}-description`}
						density="compact"
						value={scene.description ?? ""}
						onChange={(event) =>
							onChange((item) => ({
								...item,
								description: event.target.value,
							}))
						}
					/>
				</div>
			</Panel>

			<div className="grid grid-cols-1 gap-2">
				{onAdd ? (
					<Button type="button" variant="secondary" onClick={onAdd}>
						<Plus size={15} /> Add scene
					</Button>
				) : null}
				{onRemove ? (
					<Button type="button" variant="destructive" onClick={onRemove}>
						<Trash2 size={15} /> Remove scene
					</Button>
				) : null}
			</div>
		</div>
	);
}

function StudioField({
	id,
	label,
	onChange,
	value,
}: {
	id: string;
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<div className="grid gap-1 text-xs">
			<Label htmlFor={id} className="uppercase">
				{label}
			</Label>
			<Input
				id={id}
				density="compact"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</div>
	);
}
