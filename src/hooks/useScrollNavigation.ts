import { useEffect, useRef } from "react";
import { bookEntries } from "~/lib/data";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

export function useScrollNavigation() {
	const isProgrammaticScroll = useRef(false);
	const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const timeout = 1200;

	function scrollToEntry(entryNumber: number) {
		if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

		const entry = bookEntries[entryNumber];
		const el = document.getElementById(`entry-${entry?.id}`);
		if (el) {
			isProgrammaticScroll.current = true;
			el.scrollIntoView({ behavior: "smooth", block: "start" });

			scrollTimeout.current = setTimeout(() => {
				isProgrammaticScroll.current = false;
				// In the future update the progress in the DB when scrolling to the entry.
				// history.replaceState(null, "", `#entry-${entry?.id}`);
			}, timeout); // shorter timeout since you debounce it
		}
	}

	function scrollToPage(entryNumber: number, pageNumber: number) {
		if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

		const entry = bookEntries[entryNumber];
		const page = entry?.pages[pageNumber];
		const el = document.getElementById(`page-${page?.id}`);
		if (el) {
			isProgrammaticScroll.current = true;
			el.scrollIntoView({ behavior: "smooth", block: "start" });

			scrollTimeout.current = setTimeout(() => {
				isProgrammaticScroll.current = false;
				// In the future update the progress in the DB when scrolling to the page.
				// history.replaceState(null, "", `#page-${page?.id}`);
			}, timeout);
		}
	}

	useEffect(() => {
		// In the future save the progress of the tale in the DB and then scroll to the current page the user was on.

		// const hash = window.location.hash;
		// if (hash) {
		// 	const el = document.getElementById(hash.substring(1));
		// 	if (el) {
		// 		isProgrammaticScroll.current = true;
		// 		el.scrollIntoView({ behavior: "auto", block: "start" });

		// 		scrollTimeout.current = setTimeout(() => {
		// 			isProgrammaticScroll.current = false;
		// 		}, 600);
		// 	}
		// }

		const threshold = 0.6;
		const store = useTaleReaderStore.getState();

		const entryObserver = new IntersectionObserver(
			(entries) => {
				if (isProgrammaticScroll.current) return;

				for (const entry of entries) {
					if (entry.isIntersecting && entry.intersectionRatio > threshold) {
						const id = entry.target.getAttribute("data-entry-id");
						const index = bookEntries.findIndex((e) => e.id === id);
						if (index !== -1) {
							requestAnimationFrame(() => {
								store.setCurrentEntry(index);
								// In the future update the progress in the DB when scrolling to the page.

								// history.replaceState(null, "", `#page-${id}`);
							});
						}
					}
				}
			},
			{ threshold },
		);

		const pageObserver = new IntersectionObserver(
			(entries) => {
				if (isProgrammaticScroll.current) return;

				for (const entry of entries) {
					if (entry.isIntersecting && entry.intersectionRatio > threshold) {
						const id = entry.target.getAttribute("data-page-id");
						for (
							let entryIndex = 0;
							entryIndex < bookEntries.length;
							entryIndex++
						) {
							const entry = bookEntries[entryIndex];
							if (!entry) continue;
							const pageIndex = entry.pages.findIndex((p) => p.id === id);
							if (pageIndex !== -1) {
								requestAnimationFrame(() => {
									store.setCurrentEntry(entryIndex);
									store.setCurrentPage(pageIndex + 1);
									// In the future update the progress in the DB when scrolling to the page.

									// history.replaceState(null, "", `#entry-${id}`);
								});
								break;
							}
						}
					}
				}
			},
			{ threshold },
		);

		for (const entry of bookEntries) {
			const entryEl = document.getElementById(`entry-${entry.id}`);
			if (entryEl) {
				entryEl.setAttribute("data-entry-id", entry.id);
				entryObserver.observe(entryEl);
			}
			for (const page of entry.pages) {
				const pageEl = document.getElementById(`page-${page.id}`);
				if (pageEl) {
					pageEl.setAttribute("data-page-id", page.id);
					pageObserver.observe(pageEl);
				}
			}
		}

		return () => {
			entryObserver.disconnect();
			pageObserver.disconnect();
			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
		};
	}, []);

	return {
		scrollToEntry,
		scrollToPage,
		isProgrammaticScroll,
	};
}
