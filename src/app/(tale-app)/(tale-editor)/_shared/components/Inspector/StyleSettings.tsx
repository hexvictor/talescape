import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type { ReaderStyle, TaleNode } from "~/app/(tale-app)/_shared/types";
import { NumberSetting, TextSetting } from "./InspectorValueFields";
import { StyleLayoutSettings } from "./StyleLayoutSettings";

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
	className,
	layoutMode,
	onChange,
	style,
	title,
}: {
	className?: string;
	layoutMode?: TaleNode["mode"];
	onChange: (style: ReaderStyle) => void;
	style?: ReaderStyle;
	title: string;
}): React.JSX.Element {
	const current = style ?? {};
	const setText = (key: keyof ReaderStyle, value: string): void => {
		onChange({ ...current, [key]: value || undefined });
	};
	return (
		<section
			data-reader-component="StyleSettings"
			data-reader-role="style-settings"
			className={className}
		>
			<DebugCard title={title}>
				<TextSetting
					label="Background"
					value={current.backgroundCss ?? current.background ?? ""}
					onChange={(value) => setText("backgroundCss", value)}
				/>
				<TextSetting
					label="Background image"
					value={current.backgroundImage ?? ""}
					onChange={(value) => setText("backgroundImage", value)}
				/>
				<TextSetting
					label="Text color"
					value={current.color ?? ""}
					onChange={(value) => setText("color", value)}
				/>
				<TextSetting
					label="Border"
					value={current.border ?? ""}
					onChange={(value) => setText("border", value)}
				/>
				<TextSetting
					label="Clip path"
					placeholder="polygon(0 0, 100% 0, 92% 100%, 0 100%)"
					value={current.clipPath ?? ""}
					onChange={(value) => setText("clipPath", value)}
				/>
				<NumberSetting
					label="Border radius"
					value={current.borderRadius ?? 0}
					onChange={(borderRadius) => onChange({ ...current, borderRadius })}
				/>
				<TextSetting
					label="Vertical padding"
					placeholder="24px, 2rem, 6vh"
					value={String(current.paddingBlock ?? "")}
					onChange={(value) => setText("paddingBlock", value)}
				/>
				<TextSetting
					label="Horizontal padding"
					placeholder="24px, 2rem, 6vw"
					value={String(current.paddingInline ?? "")}
					onChange={(value) => setText("paddingInline", value)}
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
				<details className="col-span-2 rounded border border-foreground/8 p-2">
					<summary className="cursor-pointer font-semibold text-[10px] text-foreground/52 uppercase">
						Advanced layout and CSS
					</summary>
					<div className="@container/inspector-group mt-3 grid min-w-0 @min-[32rem]/inspector-group:grid-cols-2 grid-cols-1 gap-2">
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
						<TextSetting
							label="Padding shorthand"
							placeholder="24px 32px"
							value={String(current.padding ?? "")}
							onChange={(value) => setText("padding", value)}
						/>
						<TextSetting
							label="Width"
							value={String(current.width ?? "")}
							onChange={(value) => setText("width", value)}
						/>
						<TextSetting
							label="Height"
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
							value={String(current.margin ?? "")}
							onChange={(value) => setText("margin", value)}
						/>
						<TextSetting
							label="Box shadow"
							value={current.boxShadow ?? ""}
							onChange={(value) => setText("boxShadow", value)}
						/>
						<StyleLayoutSettings
							layoutMode={layoutMode ?? current.display}
							style={current}
							onChange={onChange}
						/>
						<TextSetting
							label="Custom CSS"
							value={current.cssText ?? ""}
							onChange={(value) => setText("cssText", value)}
						/>
					</div>
				</details>
			</DebugCard>
		</section>
	);
}
