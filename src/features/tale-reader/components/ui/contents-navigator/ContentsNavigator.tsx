"use client";

export default function ContentsNavigator() {
  // const { navigateToAnchor } = useReaderNavContext();
  // const currentEntryIndex = useReaderStore((s) => s.currentEntryIndex);
  // const getCurrentEntry = useReaderStore((s) => s.getCurrentEntry);
  // const getCurrentEntryId = useReaderStore((s) => s.getCurrentEntryId);
  // const getChapterIndex = useReaderStore((s) => s.getChapterIndex);
  // const taleEntries = useReaderStore((s) => s.tale.entries);
  // const getBlocksByEntryId = useReaderStore((s) => s.getBlocksByEntryId);
  // const hasEntryLevelBlock = useReaderStore((s) => s.hasEntryLevelBlock);
  // const uiVisible = useReaderStore((s) => s.uiVisible);
  // const { triggerScrollActivity } = useAutoScrollDelay();

  // const currentEntry = getCurrentEntry();
  // if (!currentEntry) return null;
  // const entryBlocks = getBlocksByEntryId(currentEntry.id);
  // // Special logic for single page + entry block
  // const hasSinglePageAndEntryBlock =
  //   currentEntry.pages.length === 1 && hasEntryLevelBlock(currentEntryIndex);

  // const currentEntryIncludesPages = currentEntry.pages.length > 0;

  return (
    <></>
    // <div
    //   className={clsx(
    //     "pointer-events-auto absolute top-6 right-8 z-100 flex items-center gap-2",
    //     "transition-opacity duration-300",
    //     uiVisible ? "opacity-100" : "pointer-events-none opacity-0"
    //   )}
    // >
    //   <DropdownMenu>
    //     <Tooltip>
    //       <TooltipTrigger asChild>
    //         <DropdownMenuTrigger asChild>
    //           <Button
    //             variant="secondary"
    //             size="sm"
    //             className="flex cursor-pointer items-center gap-1"
    //           >
    //             <span className="flex items-center gap-1 text-sm">
    //               {currentEntry.title}
    //             </span>
    //             <ChevronDown className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //       </TooltipTrigger>
    //       <TooltipContent side="bottom">Contents</TooltipContent>
    //     </Tooltip>

    //     <DropdownMenuContent align="start" className="z-100 max-h-[500px] w-72">
    //       <ScrollArea className="h-[200px]">
    //         <div className="px-1 pb-2">
    //           <DropdownMenuGroup>
    //             {taleEntries.map((entry, index) => {
    //               const isChapter = entry.type === "chapter";

    //               const chapterIndex = isChapter
    //                 ? getChapterIndex(entry.id)
    //                 : -1;

    //               return (
    //                 <DropdownMenuItem
    //                   key={entry.id}
    //                   className={clsx(
    //                     "flex cursor-pointer items-center gap-2",
    //                     index === currentEntryIndex && "bg-muted font-medium"
    //                   )}
    //                   onSelect={(e) => {
    //                     e.preventDefault();
    //                     triggerScrollActivity();
    //                     navigateToAnchor(index, 0);
    //                   }}
    //                 >
    //                   <span className="w-6 text-center text-muted-foreground text-xs">
    //                     {isChapter && chapterIndex ? (
    //                       chapterIndex + 1
    //                     ) : (
    //                       <EntryTypeIcon
    //                         type={entry.type}
    //                         className="h-3 w-3"
    //                       />
    //                     )}
    //                   </span>
    //                   <span className="truncate">{entry.title}</span>
    //                 </DropdownMenuItem>
    //               );
    //             })}
    //           </DropdownMenuGroup>
    //         </div>
    //       </ScrollArea>

    //       {currentEntryIncludesPages &&
    //         entryBlocks !== undefined &&
    //         entryBlocks?.length > 0 && (
    //           <>
    //             <DropdownMenuSeparator />
    //             <DropdownMenuLabel>
    //               Pages in "{currentEntry.title}"
    //             </DropdownMenuLabel>
    //             <DropdownMenuSeparator />
    //             <EntryPageButtons
    //               showAllBlocks={
    //                 hasSinglePageAndEntryBlock && entryBlocks.length === 2
    //               }
    //               triggerScrollActivity={triggerScrollActivity}
    //             />
    //           </>
    //         )}
    //     </DropdownMenuContent>
    //   </DropdownMenu>
    // </div>
  );
}
