"use client";

import type { ResolvedTaleBlock } from "../../../../types";
import {
	DebugCard,
	Setting,
} from "../../../ReaderUi/TaleDebug/DebugPrimitives";
import { CameraPathSettings, MotionNumber } from "./MotionControls";
import type { BlockChangeHandler } from "./blockMotionTypes";

/**
 * Edits a block's reading length, pauses, and camera path.
 *
 * @param props - Component props.
 * @param props.block - Current resolved block.
 * @param props.onChange - Applies a block update.
 * @returns Reading controls.
 */
export function BlockReadingSettings({
	block,
	onChange,
}: {
	block: ResolvedTaleBlock;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	return (
		<DebugCard
			componentName="BlockReadingSettings"
			readerRole="block-reading-settings"
			title="Reading"
		>
			<Setting label="Length mode">
				<select
					className="h-9 w-full rounded border border-white/12 bg-black/35 px-2 text-white/82 text-xs"
					value={block.reading.readingLengthMode}
					onChange={(event) =>
						onChange((item) => ({
							...item,
							reading: {
								...item.reading,
								readingLengthMode: event.target.value as "content" | "manual",
							},
						}))
					}
				>
					<option value="content">Content derived</option>
					<option value="manual">Manual</option>
				</select>
			</Setting>
			<MotionNumber
				label="Manual length"
				value={block.reading.readingLength}
				onChange={(readingLength) =>
					onChange((item) => ({
						...item,
						reading: { ...item.reading, readingLength },
					}))
				}
			/>
			<MotionNumber
				label="Start pause"
				value={block.reading.pauses?.atStart ?? 0}
				onChange={(atStart) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							pauses: { ...item.reading.pauses, atStart: atStart ?? 0 },
						},
					}))
				}
			/>
			<MotionNumber
				label="End pause"
				value={block.reading.pauses?.atEnd ?? 0}
				onChange={(atEnd) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							pauses: { ...item.reading.pauses, atEnd: atEnd ?? 0 },
						},
					}))
				}
			/>
			<CameraPathSettings
				path={block.reading.cameraPath ?? { mode: "auto" }}
				onChange={(cameraPath) =>
					onChange((item) => ({
						...item,
						reading: { ...item.reading, cameraPath },
					}))
				}
			/>
		</DebugCard>
	);
}
