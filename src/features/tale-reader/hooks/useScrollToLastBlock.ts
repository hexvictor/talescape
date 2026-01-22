import { useEffect } from "react";
import { useReaderNavContext } from "../contexts/ReaderNavContext";
import { useReaderStore } from "../contexts/ReaderStoreContext";

export function useScrollToLastBlock() {
  const { goToAnchor } = useReaderNavContext();
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
          goToAnchor(lastBlockId, {
            type: "block",
            navigate: false,
            bypassAnchorValidation: true,
          });
        }
      }
    }
  }, [isContentReady]);
}
