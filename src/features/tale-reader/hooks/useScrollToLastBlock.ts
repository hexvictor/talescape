import { useEffect } from "react";
import { useReaderStore } from "../contexts/ReaderStoreContext";

export function useScrollToLastBlock() {
  const lastBlockId = useReaderStore((s) => s.progress.lastBlockId);
  const isContentReady = useReaderStore((s) => s.isContentReady);
  const hasScrolledToInitialBlock = useReaderStore(
    (s) => s.hasScrolledToInitialBlock,
  );
  const setHasScrolledToInitialBlock = useReaderStore(
    (s) => s.setHasScrolledToInitialBlock,
  );
  const goToBlock = useReaderStore((s) => s.goToBlock);

  useEffect(() => {
    if (!isContentReady) return;
    if (hasScrolledToInitialBlock) return;
    if (lastBlockId == null) return;

    setHasScrolledToInitialBlock(true);
    goToBlock(lastBlockId, {
      scroll: true,
      duration: 0,
    });
  }, [
    isContentReady,
    hasScrolledToInitialBlock,
    lastBlockId,
    goToBlock,
    setHasScrolledToInitialBlock,
  ]);
}