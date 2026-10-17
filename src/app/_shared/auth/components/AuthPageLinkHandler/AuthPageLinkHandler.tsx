"use client";

import Image from "next/image";
import type { MouseEvent, ReactNode } from "react";
import { siteImages } from "~/app/(site)/_shared/components/landingCodexData";
import { TalescapeLogo } from "~/app/_shared/components/brand/TalescapeLogo";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { PageShell } from "~/components/layout/page-shell";
import { TaleImage } from "~/components/media/tale-image";

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
		<PageShell
			decorations="auth"
			data-site-component="AuthPageLinkHandler"
			data-site-role="auth-page"
			className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-[var(--ts-content-max)] flex-1 bg-background lg:grid-cols-[minmax(20rem,0.9fr)_minmax(28rem,1.1fr)]"
			onClickCapture={handleClickCapture}
		>
			<section className="relative flex min-h-56 overflow-hidden border-foreground border-b-2 p-6 text-[var(--comic-cream)] lg:min-h-full lg:flex-col lg:justify-between lg:border-r-[5px] lg:border-b-0 lg:p-10">
				<TaleImage
					alt="The illuminated city of the Ember Archive"
					className="object-cover"
					fill
					priority
					sizes="(min-width: 1024px) 42vw, 100vw"
					src={siteImages.emberCity}
					decorations="image-auth"
				/>
				<div className="site-hero-scrim absolute inset-0" />
				<TalescapeLogo
					className="relative z-10"
					markClassName="h-14 lg:h-20"
					priority
					tone="dark-surface"
					wordmarkClassName="w-36 lg:w-44"
				/>
				<div className="absolute right-5 bottom-5 left-5 z-10 max-w-xl lg:static lg:pb-8">
					<ComicRail accent="secondary">Your story continues</ComicRail>
					<p className="mt-4 font-display text-3xl uppercase leading-[0.88] sm:text-4xl lg:mt-6 lg:text-6xl">
						Every choice leaves a path.
					</p>
					<p className="mt-4 hidden max-w-md text-[var(--comic-cream)]/75 leading-7 sm:block lg:mt-6 lg:text-lg lg:leading-8">
						Keep your reading paths, worlds, and works in progress together.
					</p>
				</div>
			</section>
			<section className="flex items-center justify-center px-[var(--ts-page-gutter)] py-10 sm:py-14">
				<ComicPanel
					decorations="brush-halftone"
					accent="primary"
					className="w-full max-w-[32rem]"
					surfaceClassName="p-4 sm:p-7"
					shapes="cut-opposite"
					slant="22px"
				>
					{children}
				</ComicPanel>
			</section>
		</PageShell>
	);
}
