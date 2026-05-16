"use client";

import clsx from "clsx";
import type React from "react";
import { useId } from "react";

export function DebugCard({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}) {
	return (
		<section className="rounded-xl border border-white/10 bg-white/5 p-3">
			<p className="mb-2 font-bold text-[10px] text-white/55 uppercase tracking-[0.18em]">
				{title}
			</p>
			<div className="grid grid-cols-2 gap-2">{children}</div>
		</section>
	);
}

export function DebugField({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="min-w-0 rounded-lg bg-black/25 px-2.5 py-2">
			<p className="mb-1 truncate font-semibold text-[10px] text-white/45 uppercase tracking-wide">
				{label}
			</p>
			<p className="break-words text-[11px] text-white leading-tight sm:text-xs">
				{value ?? "-"}
			</p>
		</div>
	);
}

export function Chip({
	children,
	tone,
}: {
	children: React.ReactNode;
	tone:
		| "amber"
		| "blue"
		| "emerald"
		| "fuchsia"
		| "rose"
		| "sky"
		| "violet"
		| "zinc";
}) {
	return (
		<span
			className={clsx(
				"rounded-full border px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wide",
				tone === "amber" &&
					"border-amber-300/50 bg-amber-400/20 text-amber-100",
				tone === "blue" && "border-blue-300/50 bg-blue-400/20 text-blue-100",
				tone === "emerald" &&
					"border-emerald-300/50 bg-emerald-400/20 text-emerald-100",
				tone === "fuchsia" &&
					"border-fuchsia-300/50 bg-fuchsia-400/20 text-fuchsia-100",
				tone === "rose" && "border-rose-300/50 bg-rose-400/20 text-rose-100",
				tone === "sky" && "border-sky-300/50 bg-sky-400/20 text-sky-100",
				tone === "violet" &&
					"border-violet-300/50 bg-violet-400/20 text-violet-100",
				tone === "zinc" && "border-white/15 bg-white/10 text-white/70",
			)}
		>
			{children}
		</span>
	);
}

export function DebugTabList<T extends string>({
	activeTab,
	tabs,
	onChange,
}: {
	activeTab: T;
	tabs: { id: T; label: string }[];
	onChange: (tab: T) => void;
}) {
	const selectId = useId();

	return (
		<div className="border-white/10 border-b p-2">
			<label className="sr-only" htmlFor={selectId}>
				Debug tab
			</label>
			<select
				id={selectId}
				className="w-full rounded-lg border border-white/15 bg-black/70 px-3 py-2 font-semibold text-white text-xs outline-none sm:hidden"
				value={activeTab}
				onChange={(event) => onChange(event.target.value as T)}
			>
				{tabs.map((tab) => (
					<option key={tab.id} value={tab.id}>
						{tab.label}
					</option>
				))}
			</select>
			<div className="hidden gap-1 overflow-x-auto sm:flex">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						className={clsx(
							"shrink-0 rounded-full px-3 py-1.5 font-semibold text-xs transition",
							activeTab === tab.id
								? "bg-white text-black"
								: "bg-white/10 text-white/75 hover:bg-white/15",
						)}
						onClick={() => onChange(tab.id)}
					>
						{tab.label}
					</button>
				))}
			</div>
		</div>
	);
}
