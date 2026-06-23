import type { ReaderStyle } from "~/app/(tale-app)/_shared/types";
import { TextSetting } from "../InspectorValueFields";
import {
	GapSettings,
	type StyleChangeHandler,
	StyleSelect,
} from "./StyleLayoutFields";

/**
 * Renders controls for a grid container.
 *
 * @param props - Grid style props.
 * @param props.onChange - Receives the next style object.
 * @param props.style - Current style values.
 * @returns Grid container controls.
 *
 * @example
 * <GridStyleSettings style={style} onChange={setStyle} />
 */
export function GridStyleSettings({
	onChange,
	style,
}: {
	onChange: StyleChangeHandler;
	style: ReaderStyle;
}): React.JSX.Element {
	const setText = (key: keyof ReaderStyle, value: string): void => {
		onChange({ ...style, [key]: value || undefined });
	};

	return (
		<div className="col-span-2 grid grid-cols-2 gap-2 rounded border border-foreground/8 bg-background/15 p-2">
			<TextSetting
				label="Template columns"
				placeholder="repeat(3, minmax(0, 1fr))"
				value={style.gridTemplateColumns ?? ""}
				onChange={(value) => setText("gridTemplateColumns", value)}
			/>
			<TextSetting
				label="Template rows"
				placeholder="auto 1fr auto"
				value={style.gridTemplateRows ?? ""}
				onChange={(value) => setText("gridTemplateRows", value)}
			/>
			<TextSetting
				label="Template areas"
				placeholder={'"title title" "image text"'}
				value={style.gridTemplateAreas ?? ""}
				onChange={(value) => setText("gridTemplateAreas", value)}
			/>
			<StyleSelect
				label="Auto flow"
				value={style.gridAutoFlow ?? "row"}
				options={["row", "column", "dense", "row dense", "column dense"]}
				onChange={(gridAutoFlow) => onChange({ ...style, gridAutoFlow })}
			/>
			<TextSetting
				label="Auto columns"
				placeholder="minmax(0, 1fr)"
				value={style.gridAutoColumns ?? ""}
				onChange={(value) => setText("gridAutoColumns", value)}
			/>
			<TextSetting
				label="Auto rows"
				placeholder="auto"
				value={style.gridAutoRows ?? ""}
				onChange={(value) => setText("gridAutoRows", value)}
			/>
			<StyleSelect
				label="Align items"
				value={style.alignItems ?? "stretch"}
				options={["start", "center", "end", "stretch"]}
				onChange={(alignItems) => onChange({ ...style, alignItems })}
			/>
			<StyleSelect
				label="Justify items"
				value={style.justifyItems ?? "stretch"}
				options={["start", "center", "end", "stretch"]}
				onChange={(justifyItems) => onChange({ ...style, justifyItems })}
			/>
			<StyleSelect
				label="Align content"
				value={style.alignContent ?? "stretch"}
				options={[
					"start",
					"center",
					"end",
					"stretch",
					"space-between",
					"space-around",
					"space-evenly",
				]}
				onChange={(alignContent) => onChange({ ...style, alignContent })}
			/>
			<StyleSelect
				label="Justify content"
				value={style.justifyContent ?? "start"}
				options={[
					"start",
					"center",
					"end",
					"space-between",
					"space-around",
					"space-evenly",
				]}
				onChange={(justifyContent) => onChange({ ...style, justifyContent })}
			/>
			<GapSettings onChange={onChange} style={style} />
		</div>
	);
}
