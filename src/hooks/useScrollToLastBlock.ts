import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";
import { useReaderNavContext } from "~/features/talereader/contexts/ReaderNavContext";
import { useEffect } from "react";

export function useScrollToLastBlock() {
  const { navigateToAnchor } = useReaderNavContext();
  const lastBlockId = useReaderStore((s) => s.progress.lastBlockId);
  const isContentReady = useReaderStore((s) => s.isContentReady);
  const hasScrolled = useReaderStore((s) => s.hasScrolled);
  const setHasScrolled = useReaderStore((s) => s.setHasScrolled);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only runs when isContentReady changes to true
  useEffect(() => {
    if (!hasScrolled) {
      if (isContentReady) {
        if (lastBlockId !== null) {
          setHasScrolled(true);
          navigateToAnchor(lastBlockId, {
            type: "block",
            shouldNavigate: false,
            ignoreAnchorCheck: true,
          });
        }
      }
    }
  }, [isContentReady]);
}
