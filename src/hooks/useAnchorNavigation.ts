import { useCallback, useEffect } from "react";
import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";
import useScrollActivityDelay from "./useScrollActivityDelay";
import type {
  BlockMeta,
  NavigationOptions,
  NavigationTargetType,
} from "~/types/tale-reader/taleStructure";

export type NavigateToAnchorFunction = (
  id: number,
  options?: Partial<NavigationOptions>
) => void;

type NavigateToAnchorResolvedFunction = (
  block: BlockMeta,
  options?: Partial<Omit<NavigationOptions, "type">>
) => void;

export function useAnchorNavigation() {
  const { triggerScrollActivity, cancelScrollActivity } =
    useScrollActivityDelay();

  const setNavigationByBlock = useReaderStore((s) => s.setNavigationByBlock);
  const currentBlock = useReaderStore((s) => s.navigation?.block);

  const navigateToAnchor: NavigateToAnchorResolvedFunction = useCallback(
    (block, options) => {
      const { shouldNavigate = true, ignoreAnchorCheck = false } =
        options ?? {};
      const el = document.getElementById(`anchor-${block.anchorId}`);
      if (!el) return;

      if (shouldNavigate) setNavigationByBlock(block);

      const isDifferentAnchor = currentBlock?.anchorId !== block.anchorId;
      console.log(isDifferentAnchor, currentBlock?.anchorId, block.anchorId);
      console.log(el, ignoreAnchorCheck);
      if (ignoreAnchorCheck || isDifferentAnchor) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      triggerScrollActivity();
    },
    [setNavigationByBlock, currentBlock?.anchorId, triggerScrollActivity]
  );

  return {
    navigateToAnchor,
    cancelScrollActivity,
  };
}
