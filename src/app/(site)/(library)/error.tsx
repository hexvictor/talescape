"use client";

import * as Sentry from "@sentry/nextjs";
import { BookOpenText, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";

type LibraryErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

/** Renders a recoverable Library failure without exposing database details. */
export default function LibraryError({
	error,
	reset,
}: LibraryErrorProps): React.JSX.Element {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<PageShell
			as="section"
			decorations="site-background"
			data-reader-component="LibraryError"
			data-reader-role="error-page"
			className="grid place-items-center bg-background p-5 text-foreground"
		>
			<ComicPanel
				decorations="halftone-corner"
				accent="primary"
				className="w-full max-w-lg text-center"
				surfaceClassName="p-7 sm:p-10"
			>
				<BookOpenText
					size={44}
					strokeWidth={2.5}
					className="mx-auto mb-4 text-primary"
				/>
				<ComicRail accent="primary" className="mx-auto">
					Connection interrupted
				</ComicRail>
				<h1 className="font-display text-4xl uppercase leading-none">
					The Library missed a page
				</h1>
				<p className="mt-4 font-serif text-muted-foreground leading-7">
					The story database could not finish loading. A temporary network
					interruption is usually fixed by trying again.
				</p>
				<div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">
					<Button type="button" onClick={reset} variant="comic">
						<RefreshCw size={17} /> Try again
					</Button>
					<Button asChild shapes="slant-both" variant="outline">
						<Link href="/">
							<Home size={17} /> Go home
						</Link>
					</Button>
				</div>
				{error.digest ? (
					<p className="mt-6 border-foreground border-t-2 pt-4 font-mono text-[10px] text-muted-foreground uppercase">
						Reference: {error.digest}
					</p>
				) : null}
			</ComicPanel>
		</PageShell>
	);
}
