"use client";

import { type CSSProperties, useState } from "react";
import {
	Input as AriaInput,
	type InputProps as AriaInputProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import { type ControlDensity, controlClassName } from "./control-styles";

export type InputProps = Omit<AriaInputProps, "className"> & {
	className?: string;
	density?: ControlDensity;
};

export default function Input({
	className,
	density = "default",
	type,
	style,
	onChange,
	...props
}: InputProps): React.JSX.Element {
	const [rangeValue, setRangeValue] = useState(props.defaultValue ?? 0);
	const min = Number(props.min ?? 0);
	const max = Number(props.max ?? 100);
	const progress = Math.max(
		0,
		Math.min(
			100,
			((Number(props.value ?? rangeValue) - min) / (max - min || 1)) * 100,
		),
	);
	const isNativeSelectionControl =
		type === "checkbox" || type === "radio" || type === "range";

	return (
		<AriaInput
			data-reader-component="Input"
			data-reader-role="input"
			{...props}
			type={type}
			style={
				type === "range"
					? ({
							...style,
							"--ts-slider-progress": `${progress}%`,
						} as CSSProperties)
					: style
			}
			onChange={(event) => {
				if (type === "range") setRangeValue(event.target.value);
				onChange?.(event);
			}}
			data-slot="input"
			className={
				isNativeSelectionControl
					? cn(
							type === "range" ? "ts-native-slider" : "accent-primary",
							className,
						)
					: controlClassName(
							density,
							cn(
								"selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-bold file:text-foreground file:text-sm",
								className,
							),
						)
			}
		/>
	);
}
