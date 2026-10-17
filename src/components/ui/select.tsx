"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	Header as AriaHeader,
	Select as AriaSelect,
	type SelectProps as AriaSelectProps,
	SelectValue as AriaSelectValue,
	type SelectValueProps as AriaSelectValueProps,
	type Key,
	ListBox,
	ListBoxItem,
	type ListBoxItemProps,
	ListBoxSection,
	type ListBoxSectionProps,
	Popover,
	type PopoverProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";
import { type ControlDensity, controlClassName } from "./control-styles";

export type SelectProps = Omit<
	AriaSelectProps<object>,
	"children" | "defaultSelectedKey" | "onSelectionChange" | "selectedKey"
> & {
	children: ReactNode;
	defaultValue?: Key;
	onValueChange?: (value: string) => void;
	value?: Key;
};

function Select({
	children,
	defaultValue,
	onValueChange,
	value,
	...props
}: SelectProps): React.JSX.Element {
	return (
		<AriaSelect
			data-reader-component="Select"
			data-reader-role="select"
			{...props}
			data-slot="select"
			defaultSelectedKey={defaultValue}
			selectedKey={value}
			onSelectionChange={(key) => onValueChange?.(String(key))}
		>
			{children}
		</AriaSelect>
	);
}

function SelectGroup<T extends object>({
	className,
	...props
}: ListBoxSectionProps<T>): React.JSX.Element {
	return (
		<ListBoxSection
			{...props}
			data-slot="select-group"
			className={cn("group/select-section", className)}
		/>
	);
}

export type SelectValueProps = Omit<
	AriaSelectValueProps<object>,
	"children"
> & {
	placeholder?: ReactNode;
};

function SelectValue({
	placeholder,
	...props
}: SelectValueProps): React.JSX.Element {
	return (
		<AriaSelectValue {...props} data-slot="select-value">
			{({ defaultChildren, isPlaceholder }) =>
				isPlaceholder && placeholder ? placeholder : defaultChildren
			}
		</AriaSelectValue>
	);
}

export type SelectTriggerProps = Omit<
	AriaButtonProps,
	"children" | "className"
> & {
	className?: string;
	children?: ReactNode;
	density?: ControlDensity;
	size?: "default" | "sm";
};

function SelectTrigger({
	children,
	className,
	density,
	size = "default",
	...props
}: SelectTriggerProps): React.JSX.Element {
	const resolvedDensity = density ?? (size === "sm" ? "compact" : "default");
	return (
		<AriaButton
			data-reader-component="SelectTrigger"
			data-reader-role="select-trigger"
			{...props}
			data-slot="select-trigger"
			data-size={size}
			className={controlClassName(
				resolvedDensity,
				cn(
					"flex w-fit items-center justify-between gap-2 whitespace-nowrap font-bold *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
					className,
				),
			)}
		>
			{children}
			<ChevronDownIcon aria-hidden="true" className="size-4 opacity-50" />
		</AriaButton>
	);
}

export type SelectContentProps = Omit<PopoverProps, "children"> & {
	children: ReactNode;
};

function SelectContent({
	children,
	className,
	...props
}: SelectContentProps): React.JSX.Element {
	return (
		<Popover
			data-reader-component="SelectContent"
			data-reader-role="select-content"
			{...props}
			data-slot="select-content"
			className={cn(
				"data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 z-50 max-h-[var(--available-height)] min-w-[var(--trigger-width)] overflow-y-auto border-2 border-foreground bg-popover text-popover-foreground shadow-[5px_5px_0_rgb(var(--foreground-rgb))] outline-none data-[entering]:animate-in data-[exiting]:animate-out",
				className,
			)}
		>
			<ListBox className="min-w-full p-1 outline-none">{children}</ListBox>
		</Popover>
	);
}

function SelectLabel({
	className,
	...props
}: React.ComponentProps<typeof AriaHeader>): React.JSX.Element {
	return (
		<AriaHeader
			{...props}
			data-slot="select-label"
			className={cn("px-2 py-1.5 text-muted-foreground text-xs", className)}
		/>
	);
}

export type SelectItemProps = Omit<
	ListBoxItemProps<object>,
	"children" | "id" | "value"
> & {
	children: ReactNode;
	value: Key;
};

function SelectItem({
	children,
	className,
	value,
	...props
}: SelectItemProps): React.JSX.Element {
	return (
		<ListBoxItem
			data-reader-component="SelectItem"
			data-reader-role="select-item"
			{...props}
			id={value}
			data-slot="select-item"
			className={cn(
				"group relative flex min-h-10 w-full cursor-default select-none items-center gap-2 py-1.5 pr-8 pl-2 font-bold text-sm outline-none data-[disabled]:pointer-events-none data-[focused]:bg-accent data-[focused]:text-accent-foreground data-[disabled]:opacity-50",
				className,
			)}
			textValue={typeof children === "string" ? children : undefined}
		>
			{children}
			<span className="absolute right-2 hidden size-4 items-center justify-center group-data-[selected]:flex">
				<CheckIcon aria-hidden="true" className="size-4" />
			</span>
		</ListBoxItem>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
};
