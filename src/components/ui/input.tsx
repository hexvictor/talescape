"use client";

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
	...props
}: InputProps): React.JSX.Element {
	const isNativeSelectionControl =
		type === "checkbox" || type === "radio" || type === "range";

	return (
		<AriaInput
			{...props}
			type={type}
			data-slot="input"
			className={
				isNativeSelectionControl
					? cn("accent-primary", className)
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
