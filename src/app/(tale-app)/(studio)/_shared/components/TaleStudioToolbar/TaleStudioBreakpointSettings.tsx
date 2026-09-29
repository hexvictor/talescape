"use client";

import { useMemo } from "react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type { TaleBreakpoint } from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

/**
 * Renders tale breakpoint authoring controls inside Studio settings.
 *
 * @returns Breakpoint authoring section.
 *
 * @example
 * <TaleStudioBreakpointSettings />
 */
export function TaleStudioBreakpointSettings(): React.JSX.Element {
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
				reason: "studio-breakpoints",
			},
		);
	};

	return (
		<section
			data-reader-component="TaleStudioBreakpointSettings"
			data-reader-role="breakpoint-settings"
			data-studio-component="TaleStudioBreakpointSettings"
			data-studio-role="breakpoint-settings"
			className="mt-6 border-foreground/10 border-t pt-6"
		>
			<div className="mb-3 grid gap-3 sm:flex sm:items-center sm:justify-between">
				<div className="min-w-0">
					<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
						Tale Breakpoints
					</p>
					<p className="mt-1 text-foreground/45 text-xs">
						Define responsive breakpoint rules and pick the preview target.
					</p>
				</div>
				<Button
					className="h-9 rounded border border-foreground/12 px-3 text-foreground/72 text-xs hover:bg-foreground/8 sm:justify-self-end"
					type="button"
					variant="ghost"
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
				</Button>
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
				<label
					className="flex min-w-0 items-center gap-2 text-foreground/60 text-xs"
					htmlFor={`active-breakpoint-${breakpoint.id}`}
				>
					<Input
						id={`active-breakpoint-${breakpoint.id}`}
						type="radio"
						name="active-breakpoint"
						checked={activeBreakpointId === breakpoint.id}
						onChange={() => onActiveBreakpointChange(breakpoint.id)}
					/>
					Preview this breakpoint
				</label>
				<Button
					className="text-foreground/50 text-xs hover:text-foreground"
					type="button"
					variant="ghost"
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
				</Button>
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
				<Field label="Orientation">
					<Select
						value={breakpoint.orientation ?? "any"}
						onValueChange={(value) =>
							onChange(
								replaceBreakpoint(breakpoints, breakpoint.id, {
									...breakpoint,
									orientation:
										value === "any"
											? undefined
											: (value as "landscape" | "portrait"),
								}),
							)
						}
					>
						<SelectTrigger className="w-full" density="compact">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="any">Any</SelectItem>
							<SelectItem value="portrait">Portrait</SelectItem>
							<SelectItem value="landscape">Landscape</SelectItem>
						</SelectContent>
					</Select>
				</Field>
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
		<Field label={label}>
			<Input
				className="min-w-0"
				density="compact"
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Field>
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
		<Field label={label}>
			<Input
				className="min-w-0"
				density="compact"
				type="number"
				value={value ?? ""}
				onChange={(event) =>
					onChange(
						event.target.value === "" ? undefined : Number(event.target.value),
					)
				}
			/>
		</Field>
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
