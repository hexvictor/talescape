"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ResolvedTaleElement } from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import type { DraftElementInput } from "../../../services/taleDraftEdits";
import { AddElementDialog } from "../AddElementDialog";
import { ElementThumbnail } from "../element/ElementThumbnail";

export function SceneElementsSettings({
	elements,
	onCreate,
	onOpen,
	onRemove,
}: {
	elements: ResolvedTaleElement[];
	onCreate: (input: DraftElementInput) => void;
	onOpen: (id: string) => void;
	onRemove: (id: string) => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<section
			data-reader-component="SceneElementsSettings"
			data-reader-role="scene-elements"
			data-studio-component="SceneElementsSettings"
			data-studio-role="scene-elements"
			className="grid gap-3"
		>
			<header className="flex items-center justify-between gap-2">
				<h3 className="font-bold text-sm">Scene elements</h3>
				<Button size="sm" variant="outline" onClick={() => setOpen(true)}>
					<Plus />
					Add element
				</Button>
			</header>
			<AddElementDialog
				open={open}
				onClose={() => setOpen(false)}
				onCreate={(input) => {
					onCreate(input);
					setOpen(false);
				}}
			/>
			{elements.map((element) => (
				<div
					key={element.id}
					className="flex items-center gap-2 border border-border p-2"
				>
					<button
						type="button"
						className="flex min-w-0 flex-1 items-center gap-3 text-left"
						onClick={() => onOpen(element.id)}
					>
						<ElementThumbnail element={element} />
						<span className="min-w-0">
							<span className="block truncate font-bold text-sm">
								{element.label ?? element.type}
							</span>
							<span className="block text-muted-foreground text-xs">
								{element.type} ·{" "}
								{element.placement.mode === "normal"
									? "Flow"
									: `Layer ${element.placement.zIndex ?? 0}`}
							</span>
						</span>
					</button>
					<Button
						size="icon"
						variant="ghost"
						title={`Remove ${element.label ?? element.type}`}
						onClick={() => onRemove(element.id)}
					>
						<Trash2 size={14} />
					</Button>
				</div>
			))}
		</section>
	);
}
