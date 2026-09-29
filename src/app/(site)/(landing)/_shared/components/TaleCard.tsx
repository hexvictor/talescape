import { Bookmark, Clock3, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ComicPanel } from "~/components/layout/comic-panel";

const accents = [
	"var(--talescape-magenta)",
	"var(--talescape-cyan)",
	"var(--talescape-yellow)",
] as const;

type TaleCardProps = {
	description: string;
	image: string;
	index: number;
	meta: string;
	title: string;
};

/** Renders one responsive tale card on the public discovery shelf. */
export function TaleCard({
	description,
	image,
	index,
	meta,
	title,
}: TaleCardProps): React.JSX.Element {
	const accent = accents[index % accents.length] ?? "var(--talescape-cyan)";
	const views = ["12.4K", "9.7K", "15.1K"][index] ?? "12K";
	const duration = ["6h", "5h", "8h"][index] ?? "6h";

	return (
		<Link
			href="/official/branched"
			className="block min-w-[15rem] snap-start md:min-w-0"
		>
			<ComicPanel
				accent={accent}
				as="article"
				className="group grid h-full min-h-[25rem] overflow-hidden sm:min-h-72 lg:grid-cols-[0.54fr_0.46fr]"
				decoration="dots"
				shape="corner-top-right"
				shadow={false}
			>
				<div className="relative min-h-48 overflow-hidden border-foreground border-b-2 lg:min-h-0 lg:border-r-2 lg:border-b-0">
					<Image
						alt=""
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						fill
						sizes="(min-width: 1024px) 18vw, 15rem"
						src={image}
					/>
					<div
						className="absolute inset-x-0 bottom-0 h-3"
						style={{ background: accent }}
					/>
				</div>
				<div className="flex min-w-0 flex-col p-4">
					<p
						className="font-black text-xs uppercase italic"
						style={{ color: accent }}
					>
						{meta}
					</p>
					<h2 className="mt-2 font-display text-2xl uppercase leading-none">
						{title}
					</h2>
					<p className="mt-3 line-clamp-3 flex-1 text-sm leading-5">
						{description}
					</p>
					<div className="mt-4 flex items-center gap-3 border-foreground/20 border-t pt-3 text-xs">
						<span className="inline-flex items-center gap-1">
							<Eye size={15} /> {views}
						</span>
						<span className="inline-flex items-center gap-1">
							<Clock3 size={15} /> {duration}
						</span>
						<Bookmark className="ml-auto" style={{ color: accent }} />
					</div>
				</div>
			</ComicPanel>
		</Link>
	);
}
