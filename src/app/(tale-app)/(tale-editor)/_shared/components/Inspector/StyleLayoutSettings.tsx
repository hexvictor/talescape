import type { ReaderStyle, TaleNode } from "~/app/(tale-app)/_shared/types";
import { OptionalNumberSetting, TextSetting } from "./InspectorValueFields";
import { FlexStyleSettings } from "./style/FlexStyleSettings";
import { GridStyleSettings } from "./style/GridStyleSettings";
import { StyleSelect } from "./style/StyleLayoutFields";

type StyleLayoutMode = TaleNode["mode"] | ReaderStyle["display"];

type StyleLayoutSettingsProps = {
	layoutMode?: StyleLayoutMode;
	onChange: (style: ReaderStyle) => void;
	style: ReaderStyle;
};

/**
 * Renders layout controls that apply to the active display mode.
 *
 * @param props - Layout style editor props.
 * @param props.layoutMode - Effective node or fragment display mode.
 * @param props.onChange - Receives the next style object.
 * @param props.style - Current style values.
 * @returns Flex, grid, and child placement controls.
 *
 * @example
 * <StyleLayoutSettings layoutMode="grid" style={style} onChange={setStyle} />
 */
export function StyleLayoutSettings({
	layoutMode,
	onChange,
	style,
}: StyleLayoutSettingsProps): React.JSX.Element {
	const setText = (key: keyof ReaderStyle, value: string): void => {
		onChange({ ...style, [key]: value || undefined });
	};
	const setNumber = (
		key: keyof ReaderStyle,
		value: number | undefined,
	): void => {
		onChange({ ...style, [key]: value });
	};

	return (
		<>
			<div className="@container/inspector-group col-span-2 grid min-w-0 @min-[32rem]/inspector-group:grid-cols-2 grid-cols-1 gap-2 rounded border border-foreground/8 bg-background/15 p-2">
				<TextSetting
					label="Grid area"
					value={style.gridArea ?? ""}
					onChange={(value) => setText("gridArea", value)}
				/>
				<TextSetting
					label="Grid column"
					value={style.gridColumn ?? ""}
					onChange={(value) => setText("gridColumn", value)}
				/>
				<TextSetting
					label="Grid row"
					value={style.gridRow ?? ""}
					onChange={(value) => setText("gridRow", value)}
				/>
				<StyleSelect
					label="Self alignment"
					value={style.alignSelf ?? "auto"}
					options={["auto", "start", "center", "end", "stretch"]}
					onChange={(alignSelf) => onChange({ ...style, alignSelf })}
				/>
				<StyleSelect
					label="Self justification"
					value={style.justifySelf ?? "auto"}
					options={["auto", "start", "center", "end", "stretch"]}
					onChange={(justifySelf) => onChange({ ...style, justifySelf })}
				/>
				<OptionalNumberSetting
					label="Order"
					value={style.order}
					onChange={(value) => setNumber("order", value)}
				/>
				<TextSetting
					label="Flex basis"
					placeholder="auto, 12rem, 40%"
					value={String(style.flexBasis ?? "")}
					onChange={(value) => setText("flexBasis", value)}
				/>
				<OptionalNumberSetting
					label="Flex grow"
					value={style.flexGrow}
					onChange={(value) => setNumber("flexGrow", value)}
				/>
				<OptionalNumberSetting
					label="Flex shrink"
					value={style.flexShrink}
					onChange={(value) => setNumber("flexShrink", value)}
				/>
			</div>
			{layoutMode === "flex" ? (
				<FlexStyleSettings onChange={onChange} style={style} />
			) : null}
			{layoutMode === "grid" ? (
				<GridStyleSettings onChange={onChange} style={style} />
			) : null}
		</>
	);
}
