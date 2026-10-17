"use client";

import type { ReactNode } from "react";
import {
	Radio as AriaRadio,
	RadioGroup as AriaRadioGroup,
	type RadioGroupProps as AriaRadioGroupProps,
	type RadioProps as AriaRadioProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import type { ControlDensity } from "./control-styles";

export function RadioGroup({
	className,
	...props
}: AriaRadioGroupProps): React.JSX.Element {
	return (
		<AriaRadioGroup
			data-reader-component="RadioGroup"
			data-reader-role="radio-group"
			{...props}
			data-slot="radio-group"
			className={cn("grid gap-2", className)}
		/>
	);
}

export type RadioProps = Omit<AriaRadioProps, "children" | "className"> & {
	className?: string;
	children?: ReactNode;
	density?: ControlDensity;
};

export function Radio({
	children,
	className,
	density = "default",
	...props
}: RadioProps): React.JSX.Element {
	return (
		<AriaRadio
			data-reader-component="Radio"
			data-reader-role="radio"
			{...props}
			data-slot="radio"
			className={cn(
				"group inline-flex cursor-pointer select-none items-center font-bold outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
				density === "compact" ? "gap-2 text-xs" : "gap-2.5 text-sm",
				className,
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					"flex shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-card shadow-[2px_2px_0_rgb(var(--foreground-rgb))] group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-ring/40",
					density === "compact" ? "size-4" : "size-5",
				)}
			>
				<span className="size-1.5 rounded-full bg-primary opacity-0 group-data-[selected]:opacity-100" />
			</span>
			{children}
		</AriaRadio>
	);
}
