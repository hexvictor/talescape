import { Paintbrush } from "lucide-react";
import { DebugCard } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
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
							<StyleSelect
								label="Display"
								value={current.display ?? "block"}
								options={["block", "inline-block", "flex", "grid"]}
								onChange={(display) => onChange({ ...current, display })}
							/>
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
						<StyleSelect
							label="Text alignment"
							value={current.textAlign ?? "left"}
							options={["left", "center", "right", "justify"]}
							onChange={(textAlign) => onChange({ ...current, textAlign })}
						/>
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
						<StyleSelect
							label="Overflow"
							value={current.overflow ?? "visible"}
							options={["visible", "hidden", "clip"]}
							onChange={(overflow) => onChange({ ...current, overflow })}
						/>
						<OptionalNumberSetting
							label="Opacity"
							max={1}
							min={0}
							step={0.05}
							value={current.opacity}
							onChange={(opacity) => setNumber("opacity", opacity)}
						/>
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
