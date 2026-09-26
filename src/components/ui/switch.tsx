"use client";

import type { ReactNode } from "react";
import {
	Switch as AriaSwitch,
	type SwitchProps as AriaSwitchProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import type { ControlDensity } from "./control-styles";

export type SwitchProps = Omit<AriaSwitchProps, "children" | "className"> & {
	className?: string;
	children?: ReactNode;
	density?: ControlDensity;
};

export function Switch({
	children,
	className,
	density = "default",
	...props
}: SwitchProps): React.JSX.Element {
	return (
		<AriaSwitch
			{...props}
			data-slot="switch"
			className={cn(
				"group inline-flex cursor-pointer select-none items-center font-bold outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
				density === "compact" ? "gap-2 text-xs" : "gap-2.5 text-sm",
				className,
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					"flex shrink-0 items-center border-2 border-foreground bg-muted px-0.5 shadow-[2px_2px_0_rgb(var(--foreground-rgb))] transition-colors group-data-[selected]:bg-primary group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-ring/40",
					density === "compact" ? "h-4 w-8" : "h-5 w-10",
				)}
			>
				<span
					className={cn(
						"aspect-square h-[70%] bg-foreground transition-transform group-data-[selected]:translate-x-full group-data-[selected]:bg-primary-foreground",
					)}
				/>
			</span>
			{children}
		</AriaSwitch>
	);
}
