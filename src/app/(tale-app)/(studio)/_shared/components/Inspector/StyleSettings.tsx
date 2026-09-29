import { Paintbrush } from "lucide-react";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type { ReaderStyle, TaleFrame } from "~/app/(tale-app)/_shared/types";
import { ImageUploadSetting } from "./ImageUploadSetting";
import {
	NumberSetting,
	OptionalNumberSetting,
	TextSetting,
} from "./InspectorValueFields";
import { StyleLayoutSettings } from "./StyleLayoutSettings";
import { StyleSelect } from "./style/StyleLayoutFields";

/**
 * Edits common safe style properties with advanced layout fields in a disclosure.
 *
 * @param props - Component props.
 * @param props.className - Optional wrapper class.
 * @param props.onChange - Receives the next style.
 * @param props.style - Current style.
 * @param props.title - Card title.
 * @returns Style controls.
 */
export function StyleSettings({
	appearanceDefaultOpen = false,
	className,
	layoutMode,
	onChange,
	showAppearanceControls = true,
	showBoxControls = true,
	showDisplayControls = true,
	showLayoutItemControls = true,
	showPositionControls = true,
	showTypographyControls = true,
	style,
	title,
}: {
	appearanceDefaultOpen?: boolean;
	className?: string;
	layoutMode?: TaleFrame["mode"];
	onChange: (style: ReaderStyle) => void;
	showAppearanceControls?: boolean;
	showBoxControls?: boolean;
	showDisplayControls?: boolean;
	showLayoutItemControls?: boolean;
	showPositionControls?: boolean;
	showTypographyControls?: boolean;
	style?: ReaderStyle;
	title: string;
}): React.JSX.Element {
	const current = style ?? {};
	const setText = (key: keyof ReaderStyle, value: string): void => {
		onChange({ ...current, [key]: value || undefined });
	};
	const setNumber = (
		key: keyof ReaderStyle,
		value: number | undefined,
	): void => {
		onChange({ ...current, [key]: value });
	};
	const effectiveLayoutMode = layoutMode ?? current.display;
	return (
		<section
			data-reader-component="StyleSettings"
			data-reader-role="style-settings"
			className={className}
		>
			<div className="space-y-3">
				{showBoxControls ? (
					<DebugCard
						collapsible={false}
						icon={<Paintbrush size={15} />}
						title={title}
					>
						<TextSetting
							label="Width"
							placeholder="100%, 320px, 40vw"
							value={String(current.width ?? "")}
							onChange={(value) => setText("width", value)}
						/>
						<TextSetting
							label="Height"
							placeholder="auto, 240px, 60vh"
							value={String(current.height ?? "")}
							onChange={(value) => setText("height", value)}
						/>
						<TextSetting
							label="Minimum width"
							value={String(current.minWidth ?? "")}
							onChange={(value) => setText("minWidth", value)}
						/>
						<TextSetting
							label="Minimum height"
							value={String(current.minHeight ?? "")}
							onChange={(value) => setText("minHeight", value)}
						/>
						<TextSetting
							label="Maximum width"
							value={String(current.maxWidth ?? "")}
							onChange={(value) => setText("maxWidth", value)}
						/>
						<TextSetting
							label="Maximum height"
							value={String(current.maxHeight ?? "")}
							onChange={(value) => setText("maxHeight", value)}
						/>
						<TextSetting
							label="Margin"
							placeholder="0 auto, 24px"
							value={String(current.margin ?? "")}
							onChange={(value) => setText("margin", value)}
						/>
						<TextSetting
							label="Padding"
							placeholder="24px 32px"
							value={String(current.padding ?? "")}
							onChange={(value) => setText("padding", value)}
						/>
					</DebugCard>
				) : null}
				{showPositionControls ? (
					<DebugCard defaultOpen={false} title="Position">
						<StyleSelect
							label="Position"
							value={current.position ?? "static"}
							options={["static", "relative", "absolute", "sticky"]}
							onChange={(position) => onChange({ ...current, position })}
						/>
						<OptionalNumberSetting
							label="Z index"
							value={current.zIndex}
							onChange={(value) => setNumber("zIndex", value)}
						/>
						<TextSetting
							label="Top"
							placeholder="0, 2rem, 10vh"
							value={String(current.top ?? "")}
							onChange={(value) => setText("top", value)}
						/>
						<TextSetting
							label="Left"
							placeholder="0, 2rem, 10vw"
							value={String(current.left ?? "")}
							onChange={(value) => setText("left", value)}
						/>
						<TextSetting
							label="Right"
							value={String(current.right ?? "")}
							onChange={(value) => setText("right", value)}
						/>
						<TextSetting
							label="Bottom"
							value={String(current.bottom ?? "")}
							onChange={(value) => setText("bottom", value)}
						/>
					</DebugCard>
				) : null}
				{showDisplayControls ? (
					<DebugCard title="Display">
						{layoutMode ? null : (
							<Setting label="Display">
								<select
									className={settingClassName}
									value={current.display ?? "block"}
									onChange={(event) =>
										onChange({
											...current,
											display: event.target.value as ReaderStyle["display"],
										})
									}
								>
									<option value="block">Block</option>
									<option value="inline-block">Inline block</option>
									<option value="flex">Flex</option>
									<option value="grid">Grid</option>
								</select>
							</Setting>
						)}
						<StyleLayoutSettings
							layoutMode={effectiveLayoutMode}
							showItemControls={showLayoutItemControls}
							style={current}
							onChange={onChange}
						/>
					</DebugCard>
				) : null}
				{showTypographyControls ? (
					<DebugCard defaultOpen={false} title="Typography">
						<TextSetting
							label="Text color"
							value={current.color ?? ""}
							onChange={(value) => setText("color", value)}
						/>
						<TextSetting
							label="Font size"
							placeholder="16px, 1rem"
							value={String(current.fontSize ?? "")}
							onChange={(value) => setText("fontSize", value)}
						/>
						<TextSetting
							label="Font weight"
							placeholder="400, 700"
							value={String(current.fontWeight ?? "")}
							onChange={(value) => setText("fontWeight", value)}
						/>
						<TextSetting
							label="Line height"
							placeholder="1.4, 28px"
							value={String(current.lineHeight ?? "")}
							onChange={(value) => setText("lineHeight", value)}
						/>
						<Setting label="Text alignment">
							<select
								className={settingClassName}
								value={current.textAlign ?? "left"}
								onChange={(event) =>
									onChange({
										...current,
										textAlign: event.target.value as ReaderStyle["textAlign"],
									})
								}
							>
								<option value="left">Left</option>
								<option value="center">Center</option>
								<option value="right">Right</option>
								<option value="justify">Justify</option>
							</select>
						</Setting>
					</DebugCard>
				) : null}
				{showAppearanceControls ? (
					<DebugCard defaultOpen={appearanceDefaultOpen} title="Appearance">
						<TextSetting
							label="Background"
							value={current.backgroundCss ?? current.background ?? ""}
							onChange={(value) => setText("backgroundCss", value)}
						/>
						<ImageUploadSetting
							label="Background image"
							value={current.backgroundImage ?? ""}
							onChange={(value) => setText("backgroundImage", value)}
						/>
						<TextSetting
							label="Background size"
							placeholder="cover, contain, 100% auto"
							value={current.backgroundSize ?? ""}
							onChange={(value) => setText("backgroundSize", value)}
						/>
						<TextSetting
							label="Background position"
							placeholder="center, top left"
							value={current.backgroundPosition ?? ""}
							onChange={(value) => setText("backgroundPosition", value)}
						/>
						<StyleSelect
							label="Background repeat"
							value={current.backgroundRepeat ?? "no-repeat"}
							options={[
								"no-repeat",
								"repeat",
								"repeat-x",
								"repeat-y",
								"round",
								"space",
							]}
							onChange={(backgroundRepeat) =>
								onChange({ ...current, backgroundRepeat })
							}
						/>
						<TextSetting
							label="Border"
							value={current.border ?? ""}
							onChange={(value) => setText("border", value)}
						/>
						<NumberSetting
							label="Border radius"
							value={current.borderRadius ?? 0}
							onChange={(borderRadius) =>
								onChange({ ...current, borderRadius })
							}
						/>
						<TextSetting
							label="Box shadow"
							value={current.boxShadow ?? ""}
							onChange={(value) => setText("boxShadow", value)}
						/>
						<TextSetting
							label="Clip path"
							placeholder="polygon(0 0, 100% 0, 92% 100%, 0 100%)"
							value={current.clipPath ?? ""}
							onChange={(value) => setText("clipPath", value)}
						/>
						<StyleSelect
							label="Object fit"
							value={current.objectFit ?? "cover"}
							options={["cover", "contain", "fill", "none", "scale-down"]}
							onChange={(objectFit) => onChange({ ...current, objectFit })}
						/>
						<TextSetting
							label="Object position"
							placeholder="center, top left, 50% 25%"
							value={current.objectPosition ?? ""}
							onChange={(value) => setText("objectPosition", value)}
						/>
						<Setting label="Overflow">
							<select
								className={settingClassName}
								value={current.overflow ?? "visible"}
								onChange={(event) =>
									onChange({
										...current,
										overflow: event.target.value as ReaderStyle["overflow"],
									})
								}
							>
								<option value="visible">Visible</option>
								<option value="hidden">Hidden</option>
								<option value="clip">Clip</option>
							</select>
						</Setting>
						<Setting label="Opacity">
							<input
								className={settingClassName}
								max={1}
								min={0}
								step={0.05}
								type="number"
								value={current.opacity ?? ""}
								onChange={(event) =>
									setNumber(
										"opacity",
										event.target.value === ""
											? undefined
											: Number(event.target.value),
									)
								}
							/>
						</Setting>
						<TextSetting
							label="Custom CSS"
							value={current.cssText ?? ""}
							onChange={(value) => setText("cssText", value)}
						/>
					</DebugCard>
				) : null}
			</div>
		</section>
	);
}
