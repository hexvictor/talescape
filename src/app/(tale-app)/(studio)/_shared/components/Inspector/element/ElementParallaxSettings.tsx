"use client";

import { defaultElementParallax } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderScene/ElementParallaxLayer";
import {
	DebugCard,
	Setting,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type { ElementParallax } from "~/app/(tale-app)/_shared/types";
import { Switch } from "~/components/ui/switch";
import { InspectorSelect, NumberSetting } from "../InspectorValueFields";

export function ElementParallaxSettings({
	value,
	onChange,
}: {
	value?: ElementParallax;
	onChange: (value: ElementParallax) => void;
}) {
	const config = value ?? { ...defaultElementParallax, enabled: false };
	const depths = { far: 0.3, middle: 0.15, near: 0.05 };
	const timeline = config.scrollBasis === "timeline";
	const selectedDepth =
		Object.entries(depths).find(
			([, depth]) =>
				config.scrollY === (timeline ? -depth : depth) &&
				config.scrollX === (timeline ? 0 : depth),
		)?.[0] ?? "custom";
	return (
		<DebugCard
			componentName="ElementParallaxSettings"
			readerRole="parallax-settings"
			title="Parallax"
		>
			<div
				data-studio-component="ElementParallaxSettings"
				data-studio-role="parallax-controls"
				className="grid gap-3"
			>
				<Switch
					isSelected={config.enabled}
					onChange={(enabled) => onChange({ ...config, enabled })}
				>
					Parallax
				</Switch>
				{config.enabled && (
					<>
						<Setting label="Movement source">
							<InspectorSelect
								label="Movement source"
								value={config.source}
								options={[
									{ value: "scroll", label: "Scroll" },
									{ value: "mouse", label: "Mouse" },
									{ value: "both", label: "Scroll + mouse" },
								]}
								onChange={(source) =>
									onChange({
										...config,
										source: source as ElementParallax["source"],
									})
								}
							/>
						</Setting>
						<Setting label="Depth">
							<InspectorSelect
								label="Depth"
								value={selectedDepth}
								options={[
									{ value: "custom", label: "Custom" },
									{ value: "far", label: "Far" },
									{ value: "middle", label: "Middle" },
									{ value: "near", label: "Near" },
								]}
								onChange={(value) => {
									const depth = depths[value as "far" | "middle" | "near"];
									if (depth !== undefined)
										onChange({
											...config,
											scrollX: timeline ? 0 : depth,
											scrollY: timeline ? -depth : depth,
											mouseX: depth * 80,
											mouseY: depth * 60,
										});
								}}
							/>
						</Setting>
						{config.source !== "mouse" && (
							<>
								<Setting label="Scroll basis">
									<InspectorSelect
										label="Scroll basis"
										value={config.scrollBasis ?? "camera"}
										options={[
											{ value: "timeline", label: "Scroll distance" },
											{ value: "camera", label: "Camera travel" },
										]}
										onChange={(scrollBasis) =>
											onChange({
												...config,
												scrollBasis: scrollBasis as "camera" | "timeline",
											})
										}
									/>
								</Setting>
								<NumberSetting
									label="Scroll depth X"
									min={-2}
									step={0.05}
									value={config.scrollX}
									onChange={(scrollX) => onChange({ ...config, scrollX })}
								/>
								<NumberSetting
									label="Scroll depth Y"
									min={-2}
									step={0.05}
									value={config.scrollY}
									onChange={(scrollY) => onChange({ ...config, scrollY })}
								/>
							</>
						)}
						{config.source !== "scroll" && (
							<>
								<NumberSetting
									label="Mouse travel X (px)"
									min={-1000}
									value={config.mouseX}
									onChange={(mouseX) => onChange({ ...config, mouseX })}
								/>
								<NumberSetting
									label="Mouse travel Y (px)"
									min={-1000}
									value={config.mouseY}
									onChange={(mouseY) => onChange({ ...config, mouseY })}
								/>
							</>
						)}
						<NumberSetting
							label="Image overscan scale"
							min={1}
							step={0.05}
							value={config.scale}
							onChange={(scale) => onChange({ ...config, scale })}
						/>
					</>
				)}
			</div>
		</DebugCard>
	);
}
