import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProgressBar } from "~/components/data-display/progress-bar";
import { ComicPanel } from "~/components/layout/comic-panel";
import cn from "~/lib/utils/cn";

const accents = [
	"var(--talescape-cyan)",
	"var(--talescape-magenta)",
	"var(--talescape-yellow)",
] as const;

type TaleCardProps = {
	description: string;
	image: string;
	index: number;
	meta: string;
	progress: number;
	title: string;
};

/** Renders one compact continuation card on the landing shelf. */
export function TaleCard({
	description,
	image,
	index,
	meta,
	progress,
	title,
}: TaleCardProps): React.JSX.Element {
	return (
		<ComicPanel
			accent={accents[index % accents.length] ?? "var(--talescape-cyan)"}
			className={cn(
				"group hover:-translate-y-1 min-h-64 overflow-hidden transition-transform xl:grid xl:grid-cols-[1.05fr_0.95fr]",
				index === 0 && "-rotate-1",
				index === 1 && "rotate-1",
				index === 2 && "-rotate-[0.5deg]",
			)}
			decoration={index === 1 ? "strikes" : "dots"}
			shape={index % 2 === 0 ? "corner-top-right" : "corner-bottom-left"}
		>
			<div className="relative h-44 overflow-hidden border-foreground border-b-2 xl:h-full xl:min-h-64 xl:border-r-2 xl:border-b-0">
				<Image
					alt=""
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					fill
					sizes="(min-width: 1024px) 28rem, 100vw"
					src={image}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
				<span className="absolute top-3 left-3 bg-[var(--comic-ink)] px-2 py-1 font-black text-[10px] text-[var(--comic-cream)] uppercase">
					{meta}
				</span>
			</div>
			<div className="flex min-w-0 flex-1 flex-col p-5 xl:p-4">
				<h3 className="text-pretty font-display text-2xl uppercase leading-none">
					{title}
				</h3>
				<p className="mt-3 line-clamp-2 flex-1 text-muted-foreground text-sm leading-6">
					{description}
				</p>
				<div className="mt-4 flex items-center justify-between gap-2 font-black text-[10px] uppercase">
					<span>Chapter {index + 2}</span>
					<span>{progress}%</span>
				</div>
				<ProgressBar className="mt-1.5" value={progress} />
				<Link
					href="/official/branched"
					className="mt-3 inline-flex min-h-11 items-center justify-end gap-1 font-black text-xs uppercase focus:outline-none focus-visible:ring-4 focus-visible:ring-ring"
				>
					Continue <ChevronRight size={17} />
				</Link>
			</div>
		</ComicPanel>
	);
}
