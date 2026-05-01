"use client";

import type { MouseEvent, ReactNode } from "react";

const authPagePaths = new Set(["/sign-in", "/sign-up"]);

type AuthPageLinkHandlerProps = {
	children: ReactNode;
};

export default function AuthPageLinkHandler({
	children,
}: AuthPageLinkHandlerProps) {
	const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
			"a[href]",
		);
		if (!link || (link.target && link.target !== "_self")) return;

		const url = new URL(link.href);
		if (url.origin !== window.location.origin) return;
		if (!authPagePaths.has(url.pathname)) return;

		event.preventDefault();
		window.location.assign(`${url.pathname}${url.search}${url.hash}`);
	};

	return <div onClickCapture={handleClickCapture}>{children}</div>;
}
