"use client";

import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import {
	Checkbox as AriaCheckbox,
	type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import type { ControlDensity } from "./control-styles";

export type CheckboxProps = Omit<
	AriaCheckboxProps,
	"children" | "className"
> & {
	className?: string;
	children?: ReactNode;
	density?: ControlDensity;
};

export function Checkbox({
	children,
	className,
	density = "default",
	...props
}: CheckboxProps): React.JSX.Element {
	return (
		<AriaCheckbox
			{...props}
			data-slot="checkbox"
			className={cn(
				"group inline-flex cursor-pointer select-none items-center font-bold outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
				density === "compact" ? "gap-2 text-xs" : "gap-2.5 text-sm",
				className,
			)}
		>
			{({ isIndeterminate, isSelected }) => (
				<>
					<span
						aria-hidden="true"
						className={cn(
							"flex shrink-0 items-center justify-center border-2 border-foreground bg-card text-primary-foreground shadow-[2px_2px_0_rgb(var(--foreground-rgb))] transition-colors group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-ring/40",
							density === "compact" ? "size-4" : "size-5",
							(isSelected || isIndeterminate) && "bg-primary",
						)}
					>
						{isIndeterminate ? (
							<Minus className="size-3" strokeWidth={3} />
						) : isSelected ? (
							<Check className="size-3" strokeWidth={3} />
						) : null}
					</span>
					{children}
				</>
			)}
		</AriaCheckbox>
	);
}
