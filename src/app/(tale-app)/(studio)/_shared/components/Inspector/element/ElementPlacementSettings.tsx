import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { resolveIds } from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	ElementPlacement,
	ResolvedTaleElement,
	ResolvedTaleScene,
} from "~/app/(tale-app)/_shared/types";
import { NumberSetting, OptionalNumberSetting } from "../InspectorValueFields";

/**
 * Edits element frame ownership and normal, absolute, or fixed placement.
 *
 * @param props - Component props.
 * @param props.scene - Parent scene.
 * @param props.element - Current element.
 * @param props.onChange - Receives the next placement.
 * @returns Element placement controls.
 */
export function ElementPlacementSettings({
	scene,
	element,
	onChange,
}: {
	scene: ResolvedTaleScene;
	element: ResolvedTaleElement;
	onChange: (placement: ElementPlacement) => void;
}): React.JSX.Element {
	const framesById = useTaleAppStore(
		(state) => state.document.tale.indexMap.framesById,
	);
	const frames = resolveIds(scene.frameIds, framesById);
	const placement = element.placement;
	const frameId = placement.frameId ?? element.frameId ?? scene.rootFrameId;
	return (
		<DebugCard
			componentName="ElementPlacementSettings"
			readerRole="element-placement-settings"
			title="Placement"
		>
			<Setting label="Position mode">
				<select
					className={settingClassName}
					value={placement.mode}
					onChange={(event) => {
						const mode = event.target.value as ElementPlacement["mode"];
						onChange(
							mode === "normal"
								? { mode, frameId, overflow: placement.overflow }
								: {
										horizontal: "left",
										mode,
										frameId,
										overflow: "visible",
										unit: "viewport",
										vertical: "top",
										x: 0.1,
										y: 0.1,
									},
						);
					}}
				>
					<option value="normal">Normal flow</option>
					<option value="absolute">Absolute in frame</option>
					<option value="fixed">Fixed within scene viewport</option>
				</select>
			</Setting>
			<Setting label="Parent frame">
				<select
					className={settingClassName}
					value={frameId}
					onChange={(event) =>
						onChange({ ...placement, frameId: event.target.value })
					}
				>
					{frames.map((frame) => (
						<option key={frame.id} value={frame.id}>
							{frame.id}
						</option>
					))}
				</select>
			</Setting>
			<Setting label="Overflow">
				<select
					className={settingClassName}
					value={placement.overflow ?? "clip"}
					onChange={(event) =>
						onChange({
							...placement,
							overflow: event.target.value as "clip" | "visible",
						})
					}
				>
					<option value="clip">Clip</option>
					<option value="visible">Visible outside parent</option>
				</select>
			</Setting>
			{placement.mode === "absolute" || placement.mode === "fixed" ? (
				<>
					<Setting label="Horizontal anchor">
						<select
							className={settingClassName}
							value={placement.horizontal}
							onChange={(event) =>
								onChange({
									...placement,
									horizontal: event.target.value as "center" | "left" | "right",
								})
							}
						>
							<option value="left">Left</option>
							<option value="center">Center</option>
							<option value="right">Right</option>
						</select>
					</Setting>
					<Setting label="Vertical anchor">
						<select
							className={settingClassName}
							value={placement.vertical}
							onChange={(event) =>
								onChange({
									...placement,
									vertical: event.target.value as "bottom" | "center" | "top",
								})
							}
						>
							<option value="top">Top</option>
							<option value="center">Center</option>
							<option value="bottom">Bottom</option>
						</select>
					</Setting>
					<Setting label="Unit">
						<select
							className={settingClassName}
							value={placement.unit}
							onChange={(event) =>
								onChange({
									...placement,
									unit: event.target.value as "px" | "viewport",
								})
							}
						>
							<option value="viewport">Viewport</option>
							<option value="px">Pixels</option>
						</select>
					</Setting>
					{placement.horizontal === "center" ? null : (
						<NumberSetting
							label="X"
							min={-10000}
							step={placement.unit === "px" ? 10 : 0.05}
							value={placement.x}
							onChange={(x) => onChange({ ...placement, x })}
						/>
					)}
					{placement.vertical === "center" ? null : (
						<NumberSetting
							label="Y"
							min={-10000}
							step={placement.unit === "px" ? 10 : 0.05}
							value={placement.y}
							onChange={(y) => onChange({ ...placement, y })}
						/>
					)}
					<OptionalNumberSetting
						label="Width"
						value={placement.width}
						onChange={(width) => onChange({ ...placement, width })}
					/>
					<NumberSetting
						label="Z index"
						min={-1000}
						value={placement.zIndex ?? 0}
						onChange={(zIndex) => onChange({ ...placement, zIndex })}
					/>
				</>
			) : null}
		</DebugCard>
	);
}
