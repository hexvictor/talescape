"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import EntryTypeIcon, {
	getEntryTypeLabel,
} from "../EntryNavigator/EntryTypeIcon";

export default function PageNavigator() {
	return null;
	// const uiVisible = useReaderStore((s) => s.uiVisible);
	// const blocks = useReaderStore((s) => s.tale.sections[0]?.blocks ?? []);
	// const taleEntries = useReaderStore((s) => s.tale.entries);
	// const currentBlockIndex = useReaderStore((s) => s.currentBlockIndex);
	// const setCurrentBlockIndex = useReaderStore((s) => s.setCurrentBlockIndex);
	// const { triggerScrollActivity } = ();

	// const goToBlock = useCallback(
	//   (index: number) => {
	//     triggerScrollActivity();
	//     setCurrentBlockIndex(index);
	//     const el = document.getElementById(blocks[index]?.anchorId || "");
	//     if (el) {
	//       requestAnimationFrame(() => {
	//         el.scrollIntoView({ behavior: "auto", block: "start" });
	//       });
	//     }
	//   },
	//   [blocks, triggerScrollActivity, setCurrentBlockIndex],
	// );

	// const annotatedBlocks = useMemo(() => {
	//   const chapterEntries = taleEntries.filter((e) => e.type === "chapter");

	//   return blocks.map((block, index) => {
	//     const entry = taleEntries.find(
	//       (entry) =>
	//         entry.id === block.anchorId ||
	//         entry.pages.some((p) => p.id === block.anchorId),
	//     );

	//     const chapterIndex =
	//       entry?.type === "chapter" ? chapterEntries.indexOf(entry) : null;

	//     const entryBlocks = blocks.filter((b) =>
	//       entry?.pages.some((p) => p.id === b.anchorId),
	//     );

	//     const isEntryPageBlock = block.anchorId === entry?.id;
	//     const entryHasPage = blocks[index - 1]?.anchorId === entry?.id;
	//     const isFirstInEntry = entryBlocks[0]?.id === block.id;

	//     const shouldShowBadge =
	//       isEntryPageBlock ||
	//       (!isEntryPageBlock && isFirstInEntry && !entryHasPage);

	//     return {
	//       block,
	//       index,
	//       entry,
	//       chapterIndex,
	//       shouldShowBadge,
	//     };
	//   });
	// }, [blocks, taleEntries]);

	// const isFirst = currentBlockIndex === 0;
	// const isLast = currentBlockIndex === blocks.length - 1;

	// const goPrev = useCallback(() => {
	//   if (!isFirst) goToBlock(currentBlockIndex - 1);
	// }, [isFirst, currentBlockIndex, goToBlock]);

	// const goNext = useCallback(() => {
	//   if (!isLast) goToBlock(currentBlockIndex + 1);
	// }, [isLast, currentBlockIndex, goToBlock]);

	// return (
	//   <div
	//     className={clsx(
	//       "pointer-events-auto absolute right-8 bottom-6 z-50 flex items-center gap-2 transition-opacity duration-300",
	//       uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
	//     )}
	//   >
	//     <Tooltip>
	//       <TooltipTrigger asChild>
	//         <Button
	//           variant="outline"
	//           size="icon"
	//           onClick={goPrev}
	//           disabled={isFirst}
	//           className="h-6 w-6 cursor-pointer rounded-full shadow-lg hover:scale-105"
	//           aria-label="Previous page"
	//         >
	//           <ArrowLeft className="h-4 w-4" />
	//         </Button>
	//       </TooltipTrigger>
	//       <TooltipContent side="top">Previous</TooltipContent>
	//     </Tooltip>

	//     <DropdownMenu>
	//       <Tooltip>
	//         <TooltipTrigger asChild>
	//           <DropdownMenuTrigger disabled={blocks.length <= 1} asChild>
	//             <Button
	//               variant="outline"
	//               className="min-w-[120px] cursor-pointer"
	//             >
	//               Page {currentBlockIndex + 1} of {blocks.length}
	//             </Button>
	//           </DropdownMenuTrigger>
	//         </TooltipTrigger>
	//         <TooltipContent side="top">Select a page</TooltipContent>
	//       </Tooltip>

	//       <DropdownMenuContent
	//         align="center"
	//         className="relative overflow-hidden p-4 pr-0"
	//       >
	//         <ScrollArea className="max-h-[calc(350px-2rem)] overflow-auto">
	//           <div className="mt-1 grid min-w-[calc(4*2rem+3*0.5rem)] grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-2 pr-2">
	//             {annotatedBlocks.map(
	//               ({ block, index, entry, chapterIndex, shouldShowBadge }) => {
	//                 const isCurrent = index === currentBlockIndex;
	//                 const isChapter = entry?.type === "chapter";
	//                 const hasChapterIndex = chapterIndex != null;
	//                 const label = entry ? getEntryTypeLabel(entry.type) : "";
	//                 const hasTitle = !!entry?.title;
	//                 const tooltipText =
	//                   isChapter && hasChapterIndex
	//                     ? `Chapter ${chapterIndex + 1}`
	//                     : hasTitle
	//                       ? `${label}: ${entry.title}`
	//                       : label;

	//                 return (
	//                   <div key={block.id} className="relative">
	//                     <Button
	//                       variant={isCurrent ? "default" : "outline"}
	//                       size="sm"
	//                       className="h-8 w-8 cursor-pointer p-0 text-xs hover:scale-105"
	//                       onClick={() => goToBlock(index)}
	//                     >
	//                       {index + 1}
	//                     </Button>

	//                     {entry && shouldShowBadge && (
	//                       <Tooltip>
	//                         <TooltipTrigger asChild>
	//                           <Badge className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center bg-gray-300 p-0">
	//                             {isChapter && hasChapterIndex ? (
	//                               <span className="cursor-default text-[0.5rem] text-white">
	//                                 {chapterIndex + 1}
	//                               </span>
	//                             ) : (
	//                               <EntryTypeIcon
	//                                 type={entry.type}
	//                                 className="h-2 w-2 text-white"
	//                               />
	//                             )}
	//                           </Badge>
	//                         </TooltipTrigger>
	//                         <TooltipContent side="top">
	//                           {tooltipText}
	//                         </TooltipContent>
	//                       </Tooltip>
	//                     )}
	//                   </div>
	//                 );
	//               },
	//             )}
	//           </div>
	//         </ScrollArea>
	//       </DropdownMenuContent>
	//     </DropdownMenu>

	//     <Tooltip>
	//       <TooltipTrigger asChild>
	//         <Button
	//           variant="outline"
	//           size="icon"
	//           onClick={goNext}
	//           className="h-6 w-6 cursor-pointer rounded-full shadow-lg hover:scale-105"
	//           disabled={isLast}
	//           aria-label="Next page"
	//         >
	//           <ArrowRight className="h-4 w-4" />
	//         </Button>
	//       </TooltipTrigger>
	//       <TooltipContent side="top">Next</TooltipContent>
	//     </Tooltip>
	//   </div>
	// );
}
