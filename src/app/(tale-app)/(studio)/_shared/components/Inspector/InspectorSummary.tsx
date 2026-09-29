import { ArrowLeft, FileText } from "lucide-react";
import {
	DebugCard,
	DebugField,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type {
	ResolvedTaleElement,
	ResolvedTaleScene,
} from "~/app/(tale-app)/_shared/types";

/**
 * Renders the inspector title bar.
 *
 * @param props - Component props.
 * @param props.subtitle - Secondary title text.
 * @param props.title - Primary title text.
 * @returns Header markup.
 */
export function InspectorHeader({
	backLabel,
	onBack,
	subtitle,
	title,
}: {
	backLabel?: string;
	onBack?: () => void;
	subtitle: string;
	title: string;
}): React.JSX.Element {
	return (
		<header
			data-reader-component="InspectorHeader"
			data-reader-role="inspector-summary"
			data-studio-component="InspectorHeader"
			data-studio-role="inspector-summary"
			className="border-foreground/10 border-b bg-background/24 px-3 py-3"
		>
			{onBack ? (
				<button
					type="button"
					className="mb-2 flex h-8 items-center gap-2 border border-foreground/14 px-2 font-bold text-[10px] text-foreground/58 uppercase transition hover:border-foreground hover:bg-foreground/8 hover:text-foreground"
					onClick={onBack}
				>
					<ArrowLeft size={13} />
					{backLabel ?? "Back"}
				</button>
			) : null}
			<p className="truncate font-black text-primary text-xs uppercase">
				{title}
			</p>
			<p className="mt-1 truncate text-foreground/42 text-xs">{subtitle}</p>
		</header>
	);
}

/**
 * Renders key block metadata.
 *
 * @param props - Component props.
 * @param props.block - Inspected block.
 * @returns Scene summary.
 */
export function SceneSummary({
	block,
}: {
	block: ResolvedTaleScene;
}): React.JSX.Element {
	return (
		<DebugCard icon={<FileText size={15} />} title="Scene">
			<DebugField label="Id" value={block.id} />
			<DebugField label="Description" value={block.description} />
			<DebugField label="Branch" value={block.branchId} />
			<DebugField label="Page" value={block.pageId} />
			<DebugField label="Entry" value={block.entryId} />
			<DebugField label="Part" value={block.partId} />
			<DebugField label="Root Frame" value={block.rootFrameId} />
			<DebugField
				label="Frames"
				value={String(
					block.frameIds.filter((id) => id !== block.rootFrameId).length,
				)}
			/>
			<DebugField label="Elements" value={String(block.elementIds.length)} />
			<DebugField
				label="Flow"
				value={
					block.transition.flow.type === "linear"
						? block.transition.flow.direction
						: "stack"
				}
			/>
		</DebugCard>
	);
}

/**
 * Renders key Element metadata.
 *
 * @param props - Component props.
 * @param props.Element - Inspected Element.
 * @returns Element summary.
 */
export function ElementSummary({
	element,
}: {
	element: ResolvedTaleElement;
}): React.JSX.Element {
	return (
		<DebugCard title="Element">
			<DebugField label="Id" value={element.id} />
			<DebugField label="Type" value={element.type} />
			<DebugField label="Frame" value={element.frameId} />
			<DebugField label="Placement" value={element.placement.mode} />
			<DebugField label="Order" value={String(element.order)} />
			<DebugField
				label="Visible range"
				value={`${element.resolvedVisibleRange.start} - ${element.resolvedVisibleRange.end}`}
			/>
		</DebugCard>
	);
}
