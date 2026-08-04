"use client";

import { useMemo } from "react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type { TaleBreakpoint } from "~/app/(tale-app)/_shared/types";

/**
 * Renders tale breakpoint authoring controls inside the editor settings modal.
 *
 * @returns Breakpoint authoring section.
 *
 * @example
 * <BreakpointSettings />
 */
export function BreakpointSettings(): React.JSX.Element {
	const {
		activeBreakpointId,
		breakpoints,
		onActiveBreakpointChange,
		setTale,
		tale,
	} = useTaleAppStoreShallow((state) => ({
		activeBreakpointId: state.runtime.breakpointId,
		breakpoints: state.document.tale.breakpoints,
		onActiveBreakpointChange: state.runtime.setBreakpointId,
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const orderedBreakpoints = useMemo(
		() => [...breakpoints].sort((left, right) => left.order - right.order),
		[breakpoints],
	);

	const onChange = (nextBreakpoints: TaleBreakpoint[]): void => {
		setTale(
			{
				...tale,
				breakpoints: nextBreakpoints,
			},
			{
				invalidation: "compilation",
				reason: "editor-breakpoints",
			},
		);
	};

	return (
		<section className="mt-6 border-foreground/10 border-t pt-6">
			<div className="mb-3 grid gap-3 sm:flex sm:items-center sm:justify-between">
				<div className="min-w-0">
					<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
						Tale Breakpoints
					</p>
					<p className="mt-1 text-foreground/45 text-xs">
						Define responsive breakpoint rules and pick the preview target.
					</p>
				</div>
				<button
					type="button"
					className="h-9 rounded border border-foreground/12 px-3 text-foreground/72 text-xs hover:bg-foreground/8 sm:justify-self-end"
					onClick={() =>
						onChange([
							...orderedBreakpoints,
							{
								id: createBreakpointId(),
								label: `Breakpoint ${orderedBreakpoints.length + 1}`,
								maxWidth: 768,
								order: orderedBreakpoints.length,
							},
						])
					}
				>
					Add breakpoint
				</button>
			</div>
			<div className="space-y-3">
				{orderedBreakpoints.map((breakpoint) => (
					<BreakpointCard
						key={breakpoint.id}
						activeBreakpointId={activeBreakpointId}
						breakpoint={breakpoint}
						breakpoints={orderedBreakpoints}
						onActiveBreakpointChange={onActiveBreakpointChange}
						onChange={onChange}
					/>
				))}
			</div>
		</section>
	);
}

/**
 * Renders one editable breakpoint card.
 *
 * @param props - Breakpoint card data and callbacks.
 * @param props.activeBreakpointId - Currently selected preview breakpoint id.
 * @param props.breakpoint - Breakpoint being edited.
 * @param props.breakpoints - Ordered breakpoint collection.
 * @param props.onActiveBreakpointChange - Receives the selected preview breakpoint.
 * @param props.onChange - Receives the updated breakpoint collection.
 * @returns Editable breakpoint card.
 *
 * @example
 * <BreakpointCard breakpoint={breakpoint} breakpoints={breakpoints} onChange={setBreakpoints} />
 */
function BreakpointCard({
	activeBreakpointId,
	breakpoint,
	breakpoints,
	onActiveBreakpointChange,
	onChange,
}: {
	activeBreakpointId: string | null;
	breakpoint: TaleBreakpoint;
	breakpoints: TaleBreakpoint[];
	onActiveBreakpointChange: (breakpointId: string | null) => void;
	onChange: (breakpoints: TaleBreakpoint[]) => void;
}): React.JSX.Element {
	return (
		<div className="min-w-0 rounded border border-foreground/10 bg-foreground/[0.03] p-3">
			<div className="mb-3 grid gap-2 sm:flex sm:items-center sm:justify-between">
				<label className="flex min-w-0 items-center gap-2 text-foreground/60 text-xs">
					<input
						type="radio"
						name="active-breakpoint"
						checked={activeBreakpointId === breakpoint.id}
						onChange={() => onActiveBreakpointChange(breakpoint.id)}
					/>
					Preview this breakpoint
				</label>
				<button
					type="button"
					className="text-foreground/50 text-xs hover:text-foreground"
					onClick={() => {
						const next = breakpoints
							.filter((item) => item.id !== breakpoint.id)
							.map((item, itemIndex) => ({ ...item, order: itemIndex }));
						onChange(next);
						if (activeBreakpointId === breakpoint.id) {
							onActiveBreakpointChange(null);
						}
					}}
				>
					Remove
				</button>
			</div>
			<div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
				<SettingsInput
					label="Label"
					value={breakpoint.label}
					onChange={(label) =>
						onChange(
							replaceBreakpoint(breakpoints, breakpoint.id, {
								...breakpoint,
								label,
							}),
						)
					}
				/>
				<label className="grid min-w-0 gap-1 text-foreground/52 text-xs">
					<span className="font-medium uppercase">Orientation</span>
					<select
						className="min-w-0 rounded border border-foreground/12 bg-background px-2 py-2 text-foreground text-xs"
						value={breakpoint.orientation ?? ""}
						onChange={(event) =>
							onChange(
								replaceBreakpoint(breakpoints, breakpoint.id, {
									...breakpoint,
									orientation:
										event.target.value === ""
											? undefined
											: (event.target.value as "landscape" | "portrait"),
								}),
							)
						}
					>
						<option value="">Any</option>
						<option value="portrait">Portrait</option>
						<option value="landscape">Landscape</option>
					</select>
				</label>
				<SettingsNumber
					label="Min width"
					value={breakpoint.minWidth}
					onChange={(minWidth) =>
						onChange(
							replaceBreakpoint(breakpoints, breakpoint.id, {
								...breakpoint,
								minWidth,
							}),
						)
					}
				/>
				<SettingsNumber
					label="Max width"
					value={breakpoint.maxWidth}
					onChange={(maxWidth) =>
						onChange(
							replaceBreakpoint(breakpoints, breakpoint.id, {
								...breakpoint,
								maxWidth,
							}),
						)
					}
				/>
				<SettingsNumber
					label="Min height"
					value={breakpoint.minHeight}
					onChange={(minHeight) =>
						onChange(
							replaceBreakpoint(breakpoints, breakpoint.id, {
								...breakpoint,
								minHeight,
							}),
						)
					}
				/>
				<SettingsNumber
					label="Max height"
					value={breakpoint.maxHeight}
					onChange={(maxHeight) =>
						onChange(
							replaceBreakpoint(breakpoints, breakpoint.id, {
								...breakpoint,
								maxHeight,
							}),
						)
					}
				/>
			</div>
		</div>
	);
}

/**
 * Renders one text field in the breakpoint settings form.
 *
 * @param props - Text field props.
 * @param props.label - Field label.
 * @param props.onChange - Receives edited text.
 * @param props.value - Current text value.
 * @returns Labeled text input.
 *
 * @example
 * <SettingsInput label="Label" value={label} onChange={setLabel} />
 */
function SettingsInput({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<label className="grid min-w-0 gap-1 text-foreground/52 text-xs">
			<span className="font-medium uppercase">{label}</span>
			<input
				className="min-w-0 rounded border border-foreground/12 bg-background px-2 py-2 text-foreground text-xs"
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</label>
	);
}

/**
 * Renders one optional numeric field in the breakpoint settings form.
 *
 * @param props - Number field props.
 * @param props.label - Field label.
 * @param props.onChange - Receives edited number, or undefined when empty.
 * @param props.value - Current optional number value.
 * @returns Labeled number input.
 *
 * @example
 * <SettingsNumber label="Max width" value={maxWidth} onChange={setMaxWidth} />
 */
function SettingsNumber({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: number | undefined) => void;
	value: number | undefined;
}): React.JSX.Element {
	return (
		<label className="grid min-w-0 gap-1 text-foreground/52 text-xs">
			<span className="font-medium uppercase">{label}</span>
			<input
				className="min-w-0 rounded border border-foreground/12 bg-background px-2 py-2 text-foreground text-xs"
				type="number"
				value={value ?? ""}
				onChange={(event) =>
					onChange(
						event.target.value === "" ? undefined : Number(event.target.value),
					)
				}
			/>
		</label>
	);
}

/**
 * Replaces one breakpoint inside an ordered breakpoint collection.
 *
 * @param breakpoints - Current breakpoint collection.
 * @param id - Breakpoint id to replace.
 * @param next - Replacement breakpoint.
 * @returns Updated breakpoint collection.
 *
 * @example
 * const next = replaceBreakpoint(breakpoints, id, breakpoint);
 */
function replaceBreakpoint<Breakpoint extends { id: string; order: number }>(
	breakpoints: Breakpoint[],
	id: string,
	next: Breakpoint,
): Breakpoint[] {
	return breakpoints.map((breakpoint) =>
		breakpoint.id === id ? next : breakpoint,
	);
}

/**
 * Creates a stable client-side id for a newly authored breakpoint draft.
 *
 * @returns Breakpoint draft id.
 *
 * @example
 * const id = createBreakpointId();
 */
function createBreakpointId(): string {
	return `breakpoint-${Date.now().toString(36)}`;
}
