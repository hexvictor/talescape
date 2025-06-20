import { useRef, useEffect } from "react";
import type { AnchorBinding } from "~/types/tale-reader/taleStructure";
import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";
import { useInView } from "motion/react";

export function useAnchorInView(anchorId: number | null) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { amount: 0.4 });

  const setNavigationByBlock = useReaderStore((s) => s.setNavigationByBlock);
  const isScrollActive = useReaderStore((s) => s.isScrollActive);
  const getTargetBlock = useReaderStore((s) => s.getTargetBlock);

  useEffect(() => {
    if (!isScrollActive && isInView && anchorId !== null) {
      requestAnimationFrame(() => {
        const block = getTargetBlock(anchorId, "block");
        if (!block) return;
        setNavigationByBlock(block);
      });
    }
  }, [
    isInView,
    anchorId,
    getTargetBlock,
    isScrollActive,
    setNavigationByBlock,
  ]);

  return ref;
}
