"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export function DebugTabs<T extends string>({
	active,
	onChange,
	tabs,
}: {
	active: T;
	onChange: (tab: T) => void;
	tabs: { id: T; label: string }[];
}) {
	return (
		<div
			data-reader-component="DebugTabs"
			data-reader-role="debug-tab-list"
			className="flex gap-1 overflow-x-auto border-white/10 border-b px-3 py-2"
		>
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					className={clsx(
						"shrink-0 rounded px-2.5 py-1.5 font-bold text-[11px] transition",
						active === tab.id
							? "bg-[#d9b56f] text-black"
							: "text-white/54 hover:bg-white/8 hover:text-white",
					)}
					onClick={() => onChange(tab.id)}
				>
					{tab.label}
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
			className="rounded-md border border-white/10 bg-white/[0.045] p-3"
		>
			<h3 className="mb-2 font-black text-[#d9b56f] text-[10px] uppercase tracking-[0.17em]">
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
			className="min-w-0 rounded border border-white/[0.06] bg-black/20 p-2"
		>
			<p className="font-bold text-[10px] text-white/38 uppercase">{label}</p>
			<div className="mt-1 truncate text-white/78 text-xs">
				{value ?? "None"}
			</div>
		</div>
	);
}

export function Setting({
	children,
	componentName = "Setting",
	label,
	readerRole = "setting-field",
}: {
	children: ReactNode;
	componentName?: string;
	label: string;
	readerRole?: string;
}) {
	return (
		<div
			data-reader-component={componentName}
			data-reader-role={readerRole}
			className="grid gap-1 text-[11px] text-white/52"
		>
			<span className="font-bold uppercase">{label}</span>
			{children}
		</div>
	);
}

export const settingClassName =
	"min-w-0 rounded border border-white/12 bg-black/32 px-2 py-2 text-xs text-white outline-none focus:border-[#d9b56f]";
