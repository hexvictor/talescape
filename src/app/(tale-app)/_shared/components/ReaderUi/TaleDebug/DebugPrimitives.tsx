"use client";

import { ChevronDown, PanelsTopLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Tab, TabList, Tabs } from "~/components/ui/tabs";
import cn from "~/lib/utils/cn";

export function DebugTabs<T extends string>({
	active,
	iconOnly = false,
	onChange,
	studio = false,
	tabs,
}: {
	active: T;
	iconOnly?: boolean;
	onChange: (tab: T) => void;
	studio?: boolean;
	tabs: { icon?: ReactNode; id: T; label: string }[];
}) {
	return (
		<Tabs
			selectedKey={active}
			className="contents"
			onSelectionChange={(key) => onChange(String(key) as T)}
		>
			<TabList
				aria-label="Debug sections"
				data-reader-component="DebugTabs"
				data-reader-role="debug-tab-list"
				data-studio-component={studio ? "DebugTabs" : undefined}
				data-studio-role={studio ? "inspector-tab-list" : undefined}
				density="compact"
			>
				{tabs.map((tab) => (
					<Tab
						aria-label={tab.label}
						density="compact"
						id={tab.id}
						key={tab.id}
					>
						<span className="flex items-center justify-center gap-1.5">
							{tab.icon}
							{iconOnly && tab.icon ? null : tab.label}
						</span>
					</Tab>
				))}
			</TabList>
		</Tabs>
	);
}

export function DebugCard({
	children,
	collapsible = true,
	componentName = "DebugCard",
	contentClassName,
	defaultOpen = true,
	icon,
	readerRole = "debug-section",
	title,
}: {
	children: ReactNode;
	collapsible?: boolean;
	componentName?: string;
	contentClassName?: string;
	defaultOpen?: boolean;
	icon?: ReactNode;
	readerRole?: string;
	title: string;
}) {
	const [open, setOpen] = useState(defaultOpen);
	const contentOpen = collapsible ? open : true;
	return (
		<section
			data-reader-component={componentName}
			data-reader-role={readerRole}
			className="@container min-w-0 border-2 border-foreground bg-card shadow-[3px_3px_0_var(--comic-teal)]"
		>
			<button
				type="button"
				aria-expanded={contentOpen}
				className={cn(
					"flex min-h-10 w-full items-center gap-2 px-3 text-left font-black text-[10px] text-primary uppercase tracking-[0.17em]",
					collapsible && "hover:bg-foreground/[0.045]",
				)}
				onClick={() => {
					if (collapsible) setOpen((current) => !current);
				}}
			>
				<span className="shrink-0" aria-hidden="true">
					{icon ?? <PanelsTopLeft size={14} />}
				</span>
				<span className="min-w-0 flex-1 truncate">{title}</span>
				{collapsible ? (
					<ChevronDown
						size={15}
						className={cn(
							"shrink-0 transition-transform",
							contentOpen && "rotate-180",
						)}
					/>
				) : null}
			</button>
			<div
				hidden={!contentOpen}
				className={cn(
					"grid @md:grid-cols-2 grid-cols-1 gap-2 border-foreground/12 border-t p-3",
					contentClassName,
				)}
			>
				{children}
			</div>
		</section>
	);
}

export function DebugField({
	label,
	value,
}: {
	label: string;
	value: ReactNode;
}) {
	return (
		<div
			data-reader-component="DebugField"
			data-reader-role="debug-field"
			className="min-w-0 border border-foreground/35 bg-background/20 p-2"
		>
			<p className="font-bold text-[10px] text-foreground/38 uppercase">
				{label}
			</p>
			<div className="mt-1 truncate text-foreground/78 text-xs">
				{value ?? "None"}
			</div>
		</div>
	);
}

export function Setting({
	children,
	className,
	componentName = "Setting",
	label,
	readerRole = "setting-field",
}: {
	children: ReactNode;
	className?: string;
	componentName?: string;
	label: string;
	readerRole?: string;
}) {
	return (
		<div
			data-reader-component={componentName}
			data-reader-role={readerRole}
			className={cn(
				"@container/setting grid min-w-0 gap-1 text-[11px] text-foreground/52",
				className,
			)}
		>
			<span className="font-bold uppercase">{label}</span>
			{children}
		</div>
	);
}

export const settingClassName =
	"min-h-11 min-w-0 border-2 border-foreground bg-card px-2 py-2 text-xs text-foreground shadow-[2px_2px_0_rgb(var(--foreground-rgb))] outline-none focus:border-ring focus:ring-2 focus:ring-ring/40";
