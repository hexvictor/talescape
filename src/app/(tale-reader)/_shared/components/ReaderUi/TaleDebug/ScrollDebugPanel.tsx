"use client";

import { useState } from "react";
import { useReaderStore } from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import { DebugCard, DebugField, DebugTabList } from "./DebugPrimitives";
import { round, yesNo } from "./debugFormatters";
import type { ReaderDebugState, ScrollDebugTab } from "./types";

const scrollTabs: { id: ScrollDebugTab; label: string }[] = [
	{ id: "scroll", label: "Scroll" },
	{ id: "reader", label: "Reader" },
];

export function ScrollDebugPanel({
	reader,
}: {
	reader: ReaderDebugState;
}) {
	const [activeTab, setActiveTab] = useState<ScrollDebugTab>("scroll");
	const scrollState = useReaderStore((s) => s.debug.scroll);

	return (
		<div className="-m-3 sm:-m-4">
			<DebugTabList
				activeTab={activeTab}
				onChange={setActiveTab}
				tabs={scrollTabs}
			/>

			<div className="p-3 sm:p-4">
				{activeTab === "scroll" ? (
					<DebugCard title="Scroll">
						<DebugField
							label="Scroll PX"
							value={`${round(scrollState.scrollPx)}px`}
						/>
						<DebugField
							label="Max Scroll PX"
							value={`${round(scrollState.maxPx)}px`}
						/>
						<DebugField
							label="Progress"
							value={`${round(scrollState.progress * 100)}%`}
						/>
						<DebugField
							label="Viewport Height"
							value={`${round(scrollState.viewportHeight)}px`}
						/>
					</DebugCard>
				) : null}

				{activeTab === "reader" ? (
					<DebugCard title="Reader State">
						<DebugField
							label="Structure Mounted"
							value={yesNo(reader.isStructureMounted)}
						/>
						<DebugField
							label="Layout Ready"
							value={yesNo(reader.isLayoutReady)}
						/>
						<DebugField
							label="Initial Load Complete"
							value={yesNo(reader.isInitialLoadComplete)}
						/>
						<DebugField
							label="Restored Initial Position"
							value={yesNo(reader.hasRestoredInitialPosition)}
						/>
					</DebugCard>
				) : null}
			</div>
		</div>
	);
}
