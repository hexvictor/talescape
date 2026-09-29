"use client";

import type { MouseEvent, ReactNode } from "react";
import { TalescapeLogo } from "~/app/_shared/components/brand/TalescapeLogo";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";

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

	return (
		<main
			className="grid min-h-[calc(100svh-5rem)] flex-1 bg-background lg:grid-cols-[minmax(20rem,0.9fr)_minmax(28rem,1.1fr)]"
			onClickCapture={handleClickCapture}
		>
			<section className="relative hidden overflow-hidden border-foreground border-r-[5px] bg-[var(--comic-ink)] p-10 text-[var(--comic-cream)] lg:flex lg:flex-col lg:justify-between">
				<div className="comic-halftone absolute inset-0 opacity-15" />
				<TalescapeLogo
					className="relative z-10"
					markClassName="h-20"
					priority
					tone="dark-surface"
					wordmarkClassName="w-44"
				/>
				<div className="relative z-10 max-w-xl pb-8">
					<ComicRail accent="secondary">Your story continues</ComicRail>
					<p className="mt-6 font-display text-6xl uppercase leading-[0.88]">
						Keyframe back inside the frame.
					</p>
					<p className="mt-6 max-w-md font-serif text-[var(--comic-cream)]/75 text-lg leading-8">
						Keep your reading paths, worlds, and works in progress together.
					</p>
				</div>
			</section>
			<section className="flex items-center justify-center px-5 py-10 sm:px-10">
				<ComicPanel
					accent="primary"
					className="w-full max-w-[32rem] p-4 sm:p-7"
					decoration="strikes"
					shape="cut-opposite"
					slant="22px"
				>
					{children}
				</ComicPanel>
			</section>
		</main>
	);
}
