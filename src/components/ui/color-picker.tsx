"use client";

import { Pipette, RotateCcw } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
	ColorArea,
	ColorSlider,
	ColorThumb,
	Dialog,
	DialogTrigger,
	Label,
	Popover,
	SliderTrack,
	parseColor,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import { Button } from "./button";
import type { ControlDensity } from "./control-styles";
import Input from "./input";

export type ColorSwatch = { value: string; label: string; color?: string };
const defaultSwatches: ColorSwatch[] = [
	{ value: "var(--ts-cyan)", label: "Cyan" },
	{ value: "var(--ts-pink)", label: "Magenta" },
	{ value: "var(--ts-yellow)", label: "Yellow" },
	{ value: "var(--ts-green)", label: "Green" },
	{ value: "var(--foreground)", label: "Foreground" },
	{ value: "var(--background)", label: "Background" },
	{ value: "transparent", label: "Transparent" },
];

export type ColorPickerProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	className?: string;
	popoverClassName?: string;
	areaClassName?: string;
	density?: ControlDensity;
	isDisabled?: boolean;
	isInvalid?: boolean;
	allowAlpha?: boolean;
	/** Preserve CSS backgrounds such as gradients in the manual field. */
	allowCss?: boolean;
	allowEmpty?: boolean;
	swatches?: readonly ColorSwatch[];
};

export function ColorPicker({
	label,
	value,
	onChange,
	className,
	popoverClassName,
	areaClassName,
	density = "default",
	isDisabled = false,
	isInvalid = false,
	allowAlpha = true,
	allowCss = false,
	allowEmpty = false,
	swatches = defaultSwatches,
}: ColorPickerProps) {
	const id = useId();
	const preview = useRef<HTMLSpanElement>(null);
	const [draft, setDraft] = useState(value);
	const [invalid, setInvalid] = useState(false);
	const [color, setColor] = useState(() =>
		parseColor("#000000").toFormat("hsb"),
	);
	const resolved = swatches.find((s) => s.value === value)?.color ?? value;
	useEffect(() => {
		setDraft(value);
		setInvalid(false);
	}, [value]);
	useEffect(() => {
		try {
			setColor(parseColor(value).toFormat("hsb"));
		} catch {
			if (preview.current) {
				try {
					setColor(
						parseColor(
							getComputedStyle(preview.current).backgroundColor,
						).toFormat("hsb"),
					);
				} catch {
					/* CSS gradients have no single color. */
				}
			}
		}
	}, [value]);
	const valid = (text: string) =>
		(allowEmpty && !text.trim()) ||
		swatches.some((s) => s.value === text) ||
		CSS.supports(allowCss ? "background" : "color", text);
	const commit = () => {
		const accepted = valid(draft);
		setInvalid(!accepted);
		if (accepted) onChange(draft);
	};
	const changeColor = (next: typeof color) => {
		setColor(next);
		onChange(
			next.getChannelValue("alpha") < 1
				? next.toString("hexa")
				: next.toString("hex"),
		);
	};
	return (
		<div
			className={cn("grid min-w-0 gap-1", className)}
			data-reader-component="ColorPicker"
			data-reader-role="color-control"
			data-slot="color-picker"
		>
			<label htmlFor={id} className="font-bold text-xs uppercase">
				{label}
			</label>
			<div className="flex min-w-0 items-center gap-2">
				<DialogTrigger>
					<Button
						aria-label={`Choose ${label.toLowerCase()}`}
						title={`Choose ${label.toLowerCase()}`}
						variant="outline"
						size="icon"
						motion="flat"
						disabled={isDisabled}
						className={cn(
							"ts-color-swatch shrink-0",
							density === "compact" && "size-8",
						)}
					>
						<span
							ref={preview}
							className="absolute inset-1"
							style={{ background: resolved || "transparent" }}
						/>
						<Pipette className="relative size-4 text-[var(--ts-white)] mix-blend-difference" />
					</Button>
					<Popover
						placement="bottom start"
						className={cn(
							"z-50 w-72 max-w-[calc(100vw-2rem)] border-2 border-foreground bg-popover p-3 text-popover-foreground shadow-[4px_4px_0_rgb(var(--foreground-rgb))]",
							popoverClassName,
						)}
						data-reader-component="ColorPicker"
						data-reader-role="color-popover"
					>
						<Dialog
							aria-label={`${label} picker`}
							className="grid gap-3 outline-none"
						>
							<ColorArea
								aria-label={`${label} saturation and brightness`}
								colorSpace="hsb"
								xChannel="saturation"
								yChannel="brightness"
								value={color}
								onChange={changeColor}
								isDisabled={isDisabled}
								className={cn(
									"relative h-40 w-full border border-foreground",
									areaClassName,
								)}
							>
								<ColorThumb className="ts-color-thumb" />
							</ColorArea>
							<ColorSlider
								colorSpace="hsb"
								channel="hue"
								isDisabled={isDisabled}
								value={color}
								onChange={changeColor}
								className="grid gap-2"
							>
								<Label className="font-bold text-xs uppercase">Hue</Label>
								<SliderTrack className="relative h-3 border border-foreground">
									<ColorThumb className="ts-color-thumb top-1/2" />
								</SliderTrack>
							</ColorSlider>
							{allowAlpha ? (
								<ColorSlider
									channel="alpha"
									isDisabled={isDisabled}
									value={color}
									onChange={changeColor}
									className="grid gap-2"
								>
									<Label className="font-bold text-xs uppercase">Opacity</Label>
									<SliderTrack className="ts-color-swatch relative h-3 border border-foreground">
										<ColorThumb className="ts-color-thumb top-1/2" />
									</SliderTrack>
								</ColorSlider>
							) : null}
							<div className="flex flex-wrap gap-2">
								{swatches.map((s) => (
									<Button
										key={s.value}
										aria-label={s.label}
										title={s.label}
										variant="outline"
										size="icon"
										motion="flat"
										className="ts-color-swatch size-7"
										aria-pressed={value === s.value}
										onPress={() => onChange(s.value)}
									>
										<span
											className="absolute inset-0.5"
											style={{ background: s.color ?? s.value }}
										/>
									</Button>
								))}
							</div>
						</Dialog>
					</Popover>
				</DialogTrigger>
				<Input
					id={id}
					aria-invalid={isInvalid || invalid || undefined}
					density={density}
					disabled={isDisabled}
					className="min-w-0 flex-1 font-mono"
					placeholder={allowEmpty ? "Inherit" : "#RRGGBB"}
					value={draft}
					onChange={(event) => {
						const text = event.target.value;
						setDraft(text);
						setInvalid(false);
					}}
					onBlur={commit}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							commit();
						}
						if (event.key === "Escape") {
							setDraft(value);
							setInvalid(false);
						}
					}}
				/>
				{allowEmpty ? (
					<Button
						aria-label={`Reset ${label.toLowerCase()}`}
						title="Reset to inherited value"
						variant="ghost"
						size="icon"
						motion="flat"
						disabled={isDisabled}
						onPress={() => {
							setDraft("");
							setInvalid(false);
							onChange("");
						}}
					>
						<RotateCcw className="size-4" />
					</Button>
				) : null}
			</div>
			{invalid || isInvalid ? (
				<span role="alert" className="text-destructive text-xs">
					Invalid color
				</span>
			) : null}
		</div>
	);
}
