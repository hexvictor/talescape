"use client";

import { BookX, Home } from "lucide-react";
import Link from "next/link";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";
import { Panel } from "~/components/ui/panel";

function TaleNotFound(): React.JSX.Element {
	return (
		<PageShell
			fullscreen
			decorations="site-background"
			data-reader-component="TaleNotFound"
			data-reader-role="feedback-screen"
			className="ts-decoration-host fixed inset-0 isolate z-50 flex items-center justify-center bg-[var(--comic-blue)] p-5 text-center text-foreground"
		>
			<Panel
				shapes="cut-opposite"
				className="w-full max-w-lg text-center"
				surfaceClassName="p-6 sm:p-9"
				data-reader-component="TaleNotFound"
				data-reader-role="feedback-panel"
			>
				<BookX
					size={44}
					strokeWidth={2.5}
					className="mx-auto mb-4 text-primary"
				/>
				<p className="mb-3 font-black text-[11px] text-primary uppercase">
					Missing page
				</p>
				<h1 className="mb-4 font-display text-4xl uppercase leading-none">
					Tale not found
				</h1>
				<p className="font-serif text-muted-foreground leading-7">
					The tale you're looking for doesn't exist or is no longer available.
				</p>
				<Button asChild className="mt-6" variant="comic">
					<Link href="/">
						<Home size={17} /> Go to homepage
					</Link>
				</Button>
			</Panel>
		</PageShell>
	);
}

export default TaleNotFound;
