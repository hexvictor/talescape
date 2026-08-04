import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type {
	FragmentPlacement,
	ResolvedTaleBlock,
	ResolvedTaleFragment,
} from "~/app/(tale-app)/_shared/types";
import { NumberSetting, OptionalNumberSetting } from "../InspectorValueFields";

/**
 * Edits fragment node ownership and normal, absolute, or fixed placement.
 *
 * @param props - Component props.
 * @param props.block - Parent block.
 * @param props.fragment - Current fragment.
 * @param props.onChange - Receives the next placement.
 * @returns Fragment placement controls.
 */
export function FragmentPlacementSettings({
	block,
	fragment,
	onChange,
}: {
	block: ResolvedTaleBlock;
	fragment: ResolvedTaleFragment;
	onChange: (placement: FragmentPlacement) => void;
}): React.JSX.Element {
	const placement = fragment.placement;
	const nodeId = placement.nodeId ?? fragment.nodeId ?? block.rootNodeId;
	return (
		<DebugCard
			componentName="FragmentPlacementSettings"
			readerRole="fragment-placement-settings"
			title="Placement"
		>
			<Setting label="Position mode">
				<select
					className={settingClassName}
					value={placement.mode}
					onChange={(event) => {
						const mode = event.target.value as FragmentPlacement["mode"];
						onChange(
							mode === "normal"
								? { mode, nodeId, overflow: placement.overflow }
								: {
										horizontal: "left",
										mode,
										nodeId,
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
					<option value="absolute">Absolute in node</option>
					<option value="fixed">Fixed within block viewport</option>
				</select>
			</Setting>
			<Setting label="Parent node">
				<select
					className={settingClassName}
					value={nodeId}
					onChange={(event) =>
						onChange({ ...placement, nodeId: event.target.value })
					}
				>
					{block.nodes.map((node) => (
						<option key={node.id} value={node.id}>
							{node.id}
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
