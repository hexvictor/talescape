"use client";
import { Plus, Trash2 } from "lucide-react";
import type {
	ResolvedTaleScene,
	TaleScene,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";

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
			<section className="tale-ui-panel grid gap-3 p-3">
				<StudioField
					label="Scene name"
					value={scene.title}
					onChange={(title) => onChange((item) => ({ ...item, title }))}
				/>
				<label className="grid gap-1 text-xs">
					<span className="font-bold uppercase">Description</span>
					<textarea
						className="min-h-20 border border-foreground bg-background p-2"
						value={scene.description ?? ""}
						onChange={(event) =>
							onChange((item) => ({
								...item,
								description: event.target.value,
							}))
						}
					/>
				</label>
			</section>

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
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="grid gap-1 text-xs">
			<span className="font-bold uppercase">{label}</span>
			<input
				className="h-9 border border-foreground bg-background px-2"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}
