import { useCallback } from "react";
import useScrollActivityDelay from "./useScrollActivityDelay";
import { useHandleProgressUpdate } from "./useHandleProgressUpdate";
import type {
  BlockMeta,
  NavigationOptions,
  NavigationTargetType,
} from "~/features/tale-reader/types/taleStructure";
import { useReaderStore } from "../contexts/ReaderStoreContext";

export type NavigateToAnchor = (
  id: number,
  options?: Partial<
    Omit<NavigationOptions, "scrollIntoView" | "bypassAnchorValidation">
  >
) => void;

export type ScrollToAnchor = (
  id: number,
  options?: Partial<Omit<NavigationOptions, "navigate">>
) => void;

export type GoToAnchor = (
  id: number,
  options?: Partial<NavigationOptions>
) => void;

export function useAnchorNavigation() {
  const { triggerScrollActivity, cancelScrollActivity } =
    useScrollActivityDelay();

  const setNavigationByBlock = useReaderStore((s) => s.setNavigationByBlock);
  const currentBlock = useReaderStore((s) => s.navigation?.block);
  const getTargetBlock = useReaderStore((s) => s.getTargetBlock);

  const updateProgress = useHandleProgressUpdate();

  const goToAnchor: GoToAnchor = useCallback(
    (id, options) => {
      const {
        type = "block",
        progress = true,
        navigate = true,
        scrollIntoView = true,
        bypassAnchorValidation = false,
      } = options ?? {};

      const block = getTargetBlock(id, type);
      if (!block) return;

      // const el = document.getElementById(
      //   `anchor-${block.isReelBlock ? "reel-" : ""}${block.anchorId}`
      // );
      const el = document.querySelector(`[data-anchor-id="${block.anchorId}"]`);
      if (!el) return;

      const isDifferentAnchor = currentBlock?.anchorId !== block.anchorId;
      if ((bypassAnchorValidation || isDifferentAnchor) && scrollIntoView) {
        triggerScrollActivity();
        el.scrollIntoView({ behavior: "auto", block: "start" });
      }

      if (navigate) setNavigationByBlock(block);
      if (progress) updateProgress(block.id);
    },
    [
      currentBlock?.anchorId,
      setNavigationByBlock,
      triggerScrollActivity,
      updateProgress,
      getTargetBlock,
    ]
  );

  const scrollToAnchor: ScrollToAnchor = useCallback(
    (id, options = {}) => {
      goToAnchor(id, { ...options, navigate: false });
    },
    [goToAnchor]
  );

  const navigateToAnchor: NavigateToAnchor = useCallback(
    (id, options = {}) => {
      goToAnchor(id, { ...options, scrollIntoView: false });
    },
    [goToAnchor]
  );

  return {
    goToAnchor,
    navigateToAnchor,
    scrollToAnchor,
    triggerScrollActivity,
    cancelScrollActivity,
  };
}
