import { useRef, useEffect } from "react";
import { useInView } from "motion/react";
import { useReaderNavContext } from "../contexts/ReaderNavContext";
import { useReaderStore } from "../contexts/ReaderStoreContext";

export function useAnchorInView(
  anchorId: number | null,
  type: "block" | "section" = "block"
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { amount: 0.4 });

  const { scrollToAnchor, navigateToAnchor } = useReaderNavContext();
  const isScrollActive = useReaderStore((s) => s.isScrollActive);
  const getTargetBlock = useReaderStore((s) => s.getTargetBlock);
  const currentBlock = useReaderStore((s) => s.navigation.block);

  const hasNavigated = useRef(false);

  useEffect(() => {
    if (
      !isScrollActive &&
      isInView &&
      anchorId !== null &&
      !hasNavigated.current
    ) {
      hasNavigated.current = true;

      requestAnimationFrame(() => {
        const block = getTargetBlock(anchorId, "block");
        if (!block) return;
        console.log("current index: ", currentBlock?.globalIndex);
        console.log("this block index: ", block.globalIndex);
        if (typeof block.anchorId !== "number") return;

        console.log(block.anchorId, block.id);
        // if (type === "section") {
        //   console.log("scroll");
        //   scrollToAnchor(block.anchorId);
        // }
        navigateToAnchor(block.anchorId);
      });
    } else if (!isInView) {
      hasNavigated.current = false;
    }
  }, [
    isInView,
    anchorId,
    getTargetBlock,
    isScrollActive,
    type,
    navigateToAnchor,
  ]);

  return ref;
}
