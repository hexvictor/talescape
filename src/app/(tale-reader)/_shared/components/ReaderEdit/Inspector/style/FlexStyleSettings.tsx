import type { ReaderStyle } from "../../../../types";
import {
	GapSettings,
	type StyleChangeHandler,
	StyleSelect,
} from "./StyleLayoutFields";

/**
 * Renders controls for a flex container.
 *
 * @param props - Flex style props.
 * @param props.onChange - Receives the next style object.
 * @param props.style - Current style values.
 * @returns Flex container controls.
 *
 * @example
 * <FlexStyleSettings style={style} onChange={setStyle} />
 */
export function FlexStyleSettings({
	onChange,
	style,
}: {
	onChange: StyleChangeHandler;
	style: ReaderStyle;
}): React.JSX.Element {
	return (
		<div className="col-span-2 grid grid-cols-2 gap-2 rounded border border-white/8 bg-black/15 p-2">
			<StyleSelect
				label="Flex direction"
				value={style.flexDirection ?? "row"}
				options={["row", "row-reverse", "column", "column-reverse"]}
				onChange={(flexDirection) => onChange({ ...style, flexDirection })}
			/>
			<StyleSelect
				label="Flex wrapping"
				value={style.flexWrap ?? "nowrap"}
				options={["nowrap", "wrap", "wrap-reverse"]}
				onChange={(flexWrap) => onChange({ ...style, flexWrap })}
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
			<StyleSelect
				label="Align items"
				value={style.alignItems ?? "stretch"}
				options={["start", "center", "end", "stretch"]}
				onChange={(alignItems) => onChange({ ...style, alignItems })}
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
				label="Justify items"
				value={style.justifyItems ?? "stretch"}
				options={["start", "center", "end", "stretch"]}
				onChange={(justifyItems) => onChange({ ...style, justifyItems })}
			/>
			<GapSettings onChange={onChange} style={style} />
		</div>
	);
}
