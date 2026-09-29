"use client";

import { Frame, Plus, Trash2 } from "lucide-react";
import {
	addDraftFrame,
	removeDraftFrame,
} from "~/app/(tale-app)/(studio)/_shared/services/taleDraftEdits";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { getSceneProgressionFrameIds } from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	ResolvedTaleScene,
	SceneContainer,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import { useTaleStudio } from "../../../contexts/TaleStudioProvider";
import { useTaleStudioStore } from "../../../hooks/useTaleStudioStore";
import { StyleSettings } from "../StyleSettings";

export function SceneContainerSettings({
	scene,
	onChange,
	variant = "frames",
}: {
	scene: ResolvedTaleScene;
	onChange: (container: SceneContainer) => void;
	variant?: "frames" | "style";
}) {
	const { dialogs } = useTaleStudio();
	const { setTale, tale } = useTaleAppStoreShallow((s) => ({
		setTale: s.document.setTale,
		tale: s.document.tale,
	}));
	const open = useTaleStudioStore((s) => s.studioSelection.openInspector);
	const container = scene.container ?? { mode: "stack" };
	const frames = getSceneProgressionFrameIds(tale, scene);
	const sceneLayoutTarget = {
		id: scene.id,
		initialTab: "layout" as const,
		type: "scene" as const,
	};
	if (variant === "style") {
		return (
			<div className="space-y-4">
				<section className="tale-ui-panel grid gap-3 p-3 text-xs">
					<div>
						<p className="font-black text-xs uppercase">Frame layout</p>
						<p className="mt-1 text-[10px] text-foreground/48">
							Controls how Frames are arranged inside the Scene container.
						</p>
					</div>
					<div className="@container/scene-container grid min-w-0 @min-[34rem]/scene-container:grid-cols-2 grid-cols-1 gap-3">
						<label className="grid min-w-0 gap-1">
							Display
							<select
								className="h-9 min-w-0 border bg-background px-2"
								value={container.mode}
								onChange={(e) =>
									onChange({
										...container,
										mode: e.target.value as SceneContainer["mode"],
									})
								}
							>
								{["stack", "flex", "grid", "free"].map((value) => (
									<option key={value}>{value}</option>
								))}
							</select>
						</label>
						<label className="grid min-w-0 gap-1">
							Overflow
							<select
								className="h-9 min-w-0 border bg-background px-2"
								value={container.overflow ?? "clip"}
								onChange={(e) =>
									onChange({
										...container,
										overflow: e.target.value as "clip" | "visible",
									})
								}
							>
								<option value="clip">Clip</option>
								<option value="visible">Visible</option>
							</select>
						</label>
					</div>
				</section>
				<StyleSettings
					layoutMode={
						container.mode === "stack" || container.mode === "free"
							? undefined
							: container.mode
					}
					showAppearanceControls={false}
					showBoxControls={false}
					showLayoutItemControls={false}
					showPositionControls={false}
					showTypographyControls={false}
					title="Frame layout controls"
					style={container.style}
					onChange={(style) => onChange({ ...container, style })}
				/>
			</div>
		);
	}
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between border-b pb-2">
				<strong className="text-xs uppercase">Frames</strong>
				<Button
					size="icon"
					variant="outline"
					title="Add frame"
					onClick={() =>
						dialogs.prompt({
							defaultValue: `Frame ${frames.length + 1}`,
							onConfirm: (name) =>
								setTale(addDraftFrame(tale, scene.id, name), {
									reason: "frame-draft-add",
								}),
							title: "Name this Frame",
						})
					}
				>
					<Plus size={16} />
				</Button>
			</div>
			{frames.map((id, index) => (
				<div key={id} className="flex items-center gap-2 border-b pb-2">
					<Button
						className="min-w-0 flex-1 justify-start"
						variant="ghost"
						onClick={() =>
							open({
								type: "frame",
								id,
								sceneId: scene.id,
								returnTarget: sceneLayoutTarget,
							})
						}
					>
						<Frame size={16} />
						{tale.indexMap.framesById[id]?.name?.trim() || `Frame ${index + 1}`}
					</Button>
					<Button
						size="icon"
						variant="ghost"
						title="Remove frame"
						disabled={frames.length <= 1}
						onClick={() =>
							dialogs.confirm({
								confirmLabel: "Remove",
								description: `Remove Frame ${index + 1}?`,
								onConfirm: () =>
									setTale(removeDraftFrame(tale, scene.id, id), {
										reason: "frame-draft-remove",
									}),
								title: "Remove Frame",
							})
						}
					>
						<Trash2 size={14} />
					</Button>
				</div>
			))}
		</div>
	);
}
