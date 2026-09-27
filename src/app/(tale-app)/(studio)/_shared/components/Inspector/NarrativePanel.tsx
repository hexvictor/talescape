"use client";

import { BookOpen, FileText, Play } from "lucide-react";
import { useState } from "react";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { Button } from "~/components/ui/button";
import { Tab, TabList, Tabs } from "~/components/ui/tabs";
import { useTaleStudioStore } from "../../hooks/useTaleStudioStore";

export function NarrativePanel({
	branchId,
	sceneId,
	frameId,
	keyframeId,
}: {
	branchId?: string;
	sceneId?: string;
	frameId?: string;
	keyframeId?: string;
}) {
	const tale = useTaleAppStore((state) => state.document.tale);
	const open = useTaleStudioStore(
		(state) => state.studioSelection.openInspector,
	);
	const [view, setView] = useState<"tree" | "distribution">("tree");
	const keyframes = tale.order.keyframeIds.flatMap((id) => {
		const item = tale.indexMap.keyframesById[id];
		return item &&
			(!branchId || item.branchId === branchId) &&
			(!sceneId || item.sceneId === sceneId) &&
			(!frameId || item.frameId === frameId) &&
			(!keyframeId || item.id === keyframeId)
			? [item]
			: [];
	});
	const pages = [
		...new Set(keyframes.flatMap((item) => (item.pageId ? [item.pageId] : []))),
	].flatMap((id) =>
		tale.indexMap.pagesById[id] ? [tale.indexMap.pagesById[id]] : [],
	);
	const parts = tale.order.partIds.flatMap((id) => {
		const part = tale.indexMap.partsById[id];
		return part && pages.some((page) => page.partId === id) ? [part] : [];
	});
	return (
		<section
			data-reader-component="NarrativePanel"
			data-reader-role="narrative-mapping"
			data-studio-component="NarrativePanel"
			data-studio-role="narrative-mapping"
			className="space-y-3 text-xs"
		>
			<Tabs
				selectedKey={view}
				onSelectionChange={(key) =>
					setView(String(key) as "distribution" | "tree")
				}
			>
				<TabList aria-label="Narrative view" density="compact">
					{(["tree", "distribution"] as const).map((mode) => (
						<Tab
							key={mode}
							className="flex-1 capitalize"
							density="compact"
							id={mode}
						>
							{mode}
						</Tab>
					))}
				</TabList>
			</Tabs>
			{parts.length === 0 ? (
				<p className="p-3 text-foreground/60">
					No pages assigned to these keyframes.
				</p>
			) : null}
			{parts.map((part) => {
				const partPages = pages.filter((page) => page.partId === part.id);
				return view === "distribution" ? (
					<div
						key={part.id}
						className="grid grid-cols-[minmax(0,1fr)_2fr_auto] items-center gap-2"
					>
						<span>{part.title}</span>
						<meter
							aria-label={`${part.title} page count`}
							min={0}
							max={Math.max(pages.length, 1)}
							value={partPages.length}
							className="w-full"
						/>
						<span>{partPages.length}</span>
					</div>
				) : (
					<details key={part.id} open className="border-b pb-2">
						<summary className="cursor-pointer py-2 font-bold">
							{part.title}{" "}
							<span className="float-right">{partPages.length}</span>
						</summary>
						{tale.order.entryIds.flatMap((id) => {
							const entry = tale.indexMap.entriesById[id];
							const entryPages = partPages.filter(
								(page) => page.entryId === id,
							);
							return entry && entryPages.length
								? [
										<details open key={id} className="ml-3 border-l pl-3">
											<summary className="cursor-pointer py-2">
												<BookOpen size={13} className="mr-2 inline" />
												{entry.title}
											</summary>
											{entryPages.map((page) => (
												<div
													key={page.id}
													className="flex flex-wrap items-center gap-2 py-1"
												>
													<FileText size={13} className="text-sky-500" />
													<span>
														{page.title ||
															`Page ${page.position.pageNumber ?? page.order + 1}`}
													</span>
													{keyframes
														.filter((item) => item.pageId === page.id)
														.map((item) => (
															<Button
																key={item.id}
																className="h-7 gap-1 border-primary/25 px-1.5 py-1 text-[10px]"
																motion="flat"
																size="sm"
																title={`${item.title}: ${tale.indexMap.scenesById[item.sceneId]?.title ?? item.sceneId}`}
																variant="outline"
																onPress={() =>
																	open({
																		type: "keyframe",
																		id: item.id,
																		sceneId: item.sceneId,
																	})
																}
															>
																<Play size={10} />
																{item.title}
															</Button>
														))}
												</div>
											))}
										</details>,
									]
								: [];
						})}
					</details>
				);
			})}
			<p className="border-t pt-3 font-semibold">
				Total pages <span className="float-right">{pages.length}</span>
			</p>
		</section>
	);
}
