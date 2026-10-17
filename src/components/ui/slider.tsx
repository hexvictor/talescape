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
			data-reader-component="Slider"
			data-reader-role="slider-control"
			{...props}
			data-slot="slider"
			className={cn(
				"group/slider grid w-full gap-1 data-[disabled]:opacity-45",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-3">
				<AriaLabel className="font-bold text-xs uppercase">{label}</AriaLabel>
				<SliderOutput className="text-muted-foreground text-xs tabular-nums" />
			</div>
			<SliderTrack
				className={cn(
					"relative h-8 w-full cursor-pointer outline-none data-[orientation=vertical]:h-36 data-[orientation=vertical]:w-8",
				)}
			>
				<div
					aria-hidden="true"
					className={cn(
						"-translate-y-1/2 group-data-[orientation=vertical]/slider:-translate-x-1/2 absolute top-1/2 h-1.5 w-full rounded-[2px] border border-foreground bg-muted group-data-[orientation=vertical]/slider:top-0 group-data-[orientation=vertical]/slider:left-1/2 group-data-[orientation=vertical]/slider:h-full group-data-[orientation=vertical]/slider:w-1.5 group-data-[orientation=vertical]/slider:translate-y-0",
						density === "compact" && "h-1",
					)}
				/>
				<SliderFill
					className="-translate-y-1/2 group-data-[orientation=vertical]/slider:-translate-x-1/2 top-1/2 rounded-[2px] border border-foreground bg-primary group-data-[orientation=vertical]/slider:top-auto group-data-[orientation=vertical]/slider:left-1/2 group-data-[orientation=vertical]/slider:translate-y-0"
					style={({ orientation }) =>
						orientation === "vertical"
							? { width: density === "compact" ? 4 : 6 }
							: { height: density === "compact" ? 4 : 6 }
					}
				/>
				<SliderThumb
					className={cn(
						"top-1/2 rounded-[2px] border-2 border-foreground bg-card shadow-[1px_1px_0_rgb(var(--foreground-rgb))] outline-none data-[dragging]:bg-primary data-[focus-visible]:ring-4 data-[focus-visible]:ring-ring/40 group-data-[orientation=vertical]/slider:top-auto group-data-[orientation=vertical]/slider:left-1/2",
						density === "compact" ? "h-4 w-3" : "h-5 w-4",
					)}
				/>
			</SliderTrack>
		</AriaSlider>
	);
}
