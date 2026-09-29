import {
	DebugCard,
	Setting,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { resolveIds } from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	ElementPlacement,
	ResolvedTaleElement,
	ResolvedTaleScene,
} from "~/app/(tale-app)/_shared/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
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
			<PlacementSelect
				label="Position mode"
				value={placement.mode}
				options={[
					{ label: "Normal flow", value: "normal" },
					{ label: "Absolute in frame", value: "absolute" },
					{ label: "Fixed within scene viewport", value: "fixed" },
				]}
				onChange={(value) => {
					const mode = value as ElementPlacement["mode"];
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
			/>
			<PlacementSelect
				label="Parent frame"
				value={frameId}
				options={frames.map((frame) => ({
					label: frame.name?.trim() || `Frame ${frame.id}`,
					value: frame.id,
				}))}
				onChange={(nextFrameId) =>
					onChange({ ...placement, frameId: nextFrameId })
				}
			/>
			<PlacementSelect
				label="Overflow"
				value={placement.overflow ?? "clip"}
				options={[
					{ label: "Clip", value: "clip" },
					{ label: "Visible outside parent", value: "visible" },
				]}
				onChange={(value) =>
					onChange({
						...placement,
						overflow: value as "clip" | "visible",
					})
				}
			/>
			{placement.mode === "absolute" || placement.mode === "fixed" ? (
				<>
					<PlacementSelect
						label="Horizontal anchor"
						value={placement.horizontal}
						options={[
							{ label: "Left", value: "left" },
							{ label: "Center", value: "center" },
							{ label: "Right", value: "right" },
						]}
						onChange={(value) =>
							onChange({
								...placement,
								horizontal: value as "center" | "left" | "right",
							})
						}
					/>
					<PlacementSelect
						label="Vertical anchor"
						value={placement.vertical}
						options={[
							{ label: "Top", value: "top" },
							{ label: "Center", value: "center" },
							{ label: "Bottom", value: "bottom" },
						]}
						onChange={(value) =>
							onChange({
								...placement,
								vertical: value as "bottom" | "center" | "top",
							})
						}
					/>
					<PlacementSelect
						label="Unit"
						value={placement.unit}
						options={[
							{ label: "Viewport", value: "viewport" },
							{ label: "Pixels", value: "px" },
						]}
						onChange={(value) =>
							onChange({
								...placement,
								unit: value as "px" | "viewport",
							})
						}
					/>
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

function PlacementSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: readonly { label: string; value: string }[];
	value: string;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<Select aria-label={label} value={value} onValueChange={onChange}>
				<SelectTrigger density="compact" className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Setting>
	);
}
