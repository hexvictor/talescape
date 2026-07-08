"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export function DebugTabs<T extends string>({
	active,
	iconOnly = false,
	onChange,
	tabs,
}: {
	active: T;
	iconOnly?: boolean;
	onChange: (tab: T) => void;
	tabs: { icon?: ReactNode; id: T; label: string }[];
}) {
	return (
		<div
			data-reader-component="DebugTabs"
			data-reader-role="debug-tab-list"
			className="flex gap-1 overflow-x-auto border-foreground/10 border-b px-3 py-2"
		>
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					className={clsx(
						"shrink-0 rounded px-2.5 py-1.5 font-bold text-[11px] transition",
						active === tab.id
							? "bg-primary text-background"
							: "text-foreground/54 hover:bg-foreground/8 hover:text-foreground",
					)}
					title={tab.label}
					onClick={() => onChange(tab.id)}
				>
					{iconOnly && tab.icon ? tab.icon : tab.label}
				</button>
			))}
		</div>
	);
}

export function DebugCard({
	children,
	componentName = "DebugCard",
	contentClassName,
	readerRole = "debug-section",
	title,
}: {
	children: ReactNode;
	componentName?: string;
	contentClassName?: string;
	readerRole?: string;
	title: string;
}) {
	return (
		<section
			data-reader-component={componentName}
			data-reader-role={readerRole}
			className="rounded-md border border-foreground/10 bg-foreground/[0.045] p-3"
		>
			<h3 className="mb-2 font-black text-[10px] text-primary uppercase tracking-[0.17em]">
				{title}
			</h3>
			<div className={clsx("grid grid-cols-2 gap-2", contentClassName)}>
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
			className="min-w-0 rounded border border-foreground/[0.06] bg-background/20 p-2"
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
			className={clsx(
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
	"min-w-0 rounded border border-foreground/12 bg-background/32 px-2 py-2 text-xs text-foreground outline-none focus:border-primary";
