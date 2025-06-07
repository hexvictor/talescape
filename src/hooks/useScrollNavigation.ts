import { useEffect, useRef } from "react";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import useAutoScrollDelay from "./useAutoScrollDelay";

export function useScrollNavigation() {
  const isAutoScrolling = useTaleReaderStore((s) => s.isAutoScrolling);
  const isAutoScrollingRef = useRef(isAutoScrolling);

  const { triggerAutoScrollState, cancelAutoScrollTimer } =
    useAutoScrollDelay();
  const taleEntries = useTaleReaderStore((s) => s.tale.entries);
  const setNavigation = useTaleReaderStore((s) => s.setNavigation);

  function scrollToBlock(entryNumber: number, pageNumber?: number) {
    const entry = taleEntries[entryNumber];
    if (!entry) return;

    const page = pageNumber !== undefined ? entry.pages[pageNumber] : undefined;

    // Try page anchor first if pageNumber is defined, otherwise fallback logic
    let el = document.getElementById(`anchor-${page?.id ?? entry.id}`);

    // If pageNumber is undefined and the element for the entry is not found,
    // try falling back to the first page
    if (!pageNumber && !el && entry.pages.length > 0) {
      const fallbackPage = entry.pages[0];
      el = document.getElementById(`anchor-${fallbackPage?.id}`);
    }

    if (el) {
      setNavigation(entryNumber, pageNumber);
      el.scrollIntoView({ behavior: "smooth", block: "start" });

      triggerAutoScrollState();
    }
  }

  useEffect(() => {
    isAutoScrollingRef.current = isAutoScrolling;
  }, [isAutoScrolling]);

  useEffect(() => {
    // In the future save the progress of the tale in the DB and then scroll to the current page the user was on.

    // const hash = window.location.hash;
    // if (hash) {
    // 	const el = document.getElementById(hash.substring(1));
    // 	if (el) {
    // 		isProgrammaticScroll.current = true;
    // 		el.scrollIntoView({ behavior: "auto", block: "start" });

    // 		triggerAutoScrollState.current = setTimeout(() => {
    // 			isProgrammaticScroll.current = false;
    // 		}, 600);
    // 	}
    // }

    const threshold = 0.6;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!isAutoScrollingRef.current) {
          for (const entry of entries) {
            if (!entry.isIntersecting || entry.intersectionRatio <= threshold)
              continue;

            const id = entry.target.getAttribute("data-anchor-id");
            const type = entry.target.getAttribute("data-anchor-type");

            if (!id || !type) continue;

            if (type === "entry") {
              const entryIndex = taleEntries.findIndex((e) => e.id === id);
              if (entryIndex !== -1) {
                requestAnimationFrame(() => {
                  setNavigation(entryIndex);
                });
                continue; // If it's an entry, skip page logic
              }
            }

            if (type === "page") {
              for (
                let entryIndex = 0;
                entryIndex < taleEntries.length;
                entryIndex++
              ) {
                const entry = taleEntries[entryIndex];
                const pageIndex = entry?.pages.findIndex((p) => p.id === id);
                if (pageIndex !== undefined && pageIndex !== -1) {
                  requestAnimationFrame(() => {
                    setNavigation(entryIndex, pageIndex);
                  });
                  break;
                }
              }
            }
          }
        }
      },
      { threshold }
    );

    for (const entry of taleEntries) {
      const entryEl = document.getElementById(`anchor-${entry.id}`);
      if (entryEl) {
        entryEl.setAttribute("data-anchor-id", entry.id);
        entryEl.setAttribute("data-anchor-type", "entry");
        observer.observe(entryEl);
      }

      for (const page of entry.pages) {
        const pageEl = document.getElementById(`anchor-${page.id}`);
        if (pageEl) {
          pageEl.setAttribute("data-anchor-id", page.id);
          pageEl.setAttribute("data-anchor-type", "page");
          observer.observe(pageEl);
        }
      }
    }

    return () => {
      observer.disconnect();
      cancelAutoScrollTimer();
    };
  }, [taleEntries, setNavigation, cancelAutoScrollTimer]);

  return {
    scrollToBlock,
  };
}
