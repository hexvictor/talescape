"use client";

import {
	DebugCard,
	Setting,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type { ResolvedTaleScene } from "~/app/(tale-app)/_shared/types";
import { MotionNumber } from "./MotionControls";
import { SceneAnimationSettings } from "./SceneAnimationSettings";
import { SceneReadingSettings } from "./SceneReadingSettings";
import { SceneSnapSettings } from "./SceneTransitionSettings";
import type { BlockChangeHandler } from "./sceneMotionTypes";

/**
 * Groups the reading, transition, and animation controls for a scene.
 *
 * @param props - Component props.
 * @param props.scene - Current resolved scene.
 * @param props.onChange - Applies a scene update.
 * @returns Scene motion controls.
 */
export function SceneMotionSettings({
	scene,
	onChange,
}: {
	scene: ResolvedTaleScene;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="SceneMotionSettings"
			data-reader-role="scene-motion-settings"
			className="space-y-3"
		>
			<ScenePhaseSettings scene={scene} onChange={onChange} />
			<SceneReadingSettings scene={scene} onChange={onChange} />
			<SceneSnapSettings scene={scene} onChange={onChange} />
			<SceneAnimationSettings scene={scene} onChange={onChange} />
		</div>
	);
}

function ScenePhaseSettings({
	scene,
	onChange,
}: {
	scene: ResolvedTaleScene;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	const introEnabled = scene.transition.introEnabled ?? false;
	const outroEnabled = scene.transition.outroEnabled ?? false;
	return (
		<DebugCard title="Scene phases">
			<PhaseToggle
				checked={introEnabled}
				label="Intro transition"
				onChange={(checked) =>
					onChange((item) => ({
						...item,
						transition: { ...item.transition, introEnabled: checked },
					}))
				}
			/>
			{introEnabled ? (
				<MotionNumber
					label="Intro length"
					value={scene.transition.introLength ?? 0}
					onChange={(introLength) =>
						onChange((item) => ({
							...item,
							transition: {
								...item.transition,
								introLength: introLength ?? 0,
							},
						}))
					}
				/>
			) : null}
			<PhaseToggle
				checked={outroEnabled}
				label="Outro transition"
				onChange={(checked) =>
					onChange((item) => ({
						...item,
						transition: { ...item.transition, outroEnabled: checked },
					}))
				}
			/>
			{outroEnabled ? (
				<MotionNumber
					label="Outro length"
					value={scene.transition.outroLength ?? 0}
					onChange={(outroLength) =>
						onChange((item) => ({
							...item,
							transition: {
								...item.transition,
								outroLength: outroLength ?? 0,
							},
						}))
					}
				/>
			) : null}
			<PhaseToggle
				checked={scene.transition.pauseAfterIntroEnabled ?? false}
				label="Pause after intro"
				onChange={(checked) =>
					onChange((item) => ({
						...item,
						transition: {
							...item.transition,
							pauseAfterIntroEnabled: checked,
						},
					}))
				}
			/>
			{scene.transition.pauseAfterIntroEnabled ? (
				<MotionNumber
					label="Intro pause"
					value={scene.reading.pauses?.atStart ?? 0}
					onChange={(atStart) =>
						onChange((item) => ({
							...item,
							reading: {
								...item.reading,
								pauses: {
									...(item.reading.pauses ?? { atEnd: 0, atStart: 0 }),
									atStart: atStart ?? 0,
								},
							},
						}))
					}
				/>
			) : null}
			<PhaseToggle
				checked={scene.transition.pauseBeforeOutroEnabled ?? false}
				label="Pause before outro"
				onChange={(checked) =>
					onChange((item) => ({
						...item,
						transition: {
							...item.transition,
							pauseBeforeOutroEnabled: checked,
						},
					}))
				}
			/>
			{scene.transition.pauseBeforeOutroEnabled ? (
				<MotionNumber
					label="Outro pause"
					value={scene.reading.pauses?.atEnd ?? 0}
					onChange={(atEnd) =>
						onChange((item) => ({
							...item,
							reading: {
								...item.reading,
								pauses: {
									...(item.reading.pauses ?? { atEnd: 0, atStart: 0 }),
									atEnd: atEnd ?? 0,
								},
							},
						}))
					}
				/>
			) : null}
		</DebugCard>
	);
}

function PhaseToggle({
	checked,
	label,
	onChange,
}: {
	checked: boolean;
	label: string;
	onChange: (checked: boolean) => void;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
			/>
		</Setting>
	);
}
