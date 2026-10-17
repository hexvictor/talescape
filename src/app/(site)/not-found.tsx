import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";

function NotFound(): React.JSX.Element {
	return (
		<PageShell
			as="section"
			decorations="site-background"
			className="grid place-items-center p-5"
			data-reader-component="NotFound"
			data-reader-role="feedback-screen"
		>
			<ComicPanel
				decorations="brush-halftone"
				accent="primary"
				className="w-full max-w-2xl"
				surfaceClassName="p-8 sm:p-12"
				shapes="cut-opposite"
				slant="28px"
			>
				<ComicRail accent="primary">
					<BookOpen className="size-4" /> Missing panel
				</ComicRail>
				<p className="mt-6 font-display text-7xl text-primary uppercase leading-none sm:text-9xl">
					404
				</p>
				<h1 className="mt-2 font-display text-4xl uppercase sm:text-6xl">
					This page escaped the story.
				</h1>
				<p className="mt-5 max-w-lg font-serif text-muted-foreground leading-7">
					The route may have moved, changed title, or slipped into another
					branch.
				</p>
				<Button asChild className="mt-7" shapes="slant-right" variant="comic">
					<Link href="/">
						<ArrowLeft /> Return home
					</Link>
				</Button>
			</ComicPanel>
		</PageShell>
	);
}

export default NotFound;
