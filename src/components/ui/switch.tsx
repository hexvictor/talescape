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
			data-reader-component="Switch"
			data-reader-role="toggle-control"
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
					"relative shrink-0 rounded-full border-2 border-foreground bg-muted shadow-[1px_1px_0_rgb(var(--foreground-rgb))] transition-colors group-data-[selected]:bg-primary group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-ring/40",
					density === "compact" ? "h-5 w-9" : "h-6 w-11",
				)}
			>
				<span
					className={cn(
						"absolute top-0.5 left-0.5 rounded-full border border-foreground bg-background transition-transform duration-150 group-data-[selected]:translate-x-5 motion-reduce:transition-none",
						density === "compact"
							? "size-3 group-data-[selected]:translate-x-4"
							: "size-4",
					)}
				/>
			</span>
			{children}
		</AriaSwitch>
	);
}
