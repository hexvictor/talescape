"use client";

import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import cn from "~/lib/utils/cn";

/**
 * Selects the active responsive breakpoint used by Tale Studio.
 *
 * @param props - Breakpoint selector props.
 * @param props.breakpointId - Current selected breakpoint id, or null for base.
 * @param props.breakpoints - Tale breakpoint options.
 * @param props.onChange - Receives the selected breakpoint id.
 * @returns Breakpoint select control, or null when only base exists.
 *
 * @example
 * <TaleStudioBreakpointSelect breakpointId={breakpointId} breakpoints={breakpoints} onChange={setBreakpointId} />
 */
export function TaleStudioBreakpointSelect({
	className,
}: { className?: string }): React.JSX.Element | null {
	const breakpoints = useTaleAppStore(
		(state) => state.document.tale.breakpoints,
	);
	const { breakpointId, setBreakpointId } = useTaleAppStoreShallow((state) => ({
		breakpointId: state.runtime.breakpointId,
		setBreakpointId: state.runtime.setBreakpointId,
	}));
	return breakpoints.length > 1 ? (
		<select
			className={cn(
				"h-9 min-w-0 rounded border border-foreground/12 bg-background px-2 text-center text-foreground text-xs outline-none",
				className,
			)}
			value={breakpointId ?? ""}
			onChange={(event) => setBreakpointId(event.target.value || null)}
		>
			<option value="">Base</option>
			{breakpoints.map((breakpoint) => (
				<option key={breakpoint.id} value={breakpoint.id}>
					{breakpoint.label}
				</option>
			))}
		</select>
	) : null;
}
