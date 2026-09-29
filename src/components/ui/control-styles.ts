import cn from "~/lib/utils/cn";

export type ControlDensity = "default" | "compact";

export const controlBaseClassName =
	"w-full min-w-0 border-2 border-input bg-card text-foreground outline-none transition-[color,box-shadow,border-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[invalid]:border-destructive data-[invalid]:ring-destructive/20";

export function controlDensityClassName(density: ControlDensity): string {
	return density === "compact"
		? "min-h-[var(--ts-control-height-compact)] px-2.5 py-1.5 text-xs shadow-[2px_2px_0_rgb(var(--foreground-rgb))]"
		: "min-h-[var(--ts-control-height)] px-3 py-2 text-base shadow-[3px_3px_0_rgb(var(--foreground-rgb))] md:text-sm";
}

export function controlClassName(
	density: ControlDensity,
	className?: string,
): string {
	return cn(controlBaseClassName, controlDensityClassName(density), className);
}
