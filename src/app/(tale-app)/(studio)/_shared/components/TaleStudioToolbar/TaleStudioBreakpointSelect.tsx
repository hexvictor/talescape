"use client";

import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

const BASE_BREAKPOINT_VALUE = "__base__";

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
		<Select
			aria-label="Studio breakpoint"
			value={breakpointId ?? BASE_BREAKPOINT_VALUE}
			onValueChange={(value) =>
				setBreakpointId(value === BASE_BREAKPOINT_VALUE ? null : value)
			}
		>
			<SelectTrigger className={className} density="compact">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={BASE_BREAKPOINT_VALUE}>Base</SelectItem>
				{breakpoints.map((breakpoint) => (
					<SelectItem key={breakpoint.id} value={breakpoint.id}>
						{breakpoint.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	) : null;
}
