"use client";

import {
	Label as AriaLabel,
	Slider as AriaSlider,
	type SliderProps as AriaSliderProps,
	SliderFill,
	SliderOutput,
	SliderThumb,
	SliderTrack,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import type { ControlDensity } from "./control-styles";

export type SliderProps = Omit<AriaSliderProps<number>, "className"> & {
	className?: string;
	density?: ControlDensity;
	label: string;
};

export function Slider({
	className,
	density = "default",
	label,
	...props
}: SliderProps): React.JSX.Element {
	return (
		<AriaSlider
			{...props}
			data-slot="slider"
			className={cn("grid w-full gap-2", className)}
		>
			<div className="flex items-center justify-between gap-3">
				<AriaLabel className="font-bold text-xs uppercase">{label}</AriaLabel>
				<SliderOutput className="text-muted-foreground text-xs tabular-nums" />
			</div>
			<SliderTrack
				className={cn(
					"relative flex w-full items-center bg-muted outline-none",
					density === "compact" ? "h-2" : "h-3",
				)}
			>
				<SliderFill className="absolute h-full bg-primary" />
				<SliderThumb
					className={cn(
						"border-2 border-foreground bg-card shadow-[2px_2px_0_rgb(var(--foreground-rgb))] outline-none data-[focus-visible]:ring-4 data-[focus-visible]:ring-ring/40",
						density === "compact" ? "size-4" : "size-5",
					)}
				/>
			</SliderTrack>
		</AriaSlider>
	);
}
