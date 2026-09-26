"use client";

import type { ReactNode } from "react";
import {
	Tab as AriaTab,
	TabList as AriaTabList,
	type TabListProps as AriaTabListProps,
	TabPanel as AriaTabPanel,
	type TabPanelProps as AriaTabPanelProps,
	type TabProps as AriaTabProps,
	Tabs as AriaTabs,
	type TabsProps as AriaTabsProps,
} from "react-aria-components";
import cn from "~/lib/utils/cn";

export type TabsProps = Omit<AriaTabsProps, "children" | "className"> & {
	children: ReactNode;
	className?: string;
};

export function Tabs({
	children,
	className,
	...props
}: TabsProps): React.JSX.Element {
	return (
		<AriaTabs {...props} data-slot="tabs" className={cn("min-w-0", className)}>
			{children}
		</AriaTabs>
	);
}

export type TabListProps<T extends object> = Omit<
	AriaTabListProps<T>,
	"className"
> & {
	className?: string;
	density?: "compact" | "default";
};

export function TabList<T extends object>({
	className,
	density = "default",
	...props
}: TabListProps<T>): React.JSX.Element {
	return (
		<AriaTabList
			{...props}
			data-slot="tab-list"
			className={cn(
				"flex min-w-0 gap-1 overflow-x-auto border-foreground border-b-2",
				density === "compact" ? "px-3 py-2" : "px-4 py-3",
				className,
			)}
		/>
	);
}

export type TabProps = Omit<AriaTabProps, "children" | "className"> & {
	children: ReactNode;
	className?: string;
	density?: "compact" | "default";
};

export function Tab({
	children,
	className,
	density = "default",
	...props
}: TabProps): React.JSX.Element {
	return (
		<AriaTab
			{...props}
			data-slot="tab"
			className={cn(
				"flex shrink-0 cursor-pointer items-center justify-center gap-1.5 border-2 border-transparent font-black uppercase outline-none transition-[color,background-color,border-color] data-[disabled]:cursor-not-allowed data-[hovered]:border-foreground data-[selected]:border-foreground data-[hovered]:bg-secondary data-[selected]:bg-accent data-[hovered]:text-foreground data-[selected]:text-accent-foreground data-[disabled]:opacity-50 data-[focus-visible]:ring-4 data-[focus-visible]:ring-ring/40",
				density === "compact"
					? "min-h-10 px-2.5 py-1.5 text-[11px]"
					: "min-h-11 px-3 py-2 text-xs",
				className,
			)}
		>
			{children}
		</AriaTab>
	);
}

export type TabPanelProps = Omit<AriaTabPanelProps, "className"> & {
	className?: string;
};

export function TabPanel({
	className,
	...props
}: TabPanelProps): React.JSX.Element {
	return (
		<AriaTabPanel
			{...props}
			data-slot="tab-panel"
			className={cn(
				"min-w-0 outline-none data-[focus-visible]:ring-4 data-[focus-visible]:ring-ring/40",
				className,
			)}
		/>
	);
}
