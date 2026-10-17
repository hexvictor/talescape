"use client";

import { useEffect, useState } from "react";
import type { ReaderStyle } from "~/app/(tale-app)/_shared/types";
import { ColorPicker } from "~/components/ui/color-picker";

export function StyleColorSetting({
	property,
	style,
	onChange,
}: {
	property: "color" | "backgroundCss" | "border";
	style: ReaderStyle;
	onChange: (style: ReaderStyle) => void;
}) {
	const [borderColor, setBorderColor] = useState("");
	useEffect(() => {
		const css = document.createElement("span").style;
		css.border = style.border ?? "";
		setBorderColor(css.borderColor);
	}, [style.border]);
	const label =
		property === "color"
			? "Text color"
			: property === "border"
				? "Border color"
				: "Background";
	const value =
		property === "border"
			? borderColor
			: property === "backgroundCss"
				? (style.backgroundCss ?? style.background ?? "")
				: (style.color ?? "");
	return (
		<ColorPicker
			label={label}
			density="compact"
			value={value}
			allowCss={property === "backgroundCss"}
			allowEmpty={property !== "border"}
			onChange={(next) => {
				if (property === "border") {
					const css = document.createElement("span").style;
					css.border = style.border ?? "";
					if (!css.borderWidth) css.borderWidth = "1px";
					if (!css.borderStyle || css.borderStyle === "none")
						css.borderStyle = "solid";
					css.borderColor = next;
					onChange({ ...style, border: css.border });
				} else if (property === "backgroundCss") {
					onChange({
						...style,
						background: undefined,
						backgroundCss: next || undefined,
					});
				} else onChange({ ...style, color: next || undefined });
			}}
		/>
	);
}
