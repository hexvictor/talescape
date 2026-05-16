"use client";

import { useState } from "react";
import { DebugCard, DebugField, DebugTabList } from "./DebugPrimitives";
import { formatDate, formatList, yesNo } from "./debugFormatters";
import type { ProgressDebugState, ProgressDebugTab } from "./types";

const progressTabs: { id: ProgressDebugTab; label: string }[] = [
	{ id: "progress", label: "Progress" },
	{ id: "paths", label: "Paths" },
];

export function ProgressDebugPanel({
	progress,
}: {
	progress: ProgressDebugState;
}) {
	const [activeTab, setActiveTab] = useState<ProgressDebugTab>("progress");
	const data = progress.data;

	return (
		<div className="-m-3 sm:-m-4">
			<DebugTabList
				activeTab={activeTab}
				onChange={setActiveTab}
				tabs={progressTabs}
			/>

			<div className="p-3 sm:p-4">
				{activeTab === "progress" ? (
					<DebugCard title="Progress">
						<DebugField label="Last Block" value={data?.lastBlockId} />
						<DebugField
							label="Max Block Reached"
							value={data?.maxBlockIdReached}
						/>
						<DebugField
							label="Seen Blocks"
							value={data?.seenBlockIds?.length ?? 0}
						/>
						<DebugField
							label="Seen Block Progress"
							value={data?.seenBlockProgress}
						/>
						<DebugField
							label="Max Read Progress"
							value={data?.maxReadProgress}
						/>
						<DebugField
							label="Updated At"
							value={formatDate(data?.updatedAt)}
						/>
					</DebugCard>
				) : null}

				{activeTab === "paths" ? (
					<DebugCard title="Paths">
						<DebugField
							label="Active Path Ids"
							value={formatList(data?.activePathIds)}
						/>
						<DebugField
							label="Seen Path Ids"
							value={formatList(data?.seenPathIds)}
						/>
						<DebugField label="Saving" value={yesNo(progress.isSaving)} />
						<DebugField
							label="Tracking Paused"
							value={yesNo(progress.isTrackingPaused)}
						/>
					</DebugCard>
				) : null}
			</div>
		</div>
	);
}
