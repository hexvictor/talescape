"use client";

import { BookOpen } from "lucide-react";
import { DebugCard } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type { ResolvedTaleScene } from "~/app/(tale-app)/_shared/types";
import type { BlockChangeHandler } from "./sceneMotionTypes";

/**
 * Edits a scene's reading length, pauses, and camera path.
 *
 * @param props - Component props.
 * @param props.scene - Current resolved scene.
 * @param props.onChange - Applies a scene update.
 * @returns Reading controls.
 */
export function SceneReadingSettings({
	scene: _scene,
	onChange: _onChange,
}: {
	scene: ResolvedTaleScene;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	return (
		<DebugCard
			componentName="SceneReadingSettings"
			icon={<BookOpen size={15} />}
			readerRole="scene-reading-settings"
			title="Progression"
		>
			<p className="col-span-2 text-foreground/52 text-xs">
				Scene progression is derived from its ordered Frame Keyframes. The Scene
				reads through the ordered Frames and Keyframes in this Scene.
			</p>
		</DebugCard>
	);
}
