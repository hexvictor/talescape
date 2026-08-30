import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { Button } from "~/components/ui/button";

function NotFound(): React.JSX.Element {
	return (
		<main className="comic-halftone grid min-h-[calc(100svh-5rem)] place-items-center bg-[var(--comic-ink)] p-5">
			<ComicPanel
				accent="primary"
				className="w-full max-w-2xl p-8 sm:p-12"
				decoration="strikes"
				shape="cut-opposite"
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
				<Button asChild className="mt-7" shape="slant-right" variant="comic">
					<Link href="/">
						<ArrowLeft /> Return home
					</Link>
				</Button>
			</ComicPanel>
		</main>
	);
}

export default NotFound;
