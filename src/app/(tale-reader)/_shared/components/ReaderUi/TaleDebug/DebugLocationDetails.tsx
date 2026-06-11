import type { CompiledReader, ReaderLocation, Tale } from "../../../types";

type DebugLocationDetailsProps = {
	compiled: CompiledReader | null;
	location: ReaderLocation | null;
	tale: Tale;
};

/**
 * Renders route-relative numbers and database identifiers for the active location.
 *
 * @param props - Compiled flow, active location, and formatted tale.
 * @returns Compact active-location diagnostics.
 *
 * @example
 * <DebugLocationDetails compiled={compiled} location={location} tale={tale} />
 */
export function DebugLocationDetails({
	compiled,
	location,
	tale,
}: DebugLocationDetailsProps): React.JSX.Element | null {
	if (!location) return null;

	const blockNumber =
		(compiled?.anchorIndexByBlockId[location.blockId] ?? -1) + 1;
	const pageNumber = (compiled?.pageIndexById[location.pageId] ?? -1) + 1;
	const entryNumber = (compiled?.entryIndexById[location.entryId] ?? -1) + 1;
	const partNumber =
		(compiled?.contents.findIndex((part) => part.id === location.partId) ??
			-1) + 1;
	const branchNumber =
		tale.structure.branches.findIndex(
			(branch) => branch.id === location.branchId,
		) + 1;

	const items = [
		["Block", blockNumber, location.blockId],
		["Page", pageNumber, location.pageId],
		["Entry", entryNumber, location.entryId],
		["Part", partNumber, location.partId],
		["Branch", branchNumber, location.branchId],
	] as const;

	return (
		<span
			data-reader-component="DebugLocationDetails"
			data-reader-role="location-summary"
			className="mt-1 hidden grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] text-white/38 md:grid"
		>
			{items.map(([label, number, id]) => (
				<span key={label} className="truncate">
					{label} {number > 0 ? number : "?"} · {id}
				</span>
			))}
		</span>
	);
}
